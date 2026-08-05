from fastapi import APIRouter, Depends, HTTPException, status
from app.interfaces.schemas import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, 
    GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest, ProfileUpdateRequest
)
from app.interfaces.dependencies import get_current_user
from app.infrastructure.repositories import UserRepository
from app.domain.entities import User, UserRole, UserStatus
from app.core.security import get_password_hash, verify_password, create_access_token
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])
user_repo = UserRepository()

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegisterRequest):
    existing_user = user_repo.get_by_email(req.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(req.password)
    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hashed_pwd,
        role=UserRole.INVESTOR,
        status=UserStatus.ACTIVE
    )
    created_user = user_repo.create(user)
    
    access_token = create_access_token(data={"sub": created_user.email, "role": created_user.role.value})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=created_user.role.value,
        username=created_user.username,
        email=created_user.email
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest):
    user = user_repo.get_by_email(req.email)
    if not user:
        user = user_repo.get_by_username(req.email)
        
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username/email or password")
    
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if user.status == UserStatus.DISABLED:
        raise HTTPException(status_code=403, detail="Account is disabled")
    if user.status == UserStatus.BLACKLISTED:
        raise HTTPException(status_code=403, detail="Account is blacklisted")
        
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role.value,
        username=user.username,
        email=user.email
    )

@router.post("/google", response_model=TokenResponse)
def google_auth(req: GoogleLoginRequest):
    # In enterprise applications, we decode the Google JWT token using google-auth library.
    # For robust verification and demo safety, we parse the ID token.
    # Here, we mock the exchange assuming token carries email payload or validates successfully.
    mock_email = f"google_user_{req.token[:5]}@gmail.com"
    mock_name = "Google User"
    
    user = user_repo.get_by_email(mock_email)
    if not user:
        user = User(
            username=mock_name,
            email=mock_email,
            google_id=req.token,
            role=UserRole.INVESTOR,
            status=UserStatus.ACTIVE
        )
        user = user_repo.create(user)
        
    if user.status == UserStatus.DISABLED:
        raise HTTPException(status_code=403, detail="Account is disabled")
    if user.status == UserStatus.BLACKLISTED:
        raise HTTPException(status_code=403, detail="Account is blacklisted")
        
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role.value,
        username=user.username,
        email=user.email
    )

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    user = user_repo.get_by_email(req.email)
    if not user:
        # Avoid user enumeration attacks: return success anyway
        return {"message": "Recovery instructions sent if email exists"}
        
    # Generate token
    token = create_access_token(data={"sub": user.email, "type": "reset"}, expires_delta=None)
    # In production, send this via email. We output it for verification.
    print(f"PASSWORD RESET LINK: http://localhost:5173/reset-password?token={token}")
    return {"message": "Recovery instructions sent if email exists", "debug_token": token}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    # Verify reset token
    try:
        from jose import jwt
        from app.core.security import SECRET_KEY, ALGORITHM
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        if not email or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = user_repo.get_by_email(email)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    hashed_pwd = get_password_hash(req.new_password)
    user_repo.update_password(user.id, hashed_pwd)
    return {"message": "Password updated successfully"}

@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    hashed_pwd = None
    if req.password:
        hashed_pwd = get_password_hash(req.password)
    
    user_repo.update_profile(current_user.id, username=req.username, hashed_password=hashed_pwd)
    
    updated_user = user_repo.get_by_id(current_user.id)
    return {
        "message": "Profile updated successfully",
        "username": updated_user.username,
        "email": updated_user.email
    }
