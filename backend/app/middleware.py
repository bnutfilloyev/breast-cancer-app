"""Custom middleware for the application."""

from __future__ import annotations

import time
import uuid
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .exceptions import AppException
from .logger import get_logger

logger = get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Add request ID to all requests."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests and responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        request_id = getattr(request.state, "request_id", "unknown")
        
        logger.info(
            f"Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "client": request.client.host if request.client else "unknown",
            }
        )
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        logger.info(
            f"Request completed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "status_code": response.status_code,
                "process_time": f"{process_time:.3f}s",
            }
        )
        
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    """Handle exceptions globally."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except AppException as exc:
            logger.error(
                f"Application error: {exc.message}",
                extra={
                    "request_id": getattr(request.state, "request_id", "unknown"),
                    "status_code": exc.status_code,
                    "details": exc.details,
                }
            )
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "detail": exc.message,
                    "request_id": getattr(request.state, "request_id", "unknown"),
                }
            )
        except Exception as exc:
            logger.exception(
                "Unhandled exception",
                extra={
                    "request_id": getattr(request.state, "request_id", "unknown"),
                }
            )
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "request_id": getattr(request.state, "request_id", "unknown"),
                }
            )
