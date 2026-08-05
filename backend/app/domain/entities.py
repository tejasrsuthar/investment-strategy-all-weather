from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    INVESTOR = "investor"

class UserStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"
    BLACKLISTED = "blacklisted"

class ServiceType(str, Enum):
    REPORTS = "reports"
    PORTFOLIO = "portfolio"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"

class TransactionType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class User(BaseModel):
    id: Optional[str] = None
    username: Optional[str] = None
    email: EmailStr
    hashed_password: Optional[str] = None
    google_id: Optional[str] = None
    role: UserRole = UserRole.INVESTOR
    status: UserStatus = UserStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ResearchReport(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    published_at: datetime = Field(default_factory=datetime.utcnow)

class Stock(BaseModel):
    id: Optional[str] = None
    ticker: str
    name: str
    entry_price: float
    target_price: float
    stop_loss: float
    weightage: float
    transaction_type: TransactionType = TransactionType.BUY
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Subscription(BaseModel):
    id: Optional[str] = None
    user_id: str
    service_type: ServiceType
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    stripe_subscription_id: Optional[str] = None
    upi_transaction_id: Optional[str] = None
    expires_at: datetime
