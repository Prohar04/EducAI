import os
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Resolve the configured master API key at collection time.
# The .env file is loaded by pydantic-settings when app.main is imported.
_MASTER_KEY: str = (
    os.getenv("MASTER_APIKEY")
    or os.getenv("MASTER_API_KEY")
    or os.getenv("API_KEY")
    or ""
)


def test_secure_endpoint_with_key():
    """Access with the correct MASTER_APIKEY returns 200 and the expected shape."""
    if not _MASTER_KEY:
        import pytest
        pytest.skip("MASTER_APIKEY not configured — skipping authenticated endpoint test")

    response = client.get("/data", headers={"X-API-Key": _MASTER_KEY})
    assert response.status_code == 200
    data = response.json()
    # checkApiKey returns "Express-API"; endpoint echoes it back
    assert "message" in data
    assert "Express-API" in data["message"]


def test_secure_endpoint_no_key():
    """Unauthenticated request returns 401."""
    response = client.get("/data")
    assert response.status_code == 401
    assert "detail" in response.json()
