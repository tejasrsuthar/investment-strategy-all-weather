from fastapi import APIRouter, Depends, HTTPException, Query
from app.interfaces.schemas import ResearchReportCreate, ResearchReportResponse, PaginatedResponse, ReportStatusUpdateRequest
from app.interfaces.dependencies import require_admin, require_reports_subscription
from app.infrastructure.repositories import ResearchReportRepository
from app.domain.entities import ResearchReport, User
import math

router = APIRouter(prefix="/reports", tags=["Research Reports"])
report_repo = ResearchReportRepository()

@router.get("", response_model=PaginatedResponse)
def get_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user: User = Depends(require_reports_subscription)
):
    reports, total = report_repo.get_all_paginated(page, limit)
    pages = math.ceil(total / limit)
    
    # Map entities to response schemas
    items = [ResearchReportResponse.model_validate(rep) for rep in reports]
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@router.post("", response_model=ResearchReportResponse)
def create_report(
    req: ResearchReportCreate,
    admin: User = Depends(require_admin)
):
    report = ResearchReport(title=req.title, content=req.content, status=req.status)
    created = report_repo.create(report)
    return ResearchReportResponse.model_validate(created)

@router.put("/{report_id}", response_model=ResearchReportResponse)
def update_report(
    report_id: str,
    req: ResearchReportCreate,
    admin: User = Depends(require_admin)
):
    updated = report_repo.update(report_id, req.title, req.content)
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found")
    return ResearchReportResponse.model_validate(updated)

@router.put("/{report_id}/status", response_model=ResearchReportResponse)
def update_report_status(
    report_id: str,
    req: ReportStatusUpdateRequest,
    admin: User = Depends(require_admin)
):
    updated = report_repo.update_status(report_id, req.status.value)
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found")
    return ResearchReportResponse.model_validate(updated)

@router.delete("/{report_id}")
def delete_report(
    report_id: str,
    admin: User = Depends(require_admin)
):
    success = report_repo.delete(report_id)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted successfully"}
