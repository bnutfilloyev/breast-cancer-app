"""CRUD helpers for patient, analysis, and image entities."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, select

from . import models, schemas
from .exceptions import DatabaseError, NotFoundError, ValidationError
from .logger import get_logger

logger = get_logger(__name__)


# ============ Patient CRUD ============

def create_patient(session: Session, data: schemas.PatientCreate) -> models.Patient:
    """Create a new patient."""
    try:
        # Check for duplicate medical record number
        if data.medical_record_number:
            existing = session.exec(
                select(models.Patient).where(
                    models.Patient.medical_record_number == data.medical_record_number
                )
            ).first()
            if existing:
                raise ValidationError(
                    f"Patient with medical record number {data.medical_record_number} already exists"
                )
        
        patient = models.Patient(**data.model_dump())
        session.add(patient)
        session.commit()
        session.refresh(patient)
        logger.info(f"Created patient: {patient.id}")
        return patient
    except ValidationError:
        session.rollback()
        raise
    except Exception as exc:
        logger.error(f"Failed to create patient: {exc}")
        session.rollback()
        raise DatabaseError(f"Failed to create patient: {str(exc)}")


def list_patients(
    session: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> list[models.Patient]:
    """List patients with optional filtering."""
    try:
        statement = select(models.Patient)
        
        if search:
            search_filter = f"%{search}%"
            statement = statement.where(
                (models.Patient.full_name.ilike(search_filter)) |
                (models.Patient.medical_record_number.ilike(search_filter)) |
                (models.Patient.email.ilike(search_filter))
            )
        
        if is_active is not None:
            statement = statement.where(models.Patient.is_active == is_active)
        
        statement = statement.order_by(models.Patient.created_at.desc())
        statement = statement.offset(skip).limit(limit)
        
        return list(session.exec(statement).all())
    except Exception as exc:
        logger.error(f"Failed to list patients: {exc}")
        raise DatabaseError(f"Failed to list patients: {str(exc)}")


def count_patients(session: Session, is_active: Optional[bool] = None) -> int:
    """Count total patients."""
    try:
        statement = select(func.count(models.Patient.id))
        if is_active is not None:
            statement = statement.where(models.Patient.is_active == is_active)
        return session.exec(statement).one()
    except Exception as exc:
        logger.error(f"Failed to count patients: {exc}")
        raise DatabaseError(f"Failed to count patients: {str(exc)}")


def get_patient(session: Session, patient_id: int) -> models.Patient:
    """Get a patient by ID."""
    patient = session.get(models.Patient, patient_id)
    if not patient:
        raise NotFoundError(f"Patient with ID {patient_id} not found")
    return patient


def update_patient(
    session: Session, patient: models.Patient, data: schemas.PatientUpdate
) -> models.Patient:
    """Update a patient."""
    try:
        update_payload = data.model_dump(exclude_unset=True)
        for key, value in update_payload.items():
            setattr(patient, key, value)
        
        patient.updated_at = datetime.utcnow()
        session.add(patient)
        session.commit()
        session.refresh(patient)
        logger.info(f"Updated patient: {patient.id}")
        return patient
    except Exception as exc:
        logger.error(f"Failed to update patient: {exc}")
        session.rollback()
        raise DatabaseError(f"Failed to update patient: {str(exc)}")


def delete_patient(session: Session, patient_id: int) -> None:
    """Soft delete a patient."""
    try:
        patient = get_patient(session, patient_id)
        patient.is_active = False
        patient.updated_at = datetime.utcnow()
        session.add(patient)
        session.commit()
        logger.info(f"Deleted patient: {patient_id}")
    except NotFoundError:
        raise
    except Exception as exc:
        logger.error(f"Failed to delete patient: {exc}")
        session.rollback()
        raise DatabaseError(f"Failed to delete patient: {str(exc)}")


# ============ Analysis CRUD ============

def create_analysis(
    session: Session, data: schemas.AnalysisCreate
) -> models.Analysis:
    """Create a new analysis."""
    try:
        analysis = models.Analysis(**data.model_dump())
        session.add(analysis)
        session.commit()
        session.refresh(analysis)
        logger.info(f"Created analysis: {analysis.id}")
        return analysis
    except Exception as exc:
        logger.error(f"Failed to create analysis: {exc}")
        session.rollback()
        raise DatabaseError(f"Failed to create analysis: {str(exc)}")


def list_patient_analyses(
    session: Session, 
    patient_id: int,
    skip: int = 0,
    limit: int = 50,
) -> list[models.Analysis]:
    """List analyses for a patient."""
    try:
        statement = (
            select(models.Analysis)
            .where(models.Analysis.patient_id == patient_id)
            .order_by(models.Analysis.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(session.exec(statement).all())
    except Exception as exc:
        logger.error(f"Failed to list analyses: {exc}")
        raise DatabaseError(f"Failed to list analyses: {str(exc)}")


def list_all_analyses(
    session: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.AnalysisStatus] = None,
) -> list[models.Analysis]:
    """List all analyses with optional filtering."""
    try:
        statement = select(models.Analysis)
        
        if status:
            statement = statement.where(models.Analysis.status == status)
        
        statement = statement.order_by(models.Analysis.created_at.desc())
        statement = statement.offset(skip).limit(limit)
        
        return list(session.exec(statement).all())
    except Exception as exc:
        logger.error(f"Failed to list analyses: {exc}")
        raise DatabaseError(f"Failed to list analyses: {str(exc)}")


def get_analysis(session: Session, analysis_id: int) -> models.Analysis:
    """Get an analysis by ID."""
    analysis = session.get(models.Analysis, analysis_id)
    if not analysis:
        raise NotFoundError(f"Analysis with ID {analysis_id} not found")
    return analysis


def update_analysis(
    session: Session,
    analysis: models.Analysis,
    data: schemas.AnalysisUpdate,
) -> models.Analysis:
    """Update an analysis."""
    try:
        update_payload = data.model_dump(exclude_unset=True)
        for key, value in update_payload.items():
            setattr(analysis, key, value)
        
        analysis.updated_at = datetime.utcnow()
        session.add(analysis)
        session.commit()
        session.refresh(analysis)
        logger.info(f"Updated analysis: {analysis.id}")
        return analysis
    except Exception as exc:
        logger.error(f"Failed to update analysis: {exc}")
        session.rollback()
        raise DatabaseError(f"Failed to update analysis: {str(exc)}")


def complete_analysis(
    session: Session,
    analysis: models.Analysis,
    findings_description: Optional[str] = None,
    recommendations: Optional[str] = None,
) -> models.Analysis:
    """Mark an analysis as completed."""
    try:
        analysis.status = models.AnalysisStatus.COMPLETED
        analysis.completed_at = datetime.utcnow()
        analysis.updated_at = datetime.utcnow()
        if findings_description is not None:
            analysis.findings_description = findings_description
        if recommendations is not None:
            analysis.recommendations = recommendations
        session.add(analysis)
        session.commit()
        session.refresh(analysis)
        logger.info(f"Completed analysis: {analysis.id}")
        return analysis
    except Exception as exc:
        logger.error(f"Failed to complete analysis: {exc}")
        session.rollback()
        raise DatabaseError(f"Failed to complete analysis: {str(exc)}")


# ============ Analysis Image CRUD ============

def create_analysis_image(
    session: Session,
    analysis_id: int,
    data: schemas.AnalysisImageCreate,
) -> models.AnalysisImage:
    """Create a new analysis image."""
    try:
        image_data = data.model_dump()
        image_data["analysis_id"] = analysis_id
        image = models.AnalysisImage(**image_data)
        session.add(image)
        session.commit()
        session.refresh(image)
        logger.info(f"Created analysis image: {image.id}")
        return image
    except Exception as exc:
        logger.error(f"Failed to create analysis image: {exc}")
        session.rollback()
        raise DatabaseError(f"Failed to create analysis image: {str(exc)}")


def list_analysis_images(
    session: Session, analysis_id: int
) -> list[models.AnalysisImage]:
    """List images for an analysis."""
    try:
        statement = (
            select(models.AnalysisImage)
            .where(models.AnalysisImage.analysis_id == analysis_id)
            .order_by(models.AnalysisImage.created_at.asc())
        )
        return list(session.exec(statement).all())
    except Exception as exc:
        logger.error(f"Failed to list analysis images: {exc}")
        raise DatabaseError(f"Failed to list analysis images: {str(exc)}")


def get_analysis_image(session: Session, image_id: int) -> models.AnalysisImage:
    """Get an analysis image by ID."""
    image = session.get(models.AnalysisImage, image_id)
    if not image:
        raise NotFoundError(f"Analysis image with ID {image_id} not found")
    return image


# ============ Statistics ============

def get_statistics(session: Session) -> dict:
    """Get overall statistics."""
    try:
        total_patients = session.exec(
            select(func.count(models.Patient.id))
        ).one()
        
        active_patients = session.exec(
            select(func.count(models.Patient.id))
            .where(models.Patient.is_active == True)
        ).one()
        
        total_analyses = session.exec(
            select(func.count(models.Analysis.id))
        ).one()
        
        completed_analyses = session.exec(
            select(func.count(models.Analysis.id))
            .where(models.Analysis.status == models.AnalysisStatus.COMPLETED)
        ).one()
        
        pending_analyses = session.exec(
            select(func.count(models.Analysis.id))
            .where(models.Analysis.status == models.AnalysisStatus.PENDING)
        ).one()
        
        processing_analyses = session.exec(
            select(func.count(models.Analysis.id))
            .where(models.Analysis.status == models.AnalysisStatus.PROCESSING)
        ).one()
        
        failed_analyses = session.exec(
            select(func.count(models.Analysis.id))
            .where(models.Analysis.status == models.AnalysisStatus.FAILED)
        ).one()
        
        total_findings = session.exec(
            select(func.sum(models.Analysis.total_findings))
        ).one() or 0
        
        return {
            "total_patients": total_patients,
            "active_patients": active_patients,
            "total_analyses": total_analyses,
            "completed_analyses": completed_analyses,
            "pending_analyses": pending_analyses,
            "processing_analyses": processing_analyses,
            "failed_analyses": failed_analyses,
            "total_findings": int(total_findings),
        }
    except Exception as exc:
        logger.error(f"Failed to get statistics: {exc}")
        raise DatabaseError(f"Failed to get statistics: {str(exc)}")


def count_analyses(
    session: Session,
    status: Optional[models.AnalysisStatus] = None,
    patient_id: Optional[int] = None,
) -> int:
    """Count analyses with filters."""
    try:
        statement = select(func.count(models.Analysis.id))
        
        if status:
            statement = statement.where(models.Analysis.status == status)
        if patient_id:
            statement = statement.where(models.Analysis.patient_id == patient_id)
        
        return session.exec(statement).one()
    except Exception as exc:
        logger.error(f"Failed to count analyses: {exc}")
        raise DatabaseError(f"Failed to count analyses: {str(exc)}")


def search_patients(
    session: Session, 
    query: str, 
    limit: int = 10
) -> list[models.Patient]:
    """Search patients by name, MRN, email, phone."""
    try:
        search_filter = f"%{query}%"
        statement = (
            select(models.Patient)
            .where(
                (models.Patient.full_name.ilike(search_filter)) |
                (models.Patient.medical_record_number.ilike(search_filter)) |
                (models.Patient.email.ilike(search_filter)) |
                (models.Patient.phone.ilike(search_filter))
            )
            .where(models.Patient.is_active == True)
            .limit(limit)
        )
        return list(session.exec(statement).all())
    except Exception as exc:
        logger.error(f"Failed to search patients: {exc}")
        raise DatabaseError(f"Failed to search patients: {str(exc)}")


def search_analyses(
    session: Session, 
    query: str, 
    limit: int = 10
) -> list[models.Analysis]:
    """Search analyses by ID, dominant label, findings."""
    try:
        statement = select(models.Analysis)
        
        # Try to parse as ID
        if query.isdigit():
            statement = statement.where(models.Analysis.id == int(query))
        else:
            search_filter = f"%{query}%"
            statement = statement.where(
                (models.Analysis.dominant_label.ilike(search_filter)) |
                (models.Analysis.findings_description.ilike(search_filter))
            )
        
        statement = statement.order_by(models.Analysis.created_at.desc()).limit(limit)
        return list(session.exec(statement).all())
    except Exception as exc:
        logger.error(f"Failed to search analyses: {exc}")
        raise DatabaseError(f"Failed to search analyses: {str(exc)}")


def get_analysis_trends(
    session: Session,
    days: int = 30
) -> dict:
    """Get analysis trends for the last N days."""
    try:
        from datetime import datetime, timedelta
        from collections import defaultdict
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get all analyses from start_date
        statement = (
            select(models.Analysis)
            .where(models.Analysis.created_at >= start_date)
            .order_by(models.Analysis.created_at.asc())
        )
        analyses = session.exec(statement).all()
        
        # Group by date
        daily_data = defaultdict(lambda: {"count": 0, "findings": 0})
        
        for analysis in analyses:
            date_key = analysis.created_at.strftime("%Y-%m-%d")
            daily_data[date_key]["count"] += 1
            daily_data[date_key]["findings"] += analysis.total_findings or 0
        
        # Generate labels and values
        labels = []
        counts = []
        findings = []
        
        for i in range(days):
            date = (datetime.utcnow() - timedelta(days=days-i-1)).strftime("%Y-%m-%d")
            labels.append(date)
            counts.append(daily_data[date]["count"])
            findings.append(daily_data[date]["findings"])
        
        return {
            "labels": labels,
            "analyses": counts,
            "findings": findings,
        }
    except Exception as exc:
        logger.error(f"Failed to get analysis trends: {exc}")
        raise DatabaseError(f"Failed to get analysis trends: {str(exc)}")


def get_findings_breakdown(session: Session) -> dict:
    """Get breakdown of findings by category."""
    try:
        # Count by dominant category
        normal_count = session.exec(
            select(func.count(models.Analysis.id))
            .where(models.Analysis.dominant_category == "normal")
        ).one()
        
        benign_count = session.exec(
            select(func.count(models.Analysis.id))
            .where(models.Analysis.dominant_category == "benign")
        ).one()
        
        malignant_count = session.exec(
            select(func.count(models.Analysis.id))
            .where(models.Analysis.dominant_category == "malignant")
        ).one()
        
        return {
            "normal": normal_count,
            "benign": benign_count,
            "malignant": malignant_count,
        }
    except Exception as exc:
        logger.error(f"Failed to get findings breakdown: {exc}")
        raise DatabaseError(f"Failed to get findings breakdown: {str(exc)}")

