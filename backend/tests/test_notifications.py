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
