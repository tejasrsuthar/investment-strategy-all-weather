# Enterprise API Reference Manual (v2.0.0)

Complete specification of all backend REST endpoints provided by Raghuvir Consultants API (`http://localhost:8000/api`).

---

## 1. Authentication & Profile Endpoints (`/api/auth`)

### `POST /api/auth/login`
- **Description**: Authenticate user/admin credentials and generate Bearer JWT token.
- **Request Payload**:
  ```json
  {
    "email": "admin@raghuvir.com",
    "password": "admin12345"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "role": "admin",
    "username": "Admin",
    "email": "admin@raghuvir.com"
  }
  ```

### `POST /api/auth/register`
- **Description**: Register a new investor account.
- **Request Payload**:
  ```json
  {
    "username": "AdityaSharma",
    "password": "Password123!",
    "email": "aditya@example.com"
  }
  ```

### `PUT /api/auth/profile`
- **Description**: Update logged-in user or admin profile credentials.
- **Headers**: `Authorization: Bearer <token>`
- **Request Payload**:
  ```json
  {
    "username": "AdminNew",
    "password": "admin12345New!"
  }
  ```

---

## 2. Research Reports Endpoints (`/api/reports`)

### `GET /api/reports?page=1&limit=10`
- **Description**: Fetch published equity research reports (Requires Investor/Admin token).

### `POST /api/reports`
- **Description**: Create a new research report (Admin access required).
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Payload**:
  ```json
  {
    "title": "IT Sector Quarterly Outlook",
    "content": "Detailed institutional analysis...",
    "status": "published"
  }
  ```

### `PUT /api/reports/{id}` & `DELETE /api/reports/{id}`
- **Description**: Update or delete research report by ID (Admin only).

---

## 3. Model Portfolio Endpoints (`/api/portfolio`)

### `GET /api/portfolio?page=1&limit=10`
- **Description**: Fetch active model portfolio stock allocations.

### `POST /api/portfolio`
- **Description**: Add stock holding entry (Admin only).
- **Request Payload**:
  ```json
  {
    "ticker": "RELIANCE",
    "name": "Reliance Industries Ltd.",
    "entry_price": 2450.5,
    "target_price": 3100.0,
    "stop_loss": 2200.0,
    "weightage": 15.0,
    "transaction_type": "BUY"
  }
  ```

---

## 4. Blog Posts Endpoints (`/api/blogs`)

### `GET /api/blogs?page=1&limit=10&tag=Equities`
- **Description**: Fetch blog posts with optional tag filtering.

### `POST /api/blogs`
- **Description**: Publish Markdown blog article with multiple tags (Admin only).
- **Request Payload**:
  ```json
  {
    "title": "Macro Trends 2026",
    "slug": "macro-trends-2026",
    "markdown_content": "# Heading\nContent...",
    "tags": ["Equities", "Macro", "Wealth"],
    "status": "published"
  }
  ```

---

## 5. System Status Telemetry Endpoint (`/api/system/status`)

### `GET /api/system/status`
- **Description**: Public/Admin endpoint returning real-time API version, MongoDB ping speed in ms, and CPU/Memory telemetry.
- **Response (200 OK)**:
  ```json
  {
    "api_status": "online",
    "api_version": "2.0.0",
    "environment": "production",
    "uptime_seconds": 3600,
    "database": {
      "status": "connected",
      "ping_ms": 12.4,
      "engine": "MongoDB Atlas / Local"
    },
    "system_metrics": {
      "cpu_usage_pct": 14.2,
      "memory_usage_pct": 38.5,
      "memory_total_mb": 16384,
      "memory_used_mb": 6308,
      "platform": "macOS",
      "python_version": "3.12.8"
    }
  }
  ```
