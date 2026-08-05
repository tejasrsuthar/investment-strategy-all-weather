import uuid
from datetime import datetime
from typing import Optional, List, Tuple
from app.domain.entities import User, ResearchReport, Stock, Subscription, UserStatus, UserRole
from app.infrastructure.db import db

class UserRepository:
    def __init__(self):
        self.collection = db["users"]

    def create(self, user: User) -> User:
        user_dict = user.model_dump()
        user_dict["id"] = str(uuid.uuid4())
        user_dict["created_at"] = datetime.utcnow()
        self.collection.insert_one(user_dict)
        return User(**user_dict)

    def get_by_id(self, user_id: str) -> Optional[User]:
        data = self.collection.find_one({"id": user_id})
        return User(**data) if data else None

    def get_by_email(self, email: str) -> Optional[User]:
        data = self.collection.find_one({"email": email})
        return User(**data) if data else None

    def get_by_username(self, username: str) -> Optional[User]:
        data = self.collection.find_one({"username": username})
        return User(**data) if data else None

    def get_by_google_id(self, google_id: str) -> Optional[User]:
        data = self.collection.find_one({"google_id": google_id})
        return User(**data) if data else None

    def update_status(self, user_id: str, status: UserStatus) -> bool:
        res = self.collection.update_one({"id": user_id}, {"$set": {"status": status}})
        return res.modified_count > 0

    def update_password(self, user_id: str, hashed_password: str) -> bool:
        res = self.collection.update_one({"id": user_id}, {"$set": {"hashed_password": hashed_password}})
        return res.modified_count > 0

    def update_profile(self, user_id: str, username: Optional[str] = None, hashed_password: Optional[str] = None) -> bool:
        update_fields = {}
        if username:
            update_fields["username"] = username
        if hashed_password:
            update_fields["hashed_password"] = hashed_password
        if not update_fields:
            return False
        res = self.collection.update_one({"id": user_id}, {"$set": update_fields})
        return res.modified_count > 0

    def get_all_paginated(self, page: int, limit: int) -> Tuple[List[User], int]:
        total = self.collection.count_documents({})
        cursor = self.collection.find({}).skip((page - 1) * limit).limit(limit)
        items = [User(**doc) for doc in cursor]
        return items, total


class ResearchReportRepository:
    def __init__(self):
        self.collection = db["research_reports"]

    def create(self, report: ResearchReport) -> ResearchReport:
        report_dict = report.model_dump()
        report_dict["id"] = str(uuid.uuid4())
        report_dict["published_at"] = datetime.utcnow()
        self.collection.insert_one(report_dict)
        return ResearchReport(**report_dict)

    def get_by_id(self, report_id: str) -> Optional[ResearchReport]:
        data = self.collection.find_one({"id": report_id})
        return ResearchReport(**data) if data else None

    def update(self, report_id: str, title: str, content: str) -> Optional[ResearchReport]:
        self.collection.update_one(
            {"id": report_id},
            {"$set": {"title": title, "content": content}}
        )
        return self.get_by_id(report_id)

    def update_status(self, report_id: str, status: str) -> Optional[ResearchReport]:
        self.collection.update_one(
            {"id": report_id},
            {"$set": {"status": status}}
        )
        return self.get_by_id(report_id)

    def delete(self, report_id: str) -> bool:
        res = self.collection.delete_one({"id": report_id})
        return res.deleted_count > 0

    def get_all_paginated(self, page: int, limit: int) -> Tuple[List[ResearchReport], int]:
        total = self.collection.count_documents({})
        cursor = self.collection.find({}).sort("published_at", -1).skip((page - 1) * limit).limit(limit)
        items = [ResearchReport(**doc) for doc in cursor]
        return items, total


class StockRepository:
    def __init__(self):
        self.collection = db["stocks"]

    def create(self, stock: Stock) -> Stock:
        stock_dict = stock.model_dump()
        stock_dict["id"] = str(uuid.uuid4())
        stock_dict["added_at"] = datetime.utcnow()
        self.collection.insert_one(stock_dict)
        return Stock(**stock_dict)

    def get_by_id(self, stock_id: str) -> Optional[Stock]:
        data = self.collection.find_one({"id": stock_id})
        return Stock(**data) if data else None

    def update(self, stock_id: str, updated_stock: Stock) -> Optional[Stock]:
        stock_dict = updated_stock.model_dump(exclude={"id", "added_at"})
        self.collection.update_one({"id": stock_id}, {"$set": stock_dict})
        return self.get_by_id(stock_id)

    def delete(self, stock_id: str) -> bool:
        res = self.collection.delete_one({"id": stock_id})
        return res.deleted_count > 0

    def get_all() -> List[Stock]:
        # non-paginated helper for entire model portfolio calculations
        cursor = db["stocks"].find({}).sort("added_at", -1)
        return [Stock(**doc) for doc in cursor]

    def get_all_paginated(self, page: int, limit: int) -> Tuple[List[Stock], int]:
        total = self.collection.count_documents({})
        cursor = self.collection.find({}).sort("added_at", -1).skip((page - 1) * limit).limit(limit)
        items = [Stock(**doc) for doc in cursor]
        return items, total


class SubscriptionRepository:
    def __init__(self):
        self.collection = db["subscriptions"]

    def create_or_update(self, sub: Subscription) -> Subscription:
        sub_dict = sub.model_dump()
        if not sub_dict.get("id"):
            sub_dict["id"] = str(uuid.uuid4())
        self.collection.update_one(
            {"user_id": sub.user_id, "service_type": sub.service_type},
            {"$set": sub_dict},
            upsert=True
        )
        return Subscription(**sub_dict)

    def get_active_subscription(self, user_id: str, service_type: str) -> Optional[Subscription]:
        data = self.collection.find_one({
            "user_id": user_id,
            "service_type": service_type,
            "status": "active",
            "expires_at": {"$gt": datetime.utcnow()}
        })
        return Subscription(**data) if data else None
