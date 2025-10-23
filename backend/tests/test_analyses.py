"""Tests for analysis CRUD endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app import models, crud, schemas


def test_list_analyses(client: TestClient, sample_analysis: models.Analysis):
    """Test listing all analyses."""
    response = client.get("/analyses")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) >= 1


def test_list_analyses_by_status(client: TestClient, session: Session, sample_patient: models.Patient):
    """Test filtering analyses by status."""
    # Create analyses with different statuses
    crud.create_analysis(
        session,
        schemas.AnalysisCreate(
            patient_id=sample_patient.id,
            mode="single",
            total_findings=0,
            dominant_label=None,
            dominant_category=None,
            summary={},
        ),
    )
    
    response = client.get("/analyses?status=processing")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["status"] == "processing"


def test_list_analyses_pagination(client: TestClient, session: Session, sample_patient: models.Patient):
    """Test analysis list pagination."""
    # Create multiple analyses
    for i in range(5):
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
    
    response = client.get("/analyses?skip=0&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 3


def test_get_analysis(client: TestClient, sample_analysis: models.Analysis):
    """Test retrieving a single analysis."""
    response = client.get(f"/analyses/{sample_analysis.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_analysis.id
    assert data["patient_id"] == sample_analysis.patient_id
    assert "images" in data
    assert "findings_description" in data
    assert "recommendations" in data


def test_get_analysis_not_found(client: TestClient):
    """Test retrieving non-existent analysis."""
    response = client.get("/analyses/99999")
    assert response.status_code == 404


def test_update_analysis(client: TestClient, sample_analysis: models.Analysis):
    """Test updating an analysis."""
    response = client.patch(
        f"/analyses/{sample_analysis.id}",
        json={
            "findings_description": "Updated findings",
            "recommendations": "Updated recommendations",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["findings_description"] == "Updated findings"
    assert data["recommendations"] == "Updated recommendations"


def test_update_analysis_status(client: TestClient, session: Session, sample_patient: models.Patient):
    """Test updating analysis status."""
    analysis = crud.create_analysis(
        session,
        schemas.AnalysisCreate(
            patient_id=sample_patient.id,
            mode="single",
            total_findings=0,
            dominant_label=None,
            dominant_category=None,
            summary={},
        ),
    )
    
    response = client.patch(
        f"/analyses/{analysis.id}",
        json={"status": "completed"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"


def test_update_analysis_not_found(client: TestClient):
    """Test updating non-existent analysis."""
    response = client.patch(
        "/analyses/99999",
        json={"findings_description": "Test"},
    )
    assert response.status_code == 404


def test_patient_analyses(client: TestClient, sample_patient: models.Patient, session: Session):
    """Test listing analyses for a specific patient."""
    # Create multiple analyses for the patient
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
    
    response = client.get(f"/patients/{sample_patient.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["analyses"]) == 3
