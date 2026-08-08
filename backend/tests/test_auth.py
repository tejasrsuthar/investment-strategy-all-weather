import pytest
from app.interfaces.auth_router import validate_password_policy
from fastapi import HTTPException

def test_password_policy_valid():
    # Min 7 chars, includes at least 1 special char from !@#$%
    try:
        validate_password_policy("Secret1!")
        validate_password_policy("P@ssword1")
    except HTTPException:
        pytest.fail("Valid password raised HTTPException unexpectedly")

def test_password_policy_invalid_length():
    with pytest.raises(HTTPException) as exc:
        validate_password_policy("P@ss1")
    assert exc.value.status_code == 400
    assert "at least 7 characters" in exc.value.detail

def test_password_policy_invalid_special_char():
    with pytest.raises(HTTPException) as exc:
        validate_password_policy("Password123^")
    assert exc.value.status_code == 400
    assert "at least one special character" in exc.value.detail

def test_user_role_update():
    from app.infrastructure.repositories import UserRepository
    from app.domain.entities import User, UserRole, UserStatus
    repo = UserRepository()
    u = User(username="test_role_user", email="role_test@example.com", hashed_password="pwd", role=UserRole.INVESTOR, status=UserStatus.ACTIVE)
    created = repo.create(u)
    assert created.role == UserRole.INVESTOR
    
    updated = repo.update_role(created.id, UserRole.ADMIN)
    assert updated is True
    
    fetched = repo.get_by_id(created.id)
    assert fetched.role == UserRole.ADMIN
    repo.delete(created.id)
