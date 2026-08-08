from fastapi import APIRouter, Depends, HTTPException, Query
from app.interfaces.schemas import (
    UserStatusUpdateRequest, UserRoleUpdateRequest, InvestorListItem, PaginatedResponse, 
    AdminInvestorProfileUpdate, AdminInvestorSubscriptionUpdate
)
from app.interfaces.dependencies import require_admin
from app.infrastructure.repositories import UserRepository, SubscriptionRepository
from app.domain.entities import User, UserStatus, ServiceType, Subscription, SubscriptionStatus
from datetime import datetime, timedelta
import math

router = APIRouter(prefix="/admin", tags=["Admin Operations"])
user_repo = UserRepository()
sub_repo = SubscriptionRepository()

@router.get("/investors", response_model=PaginatedResponse)
def list_investors(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    admin: User = Depends(require_admin)
):
    users, total = user_repo.get_all_paginated(page, limit)
    pages = math.ceil(total / limit)
    
    items = []
    for user in users:
        # Check active subscriptions
        reports_sub = sub_repo.get_active_subscription(user.id, ServiceType.REPORTS.value)
        portfolio_sub = sub_repo.get_active_subscription(user.id, ServiceType.PORTFOLIO.value)
        
        items.append(InvestorListItem(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            status=user.status,
            created_at=user.created_at,
            subscribed_reports=reports_sub is not None,
            subscribed_portfolio=portfolio_sub is not None
        ))
        
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@router.put("/investors/{investor_id}/status")
def update_investor_status(
    investor_id: str,
    req: UserStatusUpdateRequest,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot alter status of an administrator")
        
    success = user_repo.update_status(investor_id, req.status)
    if not success:
         raise HTTPException(status_code=400, detail="Could not update status")
         
    return {"message": f"Investor status successfully updated to {req.status.value}"}

@router.put("/investors/{investor_id}/role")
def update_investor_role(
    investor_id: str,
    req: UserRoleUpdateRequest,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    success = user_repo.update_role(investor_id, req.role)
    if not success:
         raise HTTPException(status_code=400, detail="Could not update role")
         
    return {"message": f"User role successfully updated to {req.role.value}"}

@router.get("/investors/{investor_id}", response_model=InvestorListItem)
def get_investor_detail(
    investor_id: str,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    reports_sub = sub_repo.get_active_subscription(user.id, ServiceType.REPORTS.value)
    portfolio_sub = sub_repo.get_active_subscription(user.id, ServiceType.PORTFOLIO.value)
    
    return InvestorListItem(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
        subscribed_reports=reports_sub is not None,
        subscribed_portfolio=portfolio_sub is not None
    )

@router.get("/investors/{investor_id}/activities")
def get_investor_activities(
    investor_id: str,
    admin: User = Depends(require_admin)
):
    from app.infrastructure.repositories import ActivityLogRepository
    activity_repo = ActivityLogRepository()
    return activity_repo.get_by_user_id(investor_id)

@router.put("/investors/{investor_id}/profile")
def update_investor_profile_by_admin(
    investor_id: str,
    req: AdminInvestorProfileUpdate,
    admin: User = Depends(require_admin)
):
    from app.infrastructure.logging_utils import log_activity
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    # check for username/email uniqueness if changed
    clean_username = req.username.replace(" ", "")
    if clean_username != user.username:
        existing = user_repo.get_by_username(clean_username)
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
            
    if req.email != user.email:
        existing = user_repo.get_by_email(req.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

    user_repo.update_profile(investor_id, username=clean_username, email=req.email)
    log_activity(investor_id, clean_username, "admin_edit_profile", f"Admin updated profile details: username={clean_username}, email={req.email}")
    return {"message": "Investor profile updated successfully"}

@router.put("/investors/{investor_id}/subscriptions")
def update_investor_subscription_by_admin(
    investor_id: str,
    req: AdminInvestorSubscriptionUpdate,
    admin: User = Depends(require_admin)
):
    from app.infrastructure.logging_utils import log_activity
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")

    if req.active:
        expires_at = datetime.utcnow() + timedelta(days=365) # 1 year subscription
        sub = Subscription(
            user_id=investor_id,
            service_type=req.service_type,
            status=SubscriptionStatus.ACTIVE,
            expires_at=expires_at
        )
        sub_repo.create_or_update(sub)
        log_activity(investor_id, user.username, "admin_activate_sub", f"Admin activated {req.service_type.value} subscription")
    else:
        # deactivate by expiring subscription
        sub = Subscription(
            user_id=investor_id,
            service_type=req.service_type,
            status=SubscriptionStatus.EXPIRED,
            expires_at=datetime.utcnow() - timedelta(days=1)
        )
        sub_repo.create_or_update(sub)
        log_activity(investor_id, user.username, "admin_deactivate_sub", f"Admin deactivated {req.service_type.value} subscription")

    return {"message": f"Investor subscription for {req.service_type.value} updated successfully"}
