"""Application configuration management."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Breast Cancer Detection API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/breast_cancer"
    database_echo: bool = False
    
    # Model
    model_weights_path: Optional[str] = None
    model_device: str = "cpu"
    model_confidence: float = 0.25
    model_imgsz: Optional[int] = 1280
    model_iou: Optional[float] = 0.4
    model_augment: bool = False
    
    # File Storage
    upload_dir: str = "uploads"
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: list[str] = [".jpg", ".jpeg", ".png", ".dcm"]
    thumbnail_size: tuple[int, int] = (256, 256)
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: list[str] = ["*"]
    
    # Logging
    log_level: str = "INFO"
    log_file: Optional[str] = "logs/app.log"
    
    # Redis (for caching)
    redis_url: Optional[str] = None
    cache_ttl: int = 3600
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @field_validator("upload_dir")
    @classmethod
    def create_upload_dir(cls, v: str) -> str:
        """Ensure upload directory exists."""
        path = Path(v)
        path.mkdir(parents=True, exist_ok=True)
        return v
    
    @property
    def upload_path(self) -> Path:
        """Get upload directory as Path object."""
        return Path(self.upload_dir)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
