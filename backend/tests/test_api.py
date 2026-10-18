import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app
from fastapi.testclient import TestClient




client = TestClient(app)


def test_home():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert "message" in data
    assert data["message"] == "Backend is working"


def test_auth_login_endpoint_exists():
    response = client.post(
        "/auth/login",
        data={
            "username": "invalid_test_user",
            "password": "invalid_test_password"
        }
    )

    # The endpoint should exist.
    # 401/400/422 are acceptable for invalid credentials.
    assert response.status_code in [400, 401, 422]


def test_dashboard_requires_authentication():
    response = client.get("/dashboard/summary")

    assert response.status_code in [401, 403]


def test_reports_requires_authentication():
    response = client.get("/reports")

    assert response.status_code in [401, 403]


def test_palmistry_requires_authentication():
    response = client.get("/palmistry/history")

    assert response.status_code in [401, 403]


def test_tarot_requires_authentication():
    response = client.get("/tarot/latest")

    assert response.status_code in [401, 403]


def test_personalized_guidance_requires_authentication():
    response = client.post(
        "/personalized-guidance/generate"
    )

    assert response.status_code in [401, 403, 422]