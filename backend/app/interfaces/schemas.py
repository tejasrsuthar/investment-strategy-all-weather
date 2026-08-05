from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.domain.entities import UserRole, UserStatus, ServiceType, SubscriptionStatus, TransactionType, ReportStatus

# Auth Schemas
class UserRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: Optional[str] = None
    email: str

class GoogleLoginRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Research Report Schemas
class ResearchReportCreate(BaseModel):
    title: str
    content: str
    status: Optional[ReportStatus] = ReportStatus.PUBLISHED

class ResearchReportResponse(BaseModel):
    id: str
    title: str
    content: str
    status: ReportStatus
    published_at: datetime

    class Config:
        from_attributes = True

class ReportStatusUpdateRequest(BaseModel):
    status: ReportStatus

# Stock Schemas
class StockCreate(BaseModel):
    ticker: str
    name: str
    entry_price: float
    target_price: float
    stop_loss: float
    weightage: float
    transaction_type: TransactionType

class StockResponse(BaseModel):
    id: str
    ticker: str
    name: str
    entry_price: float
    target_price: float
    stop_loss: float
    weightage: float
    transaction_type: TransactionType
    added_at: datetime

    class Config:
        from_attributes = True

# Investor Schemas
class UserStatusUpdateRequest(BaseModel):
    status: UserStatus

class InvestorListItem(BaseModel):
    id: str
    username: Optional[str] = None
    email: EmailStr
    role: UserRole
    status: UserStatus
    created_at: datetime
    subscribed_reports: bool = False
    subscribed_portfolio: bool = False

# Paginated Generic Response
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    limit: int
    pages: int

# Profile Update Schema
class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
