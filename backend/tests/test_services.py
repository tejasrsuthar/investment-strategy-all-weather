from app.domain.entities import ServiceOffering, ReportStatus
from app.infrastructure.repositories import ServiceOfferingRepository

def test_service_offering_crud():
    repo = ServiceOfferingRepository()
    service = ServiceOffering(
        title="Equity Research Pro",
        description="Exclusive equity reports",
        price_monthly=999.0,
        status=ReportStatus.PUBLISHED
    )
    created = repo.create(service)
    assert created.id is not None
    assert created.title == "Equity Research Pro"

    items, total = repo.get_all_paginated(1, 10)
    assert total >= 1

    repo.delete(created.id)
