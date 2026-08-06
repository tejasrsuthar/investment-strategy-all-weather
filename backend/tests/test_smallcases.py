from app.domain.entities import SmallcaseItem
from app.infrastructure.repositories import SmallcaseRepository

def test_smallcase_repository_crud():
    repo = SmallcaseRepository()
    item = SmallcaseItem(
        name="All Weather Investing Test",
        cagr=14.5,
        min_investment=5000.0,
        description="Low volatility multi-asset strategy"
    )
    created = repo.create(item)
    assert created.id is not None
    assert created.name == "All Weather Investing Test"

    items, total = repo.get_all_paginated(1, 10)
    assert total >= 1
    assert any(i.id == created.id for i in items)

    # Delete
    success = repo.delete(created.id)
    assert success is True
