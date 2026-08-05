from sqlalchemy import Column, String, DateTime, Float, Enum, JSON
from sqlalchemy.orm import declarative_base
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    ADMIN = "admin"
    INVESTOR = "investor"

class UserStatus(enum.Enum):
    ACTIVE = "active"
    DISABLED = "disabled"
    BLACKLISTED = "blacklisted"

class ServiceType(enum.Enum):
    REPORTS = "reports"
    PORTFOLIO = "portfolio"

class SubscriptionStatus(enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"

class TransactionType(enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

class ReportStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class UserORM(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.INVESTOR)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE)
    created_at = Column(DateTime, nullable=False)

class ResearchReportORM(Base):
    __tablename__ = "research_reports"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.PUBLISHED)
    published_at = Column(DateTime, nullable=False)

class StockORM(Base):
    __tablename__ = "stocks"
    
    id = Column(String, primary_key=True)
    ticker = Column(String, nullable=False)
    name = Column(String, nullable=False)
    entry_price = Column(Float, nullable=False)
    target_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    weightage = Column(Float, nullable=False)
    transaction_type = Column(Enum(TransactionType), default=TransactionType.BUY)
    added_at = Column(DateTime, nullable=False)

class SubscriptionORM(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    service_type = Column(Enum(ServiceType), nullable=False)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    stripe_subscription_id = Column(String, nullable=True)
    upi_transaction_id = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=False)
