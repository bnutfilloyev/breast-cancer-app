"""Utilities that load the YOLO model and perform inference."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from threading import Lock
from typing import Dict, List

import numpy as np
from PIL import Image
from ultralytics import YOLO

from .schemas import BoundingBox, Detection, ImageSize, ModelInfo, ViewPrediction


class InferenceService:
    """Wraps a YOLO model instance to provide prediction helpers."""

    def __init__(
        self,
        weights_path: Path,
        device: str | None = None,
        confidence_threshold: float = 0.25,
        imgsz: int | None = None,
        iou: float | None = None,
        augment: bool = False,
    ) -> None:
        self.weights_path = weights_path
        self.device = device or "cpu"
        self.confidence_threshold = confidence_threshold
        self.imgsz = imgsz
        self.iou = iou
        self.augment = augment
        self._lock = Lock()
        self.model = YOLO(str(self.weights_path))
        model_core = getattr(self.model, "model", None)
        model_name = Path(self.weights_path).stem
        if model_core is not None:
            yaml_config = getattr(model_core, "yaml", None)
            if isinstance(yaml_config, dict):
                model_name = yaml_config.get("name", model_name)
        self.class_metadata = self._build_class_metadata()
        self.model_info = ModelInfo(
            name=model_name,
            weights=self.weights_path.name,
            device=self.device,
            confidence_threshold=self.confidence_threshold,
            iou_threshold=self.iou,
            augmentation=self.augment,
            classes={idx: meta["label"] for idx, meta in self.class_metadata.items()},
            categories={idx: meta["category"] for idx, meta in self.class_metadata.items()},
        )

    def predict(self, image: Image.Image) -> ViewPrediction:
        """Run inference on a PIL image and return structured predictions."""
        # YOLO expects numpy array in RGB order.
        np_image = np.array(image.convert("RGB"))
        predict_kwargs = {
            "device": self.device,
            "conf": self.confidence_threshold,
            "verbose": False,
        }
        if self.imgsz is not None:
            predict_kwargs["imgsz"] = self.imgsz
        if self.iou is not None:
            predict_kwargs["iou"] = self.iou
        if self.augment:
            predict_kwargs["augment"] = True

        with self._lock:
            results = self.model.predict(np_image, **predict_kwargs)
        view_prediction = self._to_view_prediction(image.size, results[0])
        return view_prediction

    def _to_view_prediction(self, size: tuple[int, int], result) -> ViewPrediction:
        """Convert raw YOLO results into a typed view payload."""
        width, height = size
        detections: List[Detection] = []
        if result.boxes is not None and len(result.boxes) > 0:
            bboxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            classes = result.boxes.cls.cpu().numpy()
            for bbox, conf, cls_idx in zip(bboxes, confidences, classes):
                metadata = self.class_metadata.get(
                    int(cls_idx),
                    {
                        "label": str(int(cls_idx)),
                        "category": "normal",
                        "traffic_light": "green",
                    },
                )
                traffic_light = self._resolve_traffic_light(
                    metadata["category"], float(conf), metadata["traffic_light"]
                )
                detections.append(
                    Detection(
                        bbox=BoundingBox(
                            x1=float(bbox[0]),
                            y1=float(bbox[1]),
                            x2=float(bbox[2]),
                            y2=float(bbox[3]),
                        ),
                        confidence=float(conf),
                        label=metadata["label"],
                        category=metadata["category"],
                        traffic_light=traffic_light,
                    )
                )
        return ViewPrediction(size=ImageSize(width=width, height=height), detections=detections)

    def _build_class_metadata(self) -> Dict[int, Dict[str, str]]:
        """Derive class metadata combining YOLO labels with clinical categories."""
        default_map = {
            0: {"label": "BI-RADS 2", "category": "benign", "traffic_light": "amber"},
            1: {"label": "BI-RADS 4", "category": "malignant", "traffic_light": "red"},
            2: {"label": "BI-RADS 5", "category": "malignant", "traffic_light": "red"},
        }
        metadata: Dict[int, Dict[str, str]] = {}
        for idx, default_label in self.model.names.items():
            base = default_map.get(int(idx), {})
            label = base.get("label", default_label)
            category = base.get("category", "normal")
            traffic = base.get("traffic_light", "green" if category == "normal" else "amber")
            metadata[int(idx)] = {
                "label": label,
                "category": category,
                "traffic_light": traffic,
            }
        return metadata

    @staticmethod
    def _resolve_traffic_light(category: str, confidence: float, base: str) -> str:
        """Apply confidence-aware traffic light adjustments."""
        category_lower = category.lower()
        if category_lower == "malignant":
            return "red" if confidence >= 0.55 else "amber"
        if category_lower == "benign":
            return "amber" if confidence >= 0.35 else "green"
        if category_lower == "normal":
            return "green"
        return base


def _default_weights_path() -> Path:
    """Resolve the default weights path relative to the repository root."""
    repo_root = Path(__file__).resolve().parents[2]
    default_path = repo_root / "breast_cancer_detection_yolo11l_1280" / "weights" / "best.pt"
    return default_path


@lru_cache(maxsize=1)
def get_inference_service() -> InferenceService:
    """Singleton accessor that constructs the inference service once."""
    weights_env = os.getenv("MODEL_WEIGHTS_PATH")
    weights_path = Path(weights_env) if weights_env else _default_weights_path()
    if not weights_path.exists():
        raise FileNotFoundError(f"Model weights not found at {weights_path}")

    device = os.getenv("MODEL_DEVICE")
    conf_threshold = float(os.getenv("MODEL_CONFIDENCE", "0.25"))
    imgsz_env = os.getenv("MODEL_IMGSZ", "1280")
    imgsz = None
    if imgsz_env and imgsz_env.strip().lower() not in {"", "auto"}:
        imgsz = int(imgsz_env)

    iou_env = os.getenv("MODEL_IOU", "0.4")
    iou = None
    if iou_env and iou_env.strip():
        iou = float(iou_env)

    augment_env = os.getenv("MODEL_AUGMENT", "0")
    augment = augment_env.strip().lower() in {"1", "true", "yes", "on"}

    return InferenceService(
        weights_path=weights_path,
        device=device,
        confidence_threshold=conf_threshold,
        imgsz=imgsz,
        iou=iou,
        augment=augment,
    )
