# Task Checklist (v2)

## Phase 1: Infrastructure & Security Core
- [x] Task 1.1: Local Host Domain Mapping (`/etc/hosts`) & CORS Configuration
- [x] Task 1.2: Zod Schema & Backend Strict Password Policy (`min 7, !@#$%`)
- [x] Task 1.3: Forgot Password & Account Recovery Endpoints

## Checkpoint: Security & Multi-Domain Core
- [x] CORS permits `http://raghuvircons.local` and `http://app.raghuvircons.local`
- [x] Password validation passes for compliant passwords and rejects weak passwords

## Phase 2: Backend Domain Entities, Indexing & Repository Layer
- [x] Task 2.1: Domain Entities for Smallcases, Services, Stocks, Notifications, Tagged Blog Posts, Settings, News
- [x] Task 2.2: Database Indexing & Paginated Repository Layer (Optimized for 50,000+ Records)
- [x] Task 2.3: CRUD API Routers for All 7 Admin Modules

## Phase 3: Backend Unit Testing Suite (`backend/tests/`)
- [x] Task 3.1: Create `backend/tests/` directory & test runner setup
- [x] Task 3.2: Write unit tests for Auth, Smallcases, Services, Portfolio, Reports, Notifications, Blogs (Tags), Investors, Settings

## Checkpoint: API & Unit Tests
- [x] `pytest backend/tests/` passes 100% across all test modules

## Phase 4: Investor Portal Enhancements
- [x] Task 4.1: Historical Performance Chart with FD (5.5%) & Govt Bond (6.0%) Benchmarks
- [x] Task 4.2: News & Announcements Stream for All Investors
- [x] Task 4.3: Investor Profile Management (Phone, Address, Email)
- [x] Task 4.4: Global Broadcast Notifications Banner Panel

## Checkpoint: Investor Portal Verification
- [x] Chart displays benchmark overlays
- [x] Profile update persists phone, address, and email

## Phase 5: Standalone Zaga Admin Portal & CRUD Modules
- [x] Task 5.1: Standalone Admin Layout matching Zaga Design System (`app.raghuvircons.local`)
- [x] Task 5.2: Smallcases & Services Management Modules
- [x] Task 5.3: Model Portfolio Stocks & Research Reports Management
- [x] Task 5.4: Investor Users Management & Password Reset Controls
- [x] Task 5.5: Investor Notifications Workflow (Draft, Published, Archived)
- [x] Task 5.6: Blog Post Manager with Integrated Markdown Editor & Tag Input
- [x] Task 5.7: Platform Settings Manager Module

## Checkpoint: Complete System
- [x] All 7 CRUD modules functioning with server-side pagination & Zaga UI
- [x] Production build succeeds cleanly (`npm run build`)

