from datetime import datetime
from app.infrastructure.repositories import ActivityLogRepository
from app.domain.entities import ActivityLog

activity_repo = ActivityLogRepository()

def log_activity(user_id: str, username: str, action: str, description: str):
    try:
        log = ActivityLog(
            user_id=user_id,
            username=username,
            action=action,
            description=description,
            timestamp=datetime.utcnow()
        )
        activity_repo.create(log)
    except Exception as e:
        print(f"Failed to write activity log: {e}")
