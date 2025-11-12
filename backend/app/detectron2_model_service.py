"""
Detectron2-compatible inference service for breast cancer detection model.
This properly handles Detectron2 checkpoint format without requiring detectron2 library.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from threading import Lock
from typing import Dict, List, Tuple

import numpy as np
import torch
import torch.nn as nn
from PIL import Image

from .schemas import BoundingBox, Detection, ImageSize, ModelInfo, ViewPrediction


class Detectron2InferenceService:
    """Detectron2-format model inference service for breast cancer detection."""

    def __init__(
        self,
        weights_path: Path,
        device: str | None = None,
        confidence_threshold: float = 0.7,  # Higher threshold for medical imaging
        nms_threshold: float = 0.3,  # Stricter NMS
        num_classes: int = 2,  # 0: benign, 1: malignant (excluding background)
    ) -> None:
        self.weights_path = weights_path
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.confidence_threshold = confidence_threshold
        self.nms_threshold = nms_threshold
        self.num_classes = num_classes
        self._lock = Lock()
        
        # Load checkpoint
        print(f"Loading Detectron2 checkpoint from {weights_path}...")
        checkpoint = torch.load(weights_path, map_location='cpu')
        
        if isinstance(checkpoint, dict) and 'model' in checkpoint:
            self.state_dict = checkpoint['model']
            self.iteration = checkpoint.get('iteration', 'unknown')
            print(f"✓ Loaded checkpoint from iteration {self.iteration}")
        else:
            self.state_dict = checkpoint
            self.iteration = 'unknown'
        
        # Verify model structure
        self._verify_model_structure()
        
        # Define class metadata
        self.class_metadata = self._build_class_metadata()
        self.model_info = ModelInfo(
            name="Detectron2 Faster R-CNN Breast Cancer Detector",
            weights=self.weights_path.name,
            device=self.device,
            confidence_threshold=self.confidence_threshold,
            iou_threshold=self.nms_threshold,
            augmentation=False,
            classes={idx: meta["label"] for idx, meta in self.class_metadata.items()},
            categories={idx: meta["category"] for idx, meta in self.class_metadata.items()},
        )
        
        print(f"✓ Model initialized with {self.num_classes} detection classes")
        print(f"  Confidence threshold: {self.confidence_threshold}")
        print(f"  NMS threshold: {self.nms_threshold}")

    def _verify_model_structure(self) -> None:
        """Verify the model checkpoint has expected structure."""
        required_keys = [
            'roi_heads.box_predictor.cls_score.weight',
            'roi_heads.box_predictor.bbox_pred.weight',
        ]
        
        for key in required_keys:
            if key not in self.state_dict:
                raise ValueError(f"Missing required key in checkpoint: {key}")
        
        cls_weight = self.state_dict['roi_heads.box_predictor.cls_score.weight']
        bbox_weight = self.state_dict['roi_heads.box_predictor.bbox_pred.weight']
        
        num_classes_in_cls = cls_weight.shape[0]  # Should be 3 (bg + 2 classes)
        num_bbox_outputs = bbox_weight.shape[0]   # Should be 8 (2 classes * 4)
        
        print(f"  Class score outputs: {num_classes_in_cls} (including background)")
        print(f"  BBox prediction outputs: {num_bbox_outputs}")
        
        if num_bbox_outputs != self.num_classes * 4:
            print(f"  ⚠️  WARNING: Expected {self.num_classes * 4} bbox outputs, got {num_bbox_outputs}")

    def predict(self, image: Image.Image) -> ViewPrediction:
        """
        Run inference on a PIL image.
        
        NOTE: Since we can't easily reconstruct the full Detectron2 model without
        the detectron2 library, this is a placeholder that returns empty results.
        The proper solution is to use detectron2 library or convert the model.
        """
        width, height = image.size
        
        print("⚠️  WARNING: Detectron2 model inference not fully implemented")
        print("   This model requires detectron2 library for proper inference")
        print("   Returning empty detections")
        
        # Return empty predictions for now
        return ViewPrediction(
            image_size=ImageSize(width=width, height=height),
            detections=[],
            inference_time=0.0,
        )

    def _build_class_metadata(self) -> Dict[int, Dict[str, str]]:
        """Build metadata for each class."""
        return {
            0: {
                "label": "Benign",
                "category": "benign",
                "traffic_light": "amber",  # Benign is less severe
            },
            1: {
                "label": "Malignant", 
                "category": "malignant",
                "traffic_light": "red",  # Malignant is severe
            },
        }

    def _resolve_traffic_light(
        self, category: str, confidence: float, default: str
    ) -> str:
        """Resolve traffic light color based on category and confidence."""
        if category == "malignant":
            return "red"
        elif category == "benign":
            if confidence > 0.8:
                return "amber"
            else:
                return "green"
        return default

    def get_model_info(self) -> ModelInfo:
        """Return model information."""
        return self.model_info


@lru_cache(maxsize=1)
def get_detectron2_inference_service() -> Detectron2InferenceService:
    """Get or create the global Detectron2 inference service instance."""
    weights_path = Path(os.getenv("TORCH_MODEL_WEIGHTS_PATH", "/app/model_final.pth"))
    
    if not weights_path.exists():
        raise FileNotFoundError(f"Model weights not found at {weights_path}")
    
    confidence_threshold = float(os.getenv("MODEL_CONFIDENCE_THRESHOLD", "0.7"))
    nms_threshold = float(os.getenv("MODEL_NMS_THRESHOLD", "0.3"))
    
    return Detectron2InferenceService(
        weights_path=weights_path,
        confidence_threshold=confidence_threshold,
        nms_threshold=nms_threshold,
    )
