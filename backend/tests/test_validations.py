from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


# ---------------------------------------------------------
# AUTHENTICATION VALIDATION
# ---------------------------------------------------------

def test_login_missing_username():
    response = client.post(
        "/auth/login",
        data={
            "password": "test_password"
        }
    )

    assert response.status_code in [400, 401, 422]


def test_login_missing_password():
    response = client.post(
        "/auth/login",
        data={
            "username": "test_user"
        }
    )

    assert response.status_code in [400, 401, 422]


def test_login_empty_credentials():
    response = client.post(
        "/auth/login",
        data={
            "username": "",
            "password": ""
        }
    )

    assert response.status_code in [400, 401, 422]


# ---------------------------------------------------------
# PALMISTRY VALIDATION
# ---------------------------------------------------------

def test_palmistry_without_image():
    response = client.post(
        "/palmistry/reading"
    )

    # Authentication may be checked before image validation.
    assert response.status_code in [400, 401, 403, 422]


def test_palmistry_history_requires_authentication():
    response = client.get(
        "/palmistry/history"
    )

    assert response.status_code in [401, 403]


# ---------------------------------------------------------
# TAROT VALIDATION
# ---------------------------------------------------------

def test_tarot_without_request_data():
    response = client.post(
        "/tarot/reading"
    )

    # Authentication or request-body validation may occur first.
    assert response.status_code in [400, 401, 403, 422]


def test_tarot_invalid_reading_type():
    response = client.post(
        "/tarot/reading",
        json={
            "reading_type": "invalid_reading_type"
        }
    )

    # Authentication may occur before request validation.
    assert response.status_code in [400, 401, 403, 422]


def test_tarot_latest_requires_authentication():
    response = client.get(
        "/tarot/latest"
    )

    assert response.status_code in [401, 403]


# ---------------------------------------------------------
# PERSONALIZED GUIDANCE VALIDATION
# ---------------------------------------------------------

def test_personalized_guidance_without_data():
    response = client.post(
        "/personalized-guidance/generate"
    )

    assert response.status_code in [400, 401, 403, 422]


# ---------------------------------------------------------
# REPORT VALIDATION
# ---------------------------------------------------------

def test_report_generation_without_data():
    response = client.post(
        "/reports/generate",
        json={}
    )

    assert response.status_code in [400, 401, 403, 404, 422]


def test_invalid_report_id():
    response = client.get(
        "/reports/999999999"
    )

    # The endpoint is protected, so authentication
    # can be checked before the report ID.
    assert response.status_code in [401, 403, 404]


def test_report_download_invalid_id():
    response = client.get(
        "/reports/download/999999999"
    )

    assert response.status_code in [401, 403, 404]


# ---------------------------------------------------------
# DASHBOARD VALIDATION
# ---------------------------------------------------------

def test_dashboard_without_authentication():
    response = client.get(
        "/dashboard/summary"
    )

    assert response.status_code in [401, 403]


# ---------------------------------------------------------
# GENERAL INVALID ROUTE
# ---------------------------------------------------------

def test_invalid_api_route():
    response = client.get(
        "/this-route-does-not-exist"
    )

    assert response.status_code == 404