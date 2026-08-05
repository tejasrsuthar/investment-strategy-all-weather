# Spec: Raghuvir Consultants Enterprise Transition

## Objective
Migrate the static SEBI Registered Research Analyst website for Raghuvir Consultants into an enterprise-grade platform. The system will support two classes of users (Admin and Investor), implement strict Clean Architecture, enforce secure role-based access, and provide paid subscriptions to Research Reports and Model Portfolios using Stripe and UPI.

---

## Tech Stack
- **Frontend:** React (Vite, Tailwind CSS). No Next.js framework.
- **Backend:** Python FastAPI.
- **Database:** MongoDB.
- **ORM/ODM:** SQLAlchemy using a MongoDB connection wrapper (such as a custom MongoDB connector or a dialect bridge).
- **Payment Gateways:** Stripe API, UPI Payment Integration (Payload-based / Webhook validation).
- **Authentication:** Google OAuth2 and JWT-based Username/Password authentication.

---

## Project Structure
```
raghuvirconsultants-site/
├── bkp_site/                      # Original static site templates
├── SPEC.md                        # This specification
├── frontend/                      # Pure React frontend
│   ├── src/
│   │   ├── components/            # Shared UI components (Layouts, Buttons, Tables)
│   │   ├── pages/                 # Public static views (Home, About, Services, Contact)
│   │   ├── investor/              # Investor views (Reports List, Portfolio Table, Checkout)
│   │   ├── admin/                 # Admin views (Investor list, Reports CRUD, Stocks CRUD)
│   │   └── App.jsx
│   └── package.json
└── backend/                       # Python FastAPI Backend
    ├── app/
    │   ├── domain/                # Entities, Value Objects, and core invariants
    │   ├── use_cases/             # Application business rules
    │   ├── infrastructure/        # SQLAlchemy database model config, Stripe/UPI, OAuth adapters
    │   ├── interfaces/            # API Controllers (Routers), Schemas (Pydantic requests/responses)
    │   └── main.py                # App configuration and startup
    ├── requirements.txt
    └── tests/                 # Pytest suite
```

---

## Database Schemas & Entities

### 1. User
- `id`: Unique Identifier
- `username`: String (nullable for Google Auth)
- `email`: String (unique)
- `hashed_password`: String (nullable for Google Auth)
- `google_id`: String (nullable)
- `role`: Enum (`admin`, `investor`)
- `status`: Enum (`active`, `disabled`, `blacklisted`)
- `created_at`: DateTime

### 2. ResearchReport
- `id`: Unique Identifier
- `title`: String
- `content`: String
- `published_at`: DateTime

### 3. Stock (Model Portfolio)
- `id`: Unique Identifier
- `ticker`: String (e.g. "TCS")
- `name`: String (e.g. "Tata Consultancy Services")
- `entry_price`: Float
- `target_price`: Float
- `stop_loss`: Float
- `weightage`: Float (percentage, e.g. 5.5)
- `transaction_type`: Enum (`BUY`, `SELL`)
- `added_at`: DateTime

### 4. Subscription
- `id`: Unique Identifier
- `user_id`: Reference to User
- `service_type`: Enum (`reports`, `portfolio`)
- `status`: Enum (`active`, `expired`)
- `stripe_subscription_id`: String (nullable)
- `upi_transaction_id`: String (nullable)
- `expires_at`: DateTime

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create Username/Password Investor account
- `POST /api/auth/login` - Authenticate Username/Password, returns JWT
- `POST /api/auth/google` - Exchange Google Token for local session JWT
- `POST /api/auth/forgot-password` - Request password reset token via email
- `POST /api/auth/reset-password` - Reset password using validation token

### Admin Panel
- `GET /api/admin/investors` - Paginated investor list (`?page=1&limit=10`)
- `PUT /api/admin/investors/{id}/status` - Enable, disable, or blacklist user
- `POST /api/admin/reports` - Publish new Research Report
- `PUT /api/admin/reports/{id}` - Edit report
- `DELETE /api/admin/reports/{id}` - Remove report
- `POST /api/admin/portfolio/stocks` - Add stock to Model Portfolio
- `PUT /api/admin/portfolio/stocks/{id}` - Modify stock in portfolio
- `DELETE /api/admin/portfolio/stocks/{id}` - Delete stock from portfolio

### Investor Portal & Public
- `GET /api/reports` - Fetch paginated published reports (Requires active `reports` subscription)
- `GET /api/portfolio` - Fetch entire Model Portfolio stocks list (Requires active `portfolio` subscription)
- `POST /api/payments/checkout` - Initiate subscription payment (Stripe checkout session or UPI intent link)
- `POST /api/payments/webhook` - Stripe webhook receiver to update subscription status

---

## Boundaries
- **Always:** Require JWT validation and active role checks for `/api/admin/*` and subscription check for premium endpoints. Verify pagination parameters `page >= 1` and `limit <= 100`.
- **Ask first:** Changes to DB schema definitions.
- **Never:** Expose hashed passwords or tokens in standard API responses. Allow disabled or blacklisted users to obtain auth tokens.
