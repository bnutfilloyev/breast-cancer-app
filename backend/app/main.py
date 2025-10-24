"""FastAPI application that serves breast cancer detection results."""

from __future__ import annotations

import asyncio
import io
from pathlib import Path
from typing import Dict, Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlmodel import Session
from PIL import Image, UnidentifiedImageError

from . import crud, models, schemas
from .config import get_settings
from .database import get_session, init_db
from .file_manager import file_manager
from .logger import get_logger, setup_logging
from .middleware import ExceptionHandlerMiddleware, LoggingMiddleware, RequestIDMiddleware
from .model_service import InferenceService, get_inference_service
from .schemas import InferenceResponse, ViewPrediction

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Get settings
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "API for running inference on a custom vision model trained to detect breast cancer "
        "findings across clinical imaging views."
    ),
)

# Add middleware
app.add_middleware(ExceptionHandlerMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    """Initialize database on startup."""
    logger.info("Starting application...")
    await init_db()
    logger.info("Database initialized")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    """Cleanup on shutdown."""
    logger.info("Shutting down application...")
    # Cleanup temp files
    file_manager.cleanup_temp_files()


@app.get("/health")
async def health() -> Dict[str, str]:
    """Simple liveness probe."""
    return {"status": "ok", "version": settings.app_version}



def _summarise_predictions(
    mode: schemas.InferenceMode, views: Dict[str, ViewPrediction]
) -> tuple[int, Optional[str], Optional[schemas.RiskCategory], Dict[str, object]]:
    total = 0
    severity_order = {"normal": 0, "benign": 1, "malignant": 2}
    category_counts: Dict[str, int] = {key: 0 for key in severity_order}
    label_counts: Dict[str, int] = {}
    view_payload: Dict[str, Dict[str, object]] = {}
    dominant = {
        "score": -1,
        "confidence": -1.0,
        "label": None,
        "category": None,
    }

    for key, prediction in views.items():
        detections = prediction.detections
        detection_dicts = [det.model_dump() for det in detections]
        view_payload[key] = {
            "size": prediction.size.model_dump(),
            "detections": detection_dicts,
            "detection_count": len(detections),
        }
        total += len(detections)

        for det in detections:
            category_counts[det.category] += 1
            label_counts[det.label] = label_counts.get(det.label, 0) + 1
            severity_score = severity_order.get(det.category, -1)
            if (
                severity_score > dominant["score"]
                or (
                    severity_score == dominant["score"]
                    and det.confidence > dominant["confidence"]
                )
            ):
                dominant.update(
                    {
                        "score": severity_score,
                        "confidence": det.confidence,
                        "label": det.label,
                        "category": det.category,
                    }
                )

    summary = {
        "mode": mode,
        "views": view_payload,
        "totals": {
            "total_findings": total,
            "category_counts": category_counts,
            "label_counts": label_counts,
        },
    }
    dominant_label = dominant["label"]
    dominant_category = dominant["category"]
    return total, dominant_label, dominant_category, summary


def _analysis_to_summary(analysis: models.Analysis) -> schemas.AnalysisSummary:
    """Convert Analysis model to AnalysisSummary schema."""
    return schemas.AnalysisSummary(
        id=analysis.id,
        patient_id=analysis.patient_id,
        mode=analysis.mode,  # type: ignore[arg-type]
        status=analysis.status,
        total_findings=analysis.total_findings,
        dominant_label=analysis.dominant_label,
        dominant_category=analysis.dominant_category,  # type: ignore[arg-type]
        summary=analysis.summary,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )


def _patient_to_schema(session: Session, patient: models.Patient) -> schemas.PatientRead:
    """Convert Patient model to PatientRead schema."""
    analyses = crud.list_patient_analyses(session, patient.id)
    return schemas.PatientRead(
        id=patient.id,
        full_name=patient.full_name,
        medical_record_number=patient.medical_record_number,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        phone=patient.phone,
        email=patient.email,
        address=patient.address,
        notes=patient.notes,
        is_active=patient.is_active,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
        analyses=[_analysis_to_summary(a) for a in analyses],
    )


# ============ INFERENCE ENDPOINTS ============

@app.post("/infer/multi", response_model=InferenceResponse)
async def infer_multi(
    lcc: UploadFile = File(..., description="Left Craniocaudal view image."),
    rcc: UploadFile = File(..., description="Right Craniocaudal view image."),
    lmlo: UploadFile = File(..., description="Left Mediolateral Oblique view image."),
    rmlo: UploadFile = File(..., description="Right Mediolateral Oblique view image."),
    patient_id: Optional[int] = None,
    service: InferenceService = Depends(get_inference_service),
    session: Session = Depends(get_session),
) -> InferenceResponse:
    """
    Run inference across four anatomical views with file storage.
    
    Steps:
    1. Validate patient (if provided)
    2. Create analysis record (status=PROCESSING)
    3. Read and predict all images
    4. Save images and create AnalysisImage records
    5. Update analysis with results (status=COMPLETED)
    6. Return inference response
    """
    logger.info(f"Starting multi inference (patient_id={patient_id})")
    
    # 1. Validate patient
    patient = None
    if patient_id:
        try:
            patient = crud.get_patient(session, patient_id)
        except Exception as exc:
            logger.error(f"Patient validation failed: {exc}")
            raise HTTPException(status_code=404, detail="Patient not found")
    
    # 2. Create analysis (PROCESSING)
    try:
        analysis = crud.create_analysis(
            session,
            schemas.AnalysisCreate(
                patient_id=patient_id,
                mode="multi",
                status=models.AnalysisStatus.PROCESSING,
            )
        )
    except Exception as exc:
        logger.error(f"Failed to create analysis: {exc}")
        raise HTTPException(status_code=500, detail="Failed to create analysis")
    
    try:
        # 3. Read images and run predictions
        uploads = {"lcc": lcc, "rcc": rcc, "lmlo": lmlo, "rmlo": rmlo}
        images = await _read_images(uploads)
        predictions = await _predict_async(service, images)
        
        # 4. Save files and create AnalysisImage records
        for view_name, upload_file in uploads.items():
            try:
                # Reset file pointer
                await upload_file.seek(0)
                
                # Save file
                file_info = await file_manager.save_upload(
                    upload_file,
                    patient_id=patient_id,
                    analysis_id=analysis.id,
                    view_name=view_name,
                )
                
                # Get prediction data
                prediction = predictions[view_name]
                
                # Create AnalysisImage
                crud.create_analysis_image(
                    session,
                    analysis.id,
                    schemas.AnalysisImageCreate(
                        view_type=models.ImageViewType[view_name.upper()],
                        file_id=file_info["file_id"],
                        filename=file_info["filename"],
                        original_filename=file_info["original_filename"],
                        file_path=file_info["file_path"],
                        relative_path=file_info["relative_path"],
                        thumbnail_path=file_info.get("thumbnail_path"),
                        file_size=file_info["file_size"],
                        file_hash=file_info["file_hash"],
                        content_type=file_info.get("content_type"),
                        width=prediction.size.width,
                        height=prediction.size.height,
                        detections_count=len(prediction.detections),
                        detections_data={"detections": [d.model_dump() for d in prediction.detections]},
                    )
                )
            except Exception as exc:
                logger.error(f"Failed to save {view_name} image: {exc}")
                # Continue with other images
        
        # 5. Update analysis with results
        total, dominant_label, dominant_category, summary = _summarise_predictions("multi", predictions)
        
        crud.update_analysis(
            session,
            analysis,
            schemas.AnalysisUpdate(
                status=models.AnalysisStatus.COMPLETED,
                total_findings=total,
                dominant_label=dominant_label,
                dominant_category=dominant_category,
                summary=summary,
            )
        )
        
        logger.info(f"Multi inference completed: analysis_id={analysis.id}")
        
        # 6. Return response
        return InferenceResponse(
            mode="multi",
            views=predictions,
            model=service.model_info,
            analysis_id=analysis.id,
        )
        
    except Exception as exc:
        # Mark analysis as FAILED
        try:
            crud.update_analysis(
                session,
                analysis,
                schemas.AnalysisUpdate(status=models.AnalysisStatus.FAILED)
            )
        except:
            pass
        
        logger.error(f"Multi inference failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(exc)}")


@app.post("/infer/single", response_model=InferenceResponse)
async def infer_single(
    image: UploadFile = File(..., description="Single-view image under review."),
    patient_id: Optional[int] = None,
    service: InferenceService = Depends(get_inference_service),
    session: Session = Depends(get_session),
) -> InferenceResponse:
    """Run inference on a single suspicious image with file storage."""
    logger.info(f"Starting single inference (patient_id={patient_id})")
    
    # Validate patient
    if patient_id:
        try:
            patient = crud.get_patient(session, patient_id)
        except Exception:
            raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create analysis
    try:
        analysis = crud.create_analysis(
            session,
            schemas.AnalysisCreate(
                patient_id=patient_id,
                mode="single",
                status=models.AnalysisStatus.PROCESSING,
            )
        )
    except Exception as exc:
        logger.error(f"Failed to create analysis: {exc}")
        raise HTTPException(status_code=500, detail="Failed to create analysis")
    
    try:
        # Read file content first (before closing)
        await image.seek(0)
        file_content = await image.read()
        
        # Create PIL image from bytes
        pil_image = Image.open(io.BytesIO(file_content)).convert("RGB")
        
        # Run prediction
        prediction = await asyncio.to_thread(service.predict, pil_image)
        
        # Save file - create new BytesIO with content and reset position
        temp_file = io.BytesIO(file_content)
        temp_file.seek(0)
        temp_file.name = image.filename or "image.jpg"
        
        # Create new UploadFile instance with correct parameters
        from starlette.datastructures import UploadFile as StarletteUploadFile
        temp_upload = StarletteUploadFile(
            filename=image.filename or "image.jpg",
            file=temp_file,
        )
        
        file_info = await file_manager.save_upload(
            temp_upload,
            patient_id=patient_id,
            analysis_id=analysis.id,
            view_name="single",
        )
        
        # Create AnalysisImage
        crud.create_analysis_image(
            session,
            analysis.id,
            schemas.AnalysisImageCreate(
                view_type=models.ImageViewType.SINGLE,
                file_id=file_info["file_id"],
                filename=file_info["filename"],
                original_filename=file_info["original_filename"],
                file_path=file_info["file_path"],
                relative_path=file_info["relative_path"],
                thumbnail_path=file_info.get("thumbnail_path"),
                file_size=file_info["file_size"],
                file_hash=file_info["file_hash"],
                content_type=file_info.get("content_type"),
                width=prediction.size.width,
                height=prediction.size.height,
                detections_count=len(prediction.detections),
                detections_data={"detections": [d.model_dump() for d in prediction.detections]},
            )
        )
        
        # Update analysis
        total, dominant_label, dominant_category, summary = _summarise_predictions("single", {"image": prediction})
        
        crud.update_analysis(
            session,
            analysis,
            schemas.AnalysisUpdate(
                status=models.AnalysisStatus.COMPLETED,
                total_findings=total,
                dominant_label=dominant_label,
                dominant_category=dominant_category,
                summary=summary,
            )
        )
        
        logger.info(f"Single inference completed: analysis_id={analysis.id}")
        
        return InferenceResponse(
            mode="single",
            views={"image": prediction},
            model=service.model_info,
            analysis_id=analysis.id,
        )
        
    except Exception as exc:
        # Mark as FAILED
        try:
            crud.update_analysis(
                session,
                analysis,
                schemas.AnalysisUpdate(status=models.AnalysisStatus.FAILED)
            )
        except:
            pass
        
        logger.error(f"Single inference failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(exc)}")


# ============ HELPER FUNCTIONS ============

async def _read_image(upload: UploadFile, view: str) -> Image.Image:
    """Read an uploaded file into a PIL image, validating the content."""
    try:
        content = await upload.read()
        image = Image.open(io.BytesIO(content))
        return image.convert("RGB")
    except UnidentifiedImageError as exc:
        raise HTTPException(
            status_code=400, detail=f"{view} view must be a valid image file."
        ) from exc
    finally:
        await upload.close()


async def _read_images(uploads: Dict[str, UploadFile]) -> Dict[str, Image.Image]:
    """Read multiple uploads asynchronously into PIL images."""
    tasks = [_read_image(upload, view=key) for key, upload in uploads.items()]
    images_list = await asyncio.gather(*tasks)
    return dict(zip(uploads.keys(), images_list))


async def _predict_async(
    service: InferenceService, images: Dict[str, Image.Image]
) -> Dict[str, ViewPrediction]:
    """Run model predictions asynchronously for a batch of PIL images."""
    tasks = [asyncio.to_thread(service.predict, image) for image in images.values()]
    predictions_list = await asyncio.gather(*tasks)
    return dict(zip(images.keys(), predictions_list))


# ============ FILE SERVING ENDPOINTS ============

@app.get("/files/images/{year}/{month}/{day}/{filename}")
async def serve_image(year: str, month: str, day: str, filename: str):
    """Serve uploaded images."""
    try:
        file_path = file_manager.images_dir / year / month / day / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Image not found")
        return FileResponse(file_path)
    except Exception as exc:
        logger.error(f"Failed to serve image: {exc}")
        raise HTTPException(status_code=404, detail="Image not found")


@app.get("/files/thumbnails/{year}/{month}/{day}/{filename}")
async def serve_thumbnail(year: str, month: str, day: str, filename: str):
    """Serve thumbnail images."""
    try:
        file_path = file_manager.thumbnails_dir / year / month / day / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Thumbnail not found")
        return FileResponse(file_path)
    except Exception as exc:
        logger.error(f"Failed to serve thumbnail: {exc}")
        raise HTTPException(status_code=404, detail="Thumbnail not found")


# ============ STATISTICS ENDPOINTS ============

@app.get("/statistics", response_model=schemas.StatisticsResponse)
def get_statistics(session: Session = Depends(get_session)):
    """Get overall statistics for dashboard."""
    stats = crud.get_statistics(session)
    return schemas.StatisticsResponse(**stats)


@app.get("/statistics/trends")
def get_trends(
    days: int = 30,
    session: Session = Depends(get_session),
):
    """Get trend data for charts."""
    trends = crud.get_analysis_trends(session, days=days)
    return trends


@app.get("/statistics/findings")
def get_findings_breakdown(session: Session = Depends(get_session)):
    """Get breakdown of findings by category."""
    breakdown = crud.get_findings_breakdown(session)
    return breakdown


# ============ SEARCH ENDPOINTS ============

@app.get("/search")
def global_search(
    q: str,
    session: Session = Depends(get_session),
):
    """Global search across patients and analyses."""
    if not q or len(q) < 2:
        return {"patients": [], "analyses": []}
    
    patients = crud.search_patients(session, q, limit=10)
    analyses = crud.search_analyses(session, q, limit=10)
    
    return {
        "patients": [
            {
                "id": p.id,
                "full_name": p.full_name,
                "medical_record_number": p.medical_record_number,
                "created_at": p.created_at.isoformat(),
            }
            for p in patients
        ],
        "analyses": [_analysis_to_summary(a) for a in analyses],
    }


# ============ PATIENT CRUD ENDPOINTS ============

@app.post("/patients", response_model=schemas.PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: schemas.PatientCreate, session: Session = Depends(get_session)
) -> schemas.PatientRead:
    """Create a new patient."""
    patient = crud.create_patient(session, payload)
    return _patient_to_schema(session, patient)


@app.get("/patients", response_model=schemas.PatientListResponse)
def list_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    session: Session = Depends(get_session),
) -> schemas.PatientListResponse:
    """List all patients with pagination and filters."""
    patients = crud.list_patients(session, skip=skip, limit=limit, search=search, is_active=is_active)
    total = crud.count_patients(session, is_active=is_active)
    
    items = [
        schemas.PatientListItem(
            id=patient.id,
            full_name=patient.full_name,
            medical_record_number=patient.medical_record_number,
            gender=patient.gender,
            date_of_birth=patient.date_of_birth,
            created_at=patient.created_at,
            is_active=patient.is_active,
        )
        for patient in patients
    ]
    
    return schemas.PatientListResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        page_size=limit,
        total_pages=(total + limit - 1) // limit,
    )


@app.get("/patients/{patient_id}", response_model=schemas.PatientRead)
def retrieve_patient(
    patient_id: int, session: Session = Depends(get_session)
) -> schemas.PatientRead:
    """Get a single patient by ID."""
    patient = crud.get_patient(session, patient_id)
    return _patient_to_schema(session, patient)


@app.patch("/patients/{patient_id}", response_model=schemas.PatientRead)
def update_patient(
    patient_id: int,
    payload: schemas.PatientUpdate,
    session: Session = Depends(get_session),
) -> schemas.PatientRead:
    """Update a patient."""
    patient = crud.get_patient(session, patient_id)
    updated = crud.update_patient(session, patient, payload)
    return _patient_to_schema(session, updated)


@app.delete("/patients/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    session: Session = Depends(get_session),
):
    """Soft delete a patient."""
    crud.delete_patient(session, patient_id)
    return None


# ============ ANALYSIS CRUD ENDPOINTS ============

@app.get("/analyses", response_model=schemas.AnalysisListResponse)
def list_analyses(
    skip: int = 0,
    limit: int = 50,
    status: Optional[models.AnalysisStatus] = None,
    patient_id: Optional[int] = None,
    session: Session = Depends(get_session),
):
    """List all analyses with pagination and filters."""
    analyses = crud.list_all_analyses(session, skip=skip, limit=limit, status=status)
    total = crud.count_analyses(session, status=status, patient_id=patient_id)
    
    return schemas.AnalysisListResponse(
        items=[_analysis_to_summary(a) for a in analyses],
        total=total,
        page=skip // limit + 1,
        page_size=limit,
    )


@app.get("/analyses/{analysis_id}", response_model=schemas.AnalysisRead)
def get_analysis(
    analysis_id: int,
    session: Session = Depends(get_session),
):
    """Get a single analysis with images."""
    analysis = crud.get_analysis(session, analysis_id)
    images = crud.list_analysis_images(session, analysis_id)
    
    return schemas.AnalysisRead(
        **_analysis_to_summary(analysis).model_dump(),
        findings_description=analysis.findings_description,
        recommendations=analysis.recommendations,
        updated_at=analysis.updated_at,
        images=[
            schemas.AnalysisImageRead(**img.model_dump())
            for img in images
        ],
    )


@app.patch("/analyses/{analysis_id}", response_model=schemas.AnalysisRead)
def update_analysis(
    analysis_id: int,
    payload: schemas.AnalysisUpdate,
    session: Session = Depends(get_session),
):
    """Update an analysis (findings, recommendations)."""
    analysis = crud.get_analysis(session, analysis_id)
    updated = crud.update_analysis(session, analysis, payload)
    images = crud.list_analysis_images(session, analysis_id)
    
    return schemas.AnalysisRead(
        **_analysis_to_summary(updated).model_dump(),
        findings_description=updated.findings_description,
        recommendations=updated.recommendations,
        updated_at=updated.updated_at,
        images=[
            schemas.AnalysisImageRead(**img.model_dump())
            for img in images
        ],
    )


@app.delete("/analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: int,
    session: Session = Depends(get_session),
):
    """Delete an analysis and its associated images."""
    logger.info(f"Deleting analysis {analysis_id}")
    try:
        analysis = crud.get_analysis(session, analysis_id)
        crud.delete_analysis(session, analysis)
        logger.info(f"Successfully deleted analysis {analysis_id}")
    except Exception as exc:
        logger.error(f"Failed to delete analysis {analysis_id}: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(exc)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

