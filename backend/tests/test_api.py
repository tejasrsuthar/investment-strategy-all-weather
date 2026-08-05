import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.infrastructure.repositories import UserRepository
from app.domain.entities import User, UserRole, UserStatus
from app.core.security import get_password_hash

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Raghuvir Consultants API is running"}

def test_auth_registration():
    email = f"test_{int(pytest.importorskip('time').time())}@example.com"
    response = client.post("/api/auth/register", json={
        "username": "Test Investor",
        "email": email,
        "password": "securepassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "investor"

def test_premium_unauthorized_blocked():
    # Reports endpoint should return 401 Unauthorized if no header
    response = client.get("/api/reports")
    assert response.status_code == 401
