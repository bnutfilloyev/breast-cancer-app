"""Tests for statistics endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app import models, crud, schemas


def test_get_statistics(client: TestClient, sample_patient: models.Patient, sample_analysis: models.Analysis):
    """Test getting overall statistics."""
    response = client.get("/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "total_patients" in data
    assert "active_patients" in data
    assert "total_analyses" in data
    assert "completed_analyses" in data
    assert "processing_analyses" in data
    assert "failed_analyses" in data
    assert data["total_patients"] >= 1
    assert data["total_analyses"] >= 1


def test_get_trends(client: TestClient, sample_analysis: models.Analysis):
    """Test getting trend data."""
    response = client.get("/statistics/trends")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "labels" in data
    assert "analyses" in data
    assert "findings" in data


def test_get_trends_custom_days(client: TestClient, sample_analysis: models.Analysis):
    """Test getting trend data with custom days parameter."""
    response = client.get("/statistics/trends?days=7")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "labels" in data


def test_get_findings_breakdown(client: TestClient, sample_analysis: models.Analysis):
    """Test getting findings breakdown by category."""
    response = client.get("/statistics/findings")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)


def test_statistics_empty_database(client: TestClient):
    """Test statistics with empty database."""
    response = client.get("/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["total_patients"] == 0
    assert data["total_analyses"] == 0


def test_statistics_multiple_analyses(client: TestClient, session: Session, sample_patient: models.Patient):
    """Test statistics with multiple analyses."""
    # Create analyses with different statuses
    for status in [models.AnalysisStatus.COMPLETED, models.AnalysisStatus.PROCESSING, models.AnalysisStatus.FAILED]:
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
        crud.update_analysis(
            session,
            analysis,
            schemas.AnalysisUpdate(status=status),
        )
    
    response = client.get("/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["completed_analyses"] >= 1
    assert data["processing_analyses"] >= 1
    assert data["failed_analyses"] >= 1
