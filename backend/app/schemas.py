"""Pydantic schemas for the inference API responses."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field

from .models import AnalysisStatus, Gender, ImageViewType

RiskCategory = Literal["normal", "benign", "malignant"]
TrafficLight = Literal["green", "amber", "red"]
InferenceMode = Literal["multi", "single"]


class BoundingBox(BaseModel):
    """Axis-aligned bounding box in pixel coordinates."""

    x1: float = Field(..., description="Left coordinate in pixels.")
    y1: float = Field(..., description="Top coordinate in pixels.")
    x2: float = Field(..., description="Right coordinate in pixels.")
    y2: float = Field(..., description="Bottom coordinate in pixels.")


class Detection(BaseModel):
    """Single detection produced by the YOLO model."""

    bbox: BoundingBox
    confidence: float = Field(..., ge=0.0, le=1.0)
    label: str
    category: RiskCategory
    traffic_light: TrafficLight


class ImageSize(BaseModel):
    """Container for image dimensions."""

    width: int
    height: int


class ViewPrediction(BaseModel):
    """Normalized prediction payload for a single anatomical view."""

    size: ImageSize
    detections: List[Detection]


class ModelInfo(BaseModel):
    """Metadata describing the loaded model."""

    name: str
    weights: str
    device: str
    confidence_threshold: float
    iou_threshold: float | None = None
    augmentation: bool = False
    classes: Dict[int, str]
    categories: Dict[int, RiskCategory]


class InferenceResponse(BaseModel):
    """Structured response for a batch of four-view predictions."""

    mode: InferenceMode
    views: Dict[str, ViewPrediction]
    model: ModelInfo
    analysis_id: Optional[int] = None


# ============ Patient Schemas ============

class PatientBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    medical_record_number: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    medical_record_number: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class PatientListItem(BaseModel):
    id: int
    full_name: str
    medical_record_number: Optional[str]
    gender: Optional[Gender]
    date_of_birth: Optional[datetime]
    created_at: datetime
    is_active: bool


class PatientListResponse(BaseModel):
    items: List[PatientListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class PatientRead(PatientBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    analyses: List["AnalysisSummary"] = Field(default_factory=list)


# ============ Analysis Schemas ============

class AnalysisBase(BaseModel):
    mode: InferenceMode
    status: AnalysisStatus = AnalysisStatus.PENDING
    findings_description: Optional[str] = None
    recommendations: Optional[str] = None


class AnalysisCreate(BaseModel):
    patient_id: Optional[int] = None
    mode: InferenceMode
    total_findings: int = 0
    dominant_label: Optional[str] = None
    dominant_category: Optional[RiskCategory] = None
    summary: Dict[str, object] = Field(default_factory=dict)
    findings_description: Optional[str] = None
    recommendations: Optional[str] = None


class AnalysisUpdate(BaseModel):
    status: Optional[AnalysisStatus] = None
    findings_description: Optional[str] = None
    recommendations: Optional[str] = None
    total_findings: Optional[int] = None
    dominant_label: Optional[str] = None
    dominant_category: Optional[RiskCategory] = None


class AnalysisSummary(BaseModel):
    id: int
    patient_id: Optional[int]
    mode: InferenceMode
    status: AnalysisStatus
    total_findings: int
    dominant_label: Optional[str]
    dominant_category: Optional[RiskCategory]
    summary: Dict[str, object]
    created_at: datetime
    completed_at: Optional[datetime]


class AnalysisRead(AnalysisSummary):
    findings_description: Optional[str]
    recommendations: Optional[str]
    updated_at: Optional[datetime]
    images: List["AnalysisImageRead"] = Field(default_factory=list)


class AnalysisListResponse(BaseModel):
    items: List[AnalysisSummary]
    total: int
    page: int
    page_size: int


# ============ Analysis Image Schemas ============

class AnalysisImageCreate(BaseModel):
    view_type: ImageViewType
    file_id: str
    filename: str
    original_filename: str
    file_path: str
    relative_path: str
    thumbnail_path: Optional[str] = None
    file_size: int
    file_hash: str
    content_type: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    detections_count: int = 0
    detections_data: Optional[dict] = None


class AnalysisImageRead(BaseModel):
    id: int
    analysis_id: int
    view_type: ImageViewType
    file_id: str
    filename: str
    original_filename: str
    relative_path: str
    thumbnail_path: Optional[str]
    file_size: int
    width: Optional[int]
    height: Optional[int]
    detections_count: int
    detections_data: Optional[dict]
    created_at: datetime


# ============ Statistics Schemas ============

class StatisticsResponse(BaseModel):
    total_patients: int
    active_patients: int
    total_analyses: int
    completed_analyses: int
    pending_analyses: int
    processing_analyses: int
    failed_analyses: int
    total_findings: int

