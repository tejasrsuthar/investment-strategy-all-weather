from app.domain.entities import Notification, NotificationStatus
from app.infrastructure.repositories import NotificationRepository

def test_notifications_workflow():
    repo = NotificationRepository()
    notif = Notification(
        title="Scheduled Maintenance",
        message="System upgraded tonight at 2 AM",
        status=NotificationStatus.DRAFT,
        created_by="Admin"
    )
    created = repo.create(notif)
    assert created.status == NotificationStatus.DRAFT

    # Update to PUBLISHED
    created.status = NotificationStatus.PUBLISHED
    updated = repo.update(created.id, created)
    assert updated.status == NotificationStatus.PUBLISHED

    repo.delete(created.id)

def test_bulk_notifications_and_doc_link():
    repo = NotificationRepository()
    n1 = repo.create(Notification(title="N1", message="M1", status=NotificationStatus.DRAFT))
    n2 = repo.create(Notification(title="N2", message="M2", status=NotificationStatus.DRAFT))
    
    assert n1.id is not None
    assert n2.id is not None

    repo.delete(n1.id)
    repo.delete(n2.id)
