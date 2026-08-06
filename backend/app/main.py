from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.interfaces import auth_router, admin_router, reports_router, portfolio_router, payments_router, crud_routers, system_router
from app.infrastructure.repositories import UserRepository
from app.domain.entities import User, UserRole, UserStatus
from app.core.security import get_password_hash

app = FastAPI(
    title="Raghuvir Consultants API",
    description="Enterprise Advisory System Backend",
    version="2.4.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")
app.include_router(reports_router.router, prefix="/api")
app.include_router(portfolio_router.router, prefix="/api")
app.include_router(payments_router.router, prefix="/api")
app.include_router(crud_routers.router, prefix="/api")
app.include_router(system_router.router, prefix="/api")

@app.on_event("startup")
def seed_admin():
    user_repo = UserRepository()
    admin_email = "admin@raghuvir.com"
    existing = user_repo.get_by_email(admin_email)
    if not existing:
        admin_user = User(
            username="Admin",
            email=admin_email,
            hashed_password=get_password_hash("admin12345"),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        )
        user_repo.create(admin_user)
        print("Admin user seeded successfully!")
    else:
        user_repo.update_password(existing.id, get_password_hash("admin12345"))

@app.get("/")
def read_root():
    return {"message": "Raghuvir Consultants API is running"}
