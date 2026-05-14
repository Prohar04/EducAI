"""Tests for health and root endpoints."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health():
    """Health endpoint always returns status=ok regardless of extra metadata fields."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
    # Endpoint may include extra fields (service, version, uptime, timestamp, environment).
    # We only assert the contract field.
    assert "service" in data


def test_llm_health_returns_valid_shape():
    """LLM health check should always return a valid JSON shape even without keys."""
    response = client.get("/api/v1/health/llm")
    assert response.status_code == 200
    data = response.json()
    # Must have these keys regardless of key configuration
    assert "ok" in data
    assert "available_providers" in data
    providers = data["available_providers"]
    for key in ("openrouter", "gemini", "groq", "xai"):
        assert key in providers
