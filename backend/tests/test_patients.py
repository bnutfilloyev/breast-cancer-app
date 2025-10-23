"""Tests for patient CRUD endpoints."""
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app import models, crud, schemas


def test_create_patient(client: TestClient):
    """Test creating a new patient."""
    response = client.post(
        "/patients",
        json={
            "full_name": "John Doe",
            "medical_record_number": "MRN123",
            "date_of_birth": "1990-05-15",
            "gender": "male",
            "phone": "+998901234567",
            "email": "john@example.com",
            "address": "123 Main St",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "John Doe"
    assert data["medical_record_number"] == "MRN123"
    assert data["gender"] == "male"
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data


def test_create_patient_duplicate_mrn(client: TestClient, sample_patient: models.Patient):
    """Test creating patient with duplicate medical record number."""
    response = client.post(
        "/patients",
        json={
            "full_name": "Another Patient",
            "medical_record_number": sample_patient.medical_record_number,
            "date_of_birth": "1985-03-20",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_list_patients(client: TestClient, multiple_patients: list[models.Patient]):
    """Test listing all patients."""
    response = client.get("/patients")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert len(data["items"]) == 5
    assert data["total"] == 5


def test_list_patients_pagination(client: TestClient, multiple_patients: list[models.Patient]):
    """Test patient list pagination."""
    response = client.get("/patients?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total_pages"] == 3


def test_list_patients_search(client: TestClient, multiple_patients: list[models.Patient]):
    """Test searching patients."""
    response = client.get("/patients?search=Patient 1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert "Patient 1" in data["items"][0]["full_name"]


def test_get_patient(client: TestClient, sample_patient: models.Patient):
    """Test retrieving a single patient."""
    response = client.get(f"/patients/{sample_patient.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_patient.id
    assert data["full_name"] == sample_patient.full_name
    assert "analyses" in data


def test_get_patient_not_found(client: TestClient):
    """Test retrieving non-existent patient."""
    response = client.get("/patients/99999")
    assert response.status_code == 404


def test_update_patient(client: TestClient, sample_patient: models.Patient):
    """Test updating a patient."""
    response = client.patch(
        f"/patients/{sample_patient.id}",
        json={
            "full_name": "Updated Name",
            "phone": "+998909999999",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["phone"] == "+998909999999"
    assert data["medical_record_number"] == sample_patient.medical_record_number


def test_update_patient_not_found(client: TestClient):
    """Test updating non-existent patient."""
    response = client.patch(
        "/patients/99999",
        json={"full_name": "Updated Name"},
    )
    assert response.status_code == 404


def test_delete_patient(client: TestClient, sample_patient: models.Patient):
    """Test soft deleting a patient."""
    response = client.delete(f"/patients/{sample_patient.id}")
    assert response.status_code == 204
    
    # Verify patient is marked inactive
    response = client.get(f"/patients/{sample_patient.id}")
    assert response.status_code == 200
    assert response.json()["is_active"] is False


def test_delete_patient_not_found(client: TestClient):
    """Test deleting non-existent patient."""
    response = client.delete("/patients/99999")
    assert response.status_code == 404


def test_patient_with_analyses(client: TestClient, sample_patient: models.Patient, sample_analysis: models.Analysis):
    """Test patient endpoint includes analyses."""
    response = client.get(f"/patients/{sample_patient.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["analyses"]) == 1
    assert data["analyses"][0]["id"] == sample_analysis.id
