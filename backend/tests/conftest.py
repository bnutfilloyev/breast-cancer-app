"""Pytest configuration and fixtures."""
import asyncio
import os
import sys
from pathlib import Path
from typing import Generator
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app import models, crud, schemas
from app.main import app
from app.database import get_session
from app.config import get_settings


# Test database URL
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(name="engine")
def engine_fixture():
    """Create a test database engine."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="session")
def session_fixture(engine) -> Generator[Session, None, None]:
    """Create a test database session."""
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database session override."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="sample_patient")
def sample_patient_fixture(session: Session) -> models.Patient:
    """Create a sample patient for testing."""
    patient = crud.create_patient(
        session,
        schemas.PatientCreate(
            full_name="Test Patient",
            medical_record_number="MRN001",
            date_of_birth=date(1980, 1, 1),
            gender=models.Gender.FEMALE,
            phone="+998901234567",
            email="test@example.com",
            address="Test Address, Tashkent",
        ),
    )
    return patient


@pytest.fixture(name="sample_analysis")
def sample_analysis_fixture(session: Session, sample_patient: models.Patient) -> models.Analysis:
    """Create a sample analysis for testing."""
    analysis = crud.create_analysis(
        session,
        schemas.AnalysisCreate(
            patient_id=sample_patient.id,
            mode="multi",
            total_findings=5,
            dominant_label="Calcification",
            dominant_category="benign",
            summary={
                "mode": "multi",
                "views": {},
                "totals": {
                    "total_findings": 5,
                    "category_counts": {"benign": 3, "malignant": 2},
                    "label_counts": {"Calcification": 5},
                },
            },
        ),
    )
    # Mark as completed
    analysis = crud.complete_analysis(
        session,
        analysis,
        findings_description="Test findings",
        recommendations="Test recommendations",
    )
    return analysis


@pytest.fixture(name="multiple_patients")
def multiple_patients_fixture(session: Session) -> list[models.Patient]:
    """Create multiple patients for testing list/search operations."""
    patients = []
    for i in range(5):
        patient = crud.create_patient(
            session,
            schemas.PatientCreate(
                full_name=f"Patient {i+1}",
                medical_record_number=f"MRN{i+1:03d}",
                date_of_birth=date(1980 + i, 1, 1),
                gender=models.Gender.FEMALE if i % 2 == 0 else models.Gender.MALE,
                phone=f"+99890123456{i}",
                email=f"patient{i+1}@example.com",
            ),
        )
        patients.append(patient)
    return patients


@pytest.fixture
def sample_image_bytes() -> bytes:
    """Create a minimal valid PNG image for testing."""
    # 1x1 red PNG
    return (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf'
        b'\xc0\x00\x00\x00\x03\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    )


@pytest.fixture(autouse=True)
def reset_settings():
    """Reset settings for each test."""
    # Clear any cached settings
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
