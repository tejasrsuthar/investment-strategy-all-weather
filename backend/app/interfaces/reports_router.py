from fastapi import APIRouter, Depends, HTTPException, Query
from app.interfaces.schemas import ResearchReportCreate, ResearchReportResponse, PaginatedResponse, ReportStatusUpdateRequest, BulkStatusRequest, BulkDeleteRequest
from app.interfaces.dependencies import require_admin, require_reports_subscription
from app.infrastructure.repositories import ResearchReportRepository
from app.domain.entities import ResearchReport, User, UserRole
from app.infrastructure.logging_utils import log_activity
import math

router = APIRouter(prefix="/reports", tags=["Research Reports"])
report_repo = ResearchReportRepository()

@router.get("", response_model=PaginatedResponse)
def get_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    user: User = Depends(require_reports_subscription)
):
    if user.role == UserRole.INVESTOR:
        log_activity(user.id, user.username, "viewed_reports", f"Viewed list of published research reports (Page {page})")
        
    reports, total = report_repo.get_all_paginated(page, limit)
    pages = math.ceil(total / limit) if total > 0 else 1
    
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
    report = ResearchReport(title=req.title, content=req.content, doc_link=req.doc_link, status=req.status)
    created = report_repo.create(report)
    return ResearchReportResponse.model_validate(created)

@router.put("/{report_id}", response_model=ResearchReportResponse)
def update_report(
    report_id: str,
    req: ResearchReportCreate,
    admin: User = Depends(require_admin)
):
    updated = report_repo.update(report_id, req.title, req.content, req.doc_link)
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found")
    return ResearchReportResponse.model_validate(updated)

@router.put("/{report_id}/status", response_model=ResearchReportResponse)
def update_report_status(
    report_id: str,
    req: ReportStatusUpdateRequest,
    admin: User = Depends(require_admin)
):
    updated = report_repo.update_status(report_id, req.status)
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

@router.post("/bulk-status")
def bulk_status_reports(req: BulkStatusRequest, admin: User = Depends(require_admin)):
    for report_id in req.ids:
        report_repo.update_status(report_id, req.status)
    return {"message": f"Updated status for {len(req.ids)} reports"}

@router.post("/bulk-delete")
def bulk_delete_reports(req: BulkDeleteRequest, admin: User = Depends(require_admin)):
    deleted_count = 0
    for report_id in req.ids:
        if report_repo.delete(report_id):
            deleted_count += 1
    return {"message": f"Deleted {deleted_count} reports"}
