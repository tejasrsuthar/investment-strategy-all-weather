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
