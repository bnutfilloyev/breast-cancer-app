"""Tests for health check endpoint."""
import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    # Health check doesn't include timestamp in main app


def test_root_endpoint(client: TestClient):
    """Test root endpoint returns 404 (no root defined)."""
    response = client.get("/")
    # Main app doesn't have root endpoint, expecting 404
    assert response.status_code == 404
