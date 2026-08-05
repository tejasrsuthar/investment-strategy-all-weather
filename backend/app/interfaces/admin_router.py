from fastapi import APIRouter, Depends, HTTPException, Query
from app.interfaces.schemas import UserStatusUpdateRequest, InvestorListItem, PaginatedResponse
from app.interfaces.dependencies import require_admin
from app.infrastructure.repositories import UserRepository, SubscriptionRepository
from app.domain.entities import User, UserStatus, ServiceType
import math

router = APIRouter(prefix="/admin", tags=["Admin Operations"])
user_repo = UserRepository()
sub_repo = SubscriptionRepository()

@router.get("/investors", response_model=PaginatedResponse)
def list_investors(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
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
