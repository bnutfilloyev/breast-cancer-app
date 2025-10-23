"""Tests for CRUD operations."""
from datetime import date

import pytest
from sqlmodel import Session

from app import models, crud, schemas


def test_create_patient_crud(session: Session):
    """Test creating a patient via CRUD."""
    patient = crud.create_patient(
        session,
        schemas.PatientCreate(
            full_name="Test Patient",
            medical_record_number="MRN999",
            date_of_birth=date(1990, 1, 1),
            gender=models.Gender.FEMALE,
        ),
    )
    assert patient.id is not None
    assert patient.full_name == "Test Patient"
    assert patient.is_active is True


def test_count_patients_crud(session: Session, multiple_patients: list[models.Patient]):
    """Test counting patients."""
    total = crud.count_patients(session)
    assert total == 5
    
    # Test with is_active filter
    crud.delete_patient(session, multiple_patients[0].id)
    active_count = crud.count_patients(session, is_active=True)
    assert active_count == 4


def test_search_patients_crud(session: Session, multiple_patients: list[models.Patient]):
    """Test searching patients."""
    results = crud.search_patients(session, "Patient 1")
    assert len(results) == 1
    assert "Patient 1" in results[0].full_name


def test_create_analysis_crud(session: Session, sample_patient: models.Patient):
    """Test creating an analysis via CRUD."""
    analysis = crud.create_analysis(
        session,
        schemas.AnalysisCreate(
            patient_id=sample_patient.id,
            mode="single",
            total_findings=3,
            dominant_label="Mass",
            dominant_category="benign",
            summary={},
        ),
    )
    assert analysis.id is not None
    assert analysis.patient_id == sample_patient.id
    assert analysis.status == models.AnalysisStatus.PENDING  # Default status


def test_complete_analysis_crud(session: Session, sample_patient: models.Patient):
    """Test completing an analysis."""
    analysis = crud.create_analysis(
        session,
        schemas.AnalysisCreate(
            patient_id=sample_patient.id,
            mode="single",
            total_findings=1,
            dominant_label="Test",
            dominant_category="benign",
            summary={},
        ),
    )
    
    completed = crud.complete_analysis(
        session,
        analysis,
        findings_description="Test findings",
        recommendations="Test recommendations",
    )
    
    assert completed.status == models.AnalysisStatus.COMPLETED
    assert completed.findings_description == "Test findings"
    assert completed.recommendations == "Test recommendations"
    assert completed.completed_at is not None


def test_count_analyses_crud(session: Session, sample_patient: models.Patient):
    """Test counting analyses."""
    # Create analyses
    for i in range(3):
        crud.create_analysis(
            session,
            schemas.AnalysisCreate(
                patient_id=sample_patient.id,
                mode="single",
                total_findings=i,
                dominant_label=None,
                dominant_category=None,
                summary={},
            ),
        )
    
    total = crud.count_analyses(session)
    assert total == 3
    
    # Test with status filter
    pending_count = crud.count_analyses(session, status=models.AnalysisStatus.PENDING)
    assert pending_count == 3


def test_search_analyses_crud(session: Session, sample_patient: models.Patient):
    """Test searching analyses."""
    analysis = crud.create_analysis(
        session,
        schemas.AnalysisCreate(
            patient_id=sample_patient.id,
            mode="single",
            total_findings=1,
            dominant_label="UniqueLabel",
            dominant_category="benign",
            summary={},
        ),
    )
    
    results = crud.search_analyses(session, "UniqueLabel")
    assert len(results) >= 1
    assert results[0].dominant_label == "UniqueLabel"


def test_get_statistics_crud(session: Session, sample_patient: models.Patient, sample_analysis: models.Analysis):
    """Test getting statistics."""
    stats = crud.get_statistics(session)
    assert stats["total_patients"] >= 1
    assert stats["total_analyses"] >= 1
    assert "active_patients" in stats
    assert "completed_analyses" in stats


def test_get_analysis_trends_crud(session: Session, sample_analysis: models.Analysis):
    """Test getting analysis trends."""
    trends = crud.get_analysis_trends(session, days=30)
    assert isinstance(trends, dict)
    assert "labels" in trends
    assert "analyses" in trends
    assert "findings" in trends


def test_get_findings_breakdown_crud(session: Session, sample_analysis: models.Analysis):
    """Test getting findings breakdown."""
    breakdown = crud.get_findings_breakdown(session)
    assert isinstance(breakdown, dict)
    assert "normal" in breakdown or "benign" in breakdown or "malignant" in breakdown



def test_create_analysis_image_crud(session: Session, sample_analysis: models.Analysis):
    """Test creating an analysis image."""
    image = crud.create_analysis_image(
        session,
        sample_analysis.id,
        schemas.AnalysisImageCreate(
            view_type=models.ImageViewType.TOP,
            file_id="test123",
            filename="test.jpg",
            original_filename="original_test.jpg",
            file_path="uploads/2025/10/24/test.jpg",
            relative_path="2025/10/24/test.jpg",
            thumbnail_path="uploads/thumbnails/2025/10/24/test.jpg",
            file_size=1024,
            file_hash="abc123def456",
            content_type="image/jpeg",
            width=512,
            height=512,
            detections_count=3,
            detections_data={"detections": []},
        ),
    )
    assert image.id is not None
    assert image.analysis_id == sample_analysis.id
    assert image.view_type == models.ImageViewType.TOP


def test_list_analysis_images_crud(session: Session, sample_analysis: models.Analysis):
    """Test listing analysis images."""
    # Create multiple images
    for view in [models.ImageViewType.TOP, models.ImageViewType.BOTTOM]:
        crud.create_analysis_image(
            session,
            sample_analysis.id,
            schemas.AnalysisImageCreate(
                view_type=view,
                file_id=f"test_{view}",
                filename=f"{view}.jpg",
                original_filename=f"original_{view}.jpg",
                file_path=f"uploads/2025/10/24/{view}.jpg",
                relative_path=f"2025/10/24/{view}.jpg",
                thumbnail_path=f"uploads/thumbnails/2025/10/24/{view}.jpg",
                file_size=1024,
                file_hash=f"hash_{view}",
                content_type="image/jpeg",
                width=512,
                height=512,
                detections_count=0,
                detections_data={"detections": []},
            ),
        )
    
    images = crud.list_analysis_images(session, sample_analysis.id)
    assert len(images) == 2
