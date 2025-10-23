"""File management utilities for uploads and storage."""

from __future__ import annotations

import hashlib
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

import aiofiles
from fastapi import UploadFile
from PIL import Image

from .config import get_settings
from .exceptions import FileProcessingError, ValidationError
from .logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class FileManager:
    """Manage file uploads, storage, and processing."""
    
    def __init__(self, upload_dir: Optional[Path] = None):
        self.upload_dir = upload_dir or settings.upload_path
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        self.images_dir = self.upload_dir / "images"
        self.thumbnails_dir = self.upload_dir / "thumbnails"
        self.temp_dir = self.upload_dir / "temp"
        
        for directory in [self.images_dir, self.thumbnails_dir, self.temp_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    async def save_upload(
        self,
        upload: UploadFile,
        patient_id: Optional[int] = None,
        analysis_id: Optional[int] = None,
        view_name: Optional[str] = None,
        create_thumbnail: bool = True,
    ) -> dict[str, str]:
        """
        Save an uploaded file and optionally create a thumbnail.
        
        Returns a dict with file paths and metadata.
        """
        # Validate file
        self._validate_upload(upload)
        
        # Generate unique filename
        file_ext = Path(upload.filename or "image.jpg").suffix.lower()
        file_id = str(uuid4())
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        
        # Build filename with metadata
        filename_parts = [timestamp, file_id]
        if patient_id:
            filename_parts.insert(0, f"p{patient_id}")
        if analysis_id:
            filename_parts.insert(0, f"a{analysis_id}")
        if view_name:
            filename_parts.append(view_name)
        
        filename = "_".join(filename_parts) + file_ext
        
        # Organize by date
        date_dir = self.images_dir / datetime.utcnow().strftime("%Y/%m/%d")
        date_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = date_dir / filename
        
        # Save file
        try:
            content = await upload.read()
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(content)
            
            logger.info(f"Saved file: {file_path}")
            
            # Calculate file hash
            file_hash = hashlib.sha256(content).hexdigest()
            
            # Create thumbnail
            thumbnail_path = None
            if create_thumbnail:
                thumbnail_path = await self._create_thumbnail(file_path, file_id)
            
            # Get file info
            file_info = {
                "file_id": file_id,
                "filename": filename,
                "original_filename": upload.filename or "unknown",
                "file_path": str(file_path),
                "relative_path": str(file_path.relative_to(self.upload_dir)),
                "thumbnail_path": str(thumbnail_path.relative_to(self.upload_dir)) if thumbnail_path else None,
                "file_size": len(content),
                "file_hash": file_hash,
                "content_type": upload.content_type,
                "extension": file_ext,
            }
            
            return file_info
            
        except Exception as exc:
            logger.error(f"Failed to save file: {exc}")
            raise FileProcessingError(f"Failed to save file: {str(exc)}")
    
    async def _create_thumbnail(self, image_path: Path, file_id: str) -> Path:
        """Create a thumbnail from an image."""
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode != "RGB":
                    img = img.convert("RGB")
                
                # Create thumbnail
                img.thumbnail(settings.thumbnail_size, Image.Resampling.LANCZOS)
                
                # Save thumbnail
                date_dir = self.thumbnails_dir / datetime.utcnow().strftime("%Y/%m/%d")
                date_dir.mkdir(parents=True, exist_ok=True)
                
                thumbnail_path = date_dir / f"{file_id}_thumb.jpg"
                img.save(thumbnail_path, "JPEG", quality=85, optimize=True)
                
                logger.info(f"Created thumbnail: {thumbnail_path}")
                
                return thumbnail_path
                
        except Exception as exc:
            logger.warning(f"Failed to create thumbnail: {exc}")
            raise FileProcessingError(f"Failed to create thumbnail: {str(exc)}")
    
    def _validate_upload(self, upload: UploadFile) -> None:
        """Validate uploaded file."""
        if not upload.filename:
            raise ValidationError("Filename is required")
        
        # Check extension
        file_ext = Path(upload.filename).suffix.lower()
        if file_ext not in settings.allowed_extensions:
            raise ValidationError(
                f"File type {file_ext} not allowed. Allowed types: {settings.allowed_extensions}"
            )
        
        # Check content type
        if upload.content_type and not upload.content_type.startswith("image/"):
            raise ValidationError(f"Invalid content type: {upload.content_type}")
    
    async def delete_file(self, file_path: str | Path) -> None:
        """Delete a file and its thumbnail."""
        try:
            file_path = Path(file_path)
            
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted file: {file_path}")
            
            # Try to delete thumbnail
            file_id = file_path.stem.split("_")[-2]  # Extract file_id
            thumbnail_pattern = f"{file_id}_thumb.*"
            
            for thumb in self.thumbnails_dir.rglob(thumbnail_pattern):
                thumb.unlink()
                logger.info(f"Deleted thumbnail: {thumb}")
                
        except Exception as exc:
            logger.error(f"Failed to delete file: {exc}")
    
    def get_file_path(self, relative_path: str) -> Path:
        """Get absolute path from relative path."""
        return self.upload_dir / relative_path
    
    def cleanup_temp_files(self, max_age_hours: int = 24) -> None:
        """Clean up temporary files older than max_age_hours."""
        try:
            current_time = datetime.utcnow().timestamp()
            max_age_seconds = max_age_hours * 3600
            
            for temp_file in self.temp_dir.iterdir():
                if temp_file.is_file():
                    file_age = current_time - temp_file.stat().st_mtime
                    if file_age > max_age_seconds:
                        temp_file.unlink()
                        logger.info(f"Cleaned up temp file: {temp_file}")
                        
        except Exception as exc:
            logger.error(f"Failed to cleanup temp files: {exc}")


# Global instance
file_manager = FileManager()
