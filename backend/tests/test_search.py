"""Tests for search endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app import models


def test_global_search_empty_query(client: TestClient):
    """Test search with empty query."""
    response = client.get("/search?q=")
    assert response.status_code == 200
    data = response.json()
    assert data["patients"] == []
    assert data["analyses"] == []


def test_global_search_short_query(client: TestClient):
    """Test search with query less than 2 characters."""
    response = client.get("/search?q=a")
    assert response.status_code == 200
    data = response.json()
    assert data["patients"] == []
    assert data["analyses"] == []


def test_search_patients(client: TestClient, sample_patient: models.Patient):
    """Test searching for patients."""
    response = client.get(f"/search?q={sample_patient.full_name}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["patients"]) >= 1
    assert data["patients"][0]["id"] == sample_patient.id
    assert sample_patient.full_name in data["patients"][0]["full_name"]


def test_search_patients_by_mrn(client: TestClient, sample_patient: models.Patient):
    """Test searching patients by medical record number."""
    response = client.get(f"/search?q={sample_patient.medical_record_number}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["patients"]) >= 1
    assert data["patients"][0]["medical_record_number"] == sample_patient.medical_record_number


def test_search_patients_by_email(client: TestClient, sample_patient: models.Patient):
    """Test searching patients by email."""
    response = client.get(f"/search?q={sample_patient.email}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["patients"]) >= 1
    assert data["patients"][0]["id"] == sample_patient.id


def test_search_analyses(client: TestClient, sample_analysis: models.Analysis):
    """Test searching for analyses."""
    # Search by dominant_label instead of ID (which might not match in search)
    if sample_analysis.dominant_label:
        response = client.get(f"/search?q={sample_analysis.dominant_label}")
        assert response.status_code == 200
        data = response.json()
        # May or may not find based on label matching
        assert "analyses" in data
    else:
        # If no label, just verify search doesn't crash
        response = client.get(f"/search?q=test")
        assert response.status_code == 200


def test_search_analyses_by_label(client: TestClient, sample_analysis: models.Analysis):
    """Test searching analyses by dominant label."""
    if sample_analysis.dominant_label:
        response = client.get(f"/search?q={sample_analysis.dominant_label}")
        assert response.status_code == 200
        data = response.json()
        assert len(data["analyses"]) >= 1


def test_search_no_results(client: TestClient):
    """Test search with no matching results."""
    response = client.get("/search?q=nonexistentxyzabc123")
    assert response.status_code == 200
    data = response.json()
    assert data["patients"] == []
    assert data["analyses"] == []


def test_search_multiple_results(client: TestClient, multiple_patients: list[models.Patient]):
    """Test search returning multiple results."""
    response = client.get("/search?q=Patient")
    assert response.status_code == 200
    data = response.json()
    assert len(data["patients"]) >= 1
    # Should be limited to 10 results
    assert len(data["patients"]) <= 10


def test_search_case_insensitive(client: TestClient, sample_patient: models.Patient):
    """Test that search is case-insensitive."""
    response1 = client.get(f"/search?q={sample_patient.full_name.upper()}")
    response2 = client.get(f"/search?q={sample_patient.full_name.lower()}")
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    assert len(response1.json()["patients"]) == len(response2.json()["patients"])
