"""SQLModel entities for patients, analyses, and images."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, JSON, String, Text, func
from sqlmodel import Field, Relationship, SQLModel


class Gender(str, Enum):
    """Patient gender options."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class AnalysisStatus(str, Enum):
    """Analysis status options."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ImageViewType(str, Enum):
    """Image view type options."""
    LCC = "lcc"
    RCC = "rcc"
    LMLO = "lmlo"
    RMLO = "rmlo"
    SINGLE = "single"
    OTHER = "other"


# Patient Model
class PatientBase(SQLModel):
    full_name: str = Field(max_length=255, index=True)
    medical_record_number: Optional[str] = Field(
        default=None, max_length=100, index=True, unique=True
    )
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = Field(default=None, max_length=50)
    email: Optional[str] = Field(default=None, max_length=255)
    address: Optional[str] = Field(default=None, sa_column=Column(Text))
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    is_active: bool = Field(default=True)



class Patient(PatientBase, table=True):
    __tablename__ = "patients"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        sa_column_kwargs={"server_default": func.now()}, 
        default_factory=datetime.utcnow
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column_kwargs={"onupdate": func.now()}
    )



# Analysis Model
class AnalysisBase(SQLModel):
    mode: str = Field(max_length=16)
    status: AnalysisStatus = Field(default=AnalysisStatus.PENDING)
    total_findings: int = Field(default=0)
    dominant_label: Optional[str] = Field(default=None, max_length=100)
    dominant_category: Optional[str] = Field(default=None, max_length=50)
    summary: dict = Field(default_factory=dict, sa_column=Column(JSON))
    findings_description: Optional[str] = Field(default=None, sa_column=Column(Text))
    recommendations: Optional[str] = Field(default=None, sa_column=Column(Text))



class Analysis(AnalysisBase, table=True):
    __tablename__ = "analyses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: Optional[int] = Field(default=None, foreign_key="patients.id")
    created_at: datetime = Field(
        sa_column_kwargs={"server_default": func.now()}, 
        default_factory=datetime.utcnow
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column_kwargs={"onupdate": func.now()}
    )
    completed_at: Optional[datetime] = None



# Analysis Image Model
class AnalysisImageBase(SQLModel):
    view_type: ImageViewType = Field(default=ImageViewType.SINGLE)
    file_id: str = Field(max_length=100, index=True)
    filename: str = Field(max_length=255)
    original_filename: str = Field(max_length=255)
    file_path: str = Field(max_length=500)
    relative_path: str = Field(max_length=500)
    thumbnail_path: Optional[str] = Field(default=None, max_length=500)
    file_size: int = Field(default=0)
    file_hash: str = Field(max_length=64)
    content_type: Optional[str] = Field(default=None, max_length=100)
    width: Optional[int] = None
    height: Optional[int] = None
    detections_count: int = Field(default=0)
    detections_data: Optional[dict] = Field(default=None, sa_column=Column(JSON))



class AnalysisImage(AnalysisImageBase, table=True):
    __tablename__ = "analysis_images"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    analysis_id: int = Field(foreign_key="analyses.id")
    created_at: datetime = Field(
        sa_column_kwargs={"server_default": func.now()}, 
        default_factory=datetime.utcnow
    )



# Audit Log Model (for tracking changes)
class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    entity_type: str = Field(max_length=50)  # patient, analysis, image
    entity_id: int
    action: str = Field(max_length=50)  # create, update, delete
    user_id: Optional[int] = None  # For future auth
    changes: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    ip_address: Optional[str] = Field(default=None, max_length=50)
    user_agent: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(
        sa_column_kwargs={"server_default": func.now()}, 
        default_factory=datetime.utcnow
    )


