"""Logging configuration using Loguru."""

from __future__ import annotations

import sys
from pathlib import Path

from loguru import logger

from .config import get_settings


def setup_logging() -> None:
    """Configure loguru logger."""
    settings = get_settings()
    
    # Remove default handler
    logger.remove()
    
    # Console handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.log_level,
        colorize=True,
    )
    
    # File handler
    if settings.log_file:
        log_path = Path(settings.log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.add(
            settings.log_file,
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level=settings.log_level,
            rotation="10 MB",
            retention="30 days",
            compression="zip",
        )
    
    logger.info("Logging configured successfully")


def get_logger(name: str):
    """Get a logger instance for a module."""
    return logger.bind(name=name)
