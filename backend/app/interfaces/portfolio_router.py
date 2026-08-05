from fastapi import APIRouter, Depends, HTTPException, Query
from app.interfaces.schemas import StockCreate, StockResponse, PaginatedResponse
from app.interfaces.dependencies import require_admin, require_portfolio_subscription
from app.infrastructure.repositories import StockRepository
from app.domain.entities import Stock, User, UserRole
from app.infrastructure.logging_utils import log_activity
import math

router = APIRouter(prefix="/portfolio", tags=["Model Portfolio"])
stock_repo = StockRepository()

@router.get("", response_model=PaginatedResponse)
def get_portfolio(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    user: User = Depends(require_portfolio_subscription)
):
    if user.role == UserRole.INVESTOR:
        log_activity(user.id, user.username, "viewed_portfolio", f"Viewed model portfolio stocks list (Page {page})")
        
    stocks, total = stock_repo.get_all_paginated(page, limit)
    pages = math.ceil(total / limit)
    
    items = [StockResponse.model_validate(stk) for stk in stocks]
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@router.post("/stocks", response_model=StockResponse)
def add_stock(
    req: StockCreate,
    admin: User = Depends(require_admin)
):
    stock = Stock(
        ticker=req.ticker,
        name=req.name,
        entry_price=req.entry_price,
        target_price=req.target_price,
        stop_loss=req.stop_loss,
        weightage=req.weightage,
        transaction_type=req.transaction_type
    )
    created = stock_repo.create(stock)
    return StockResponse.model_validate(created)

@router.put("/stocks/{stock_id}", response_model=StockResponse)
def update_stock(
    stock_id: str,
    req: StockCreate,
    admin: User = Depends(require_admin)
):
    existing = stock_repo.get_by_id(stock_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Stock not found")
        
    stock = Stock(
        ticker=req.ticker,
        name=req.name,
        entry_price=req.entry_price,
        target_price=req.target_price,
        stop_loss=req.stop_loss,
        weightage=req.weightage,
        transaction_type=req.transaction_type
    )
    updated = stock_repo.update(stock_id, stock)
    return StockResponse.model_validate(updated)

@router.delete("/stocks/{stock_id}")
def delete_stock(
    stock_id: str,
    admin: User = Depends(require_admin)
):
    success = stock_repo.delete(stock_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stock not found")
    return {"message": "Stock deleted successfully from portfolio"}
