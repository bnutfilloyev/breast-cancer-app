"""Custom exceptions for the application."""

from __future__ import annotations


class AppException(Exception):
    """Base exception for application errors."""
    
    def __init__(self, message: str, status_code: int = 500, details: dict | None = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppException):
    """Raised when validation fails."""
    
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, status_code=400, details=details)


class NotFoundError(AppException):
    """Raised when a resource is not found."""
    
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, status_code=404, details=details)


class FileProcessingError(AppException):
    """Raised when file processing fails."""
    
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, status_code=422, details=details)


class ModelInferenceError(AppException):
    """Raised when model inference fails."""
    
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, status_code=500, details=details)


class DatabaseError(AppException):
    """Raised when database operations fail."""
    
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, status_code=500, details=details)
