# Implementation Plan: Enterprise Advisory System Overhaul & Standalone Admin Portal (v2)

## Overview
Decompose the enterprise application upgrade into modular, verifiable tasks. The overhaul covers multi-domain local setup, advanced password security with Zod, benchmarked model portfolio analytics, broadcast notifications workflow, live markdown blog publishing with tags, Zaga-style standalone admin UI, 50,000+ record optimized indexing & pagination, and unit testing suite inside `backend/tests/`.

## Task Breakdown & Dependency Graph

```
Phase 1: Multi-Domain Infrastructure & Security Core
    │
    ├── Phase 2: Backend Entities, Indexing & Repository Layer
    │       │
    │       ├── Phase 3: Backend Unit Testing Suite (backend/tests/)
    │       │       │
    │       │       ├── Phase 4: Investor Portal Enhancements (Charts, News, Profile)
    │       │       │
    │       │       └── Phase 5: Standalone Zaga Admin Portal & CRUD Modules
    │       │               │
    │       │               └── Phase 6: Verification & End-to-End Polish
```

### Phase 1: Multi-Domain Infrastructure & Security Core
- [ ] Task 1.1: Local Host Domain Mapping (`/etc/hosts`) & CORS Configuration
- [ ] Task 1.2: Zod Schema & Backend Strict Password Policy (`min 7, !@#$%`)
- [ ] Task 1.3: Forgot Password & Account Recovery Endpoints

### Checkpoint: Security & Multi-Domain Core
- [ ] CORS permits `http://raghuvircons.local` and `http://app.raghuvircons.local`
- [ ] Password validation passes for compliant passwords and rejects weak passwords

### Phase 2: Backend Domain Entities, Indexing & Repository Layer
- [ ] Task 2.1: Domain Entities for Smallcases, Services, Stocks, Notifications, Tagged Blog Posts, Settings, News
- [ ] Task 2.2: Database Indexing & Paginated Repository Layer (Optimized for 50,000+ Records)
- [ ] Task 2.3: CRUD API Routers for All 7 Admin Modules

### Phase 3: Backend Unit Testing Suite (`backend/tests/`)
- [ ] Task 3.1: Create `backend/tests/` directory & test runner setup
- [ ] Task 3.2: Write unit tests for Auth, Smallcases, Services, Portfolio, Reports, Notifications, Blogs (Tags), Investors, Settings

### Checkpoint: API & Unit Tests
- [ ] `pytest backend/tests/` passes 100% across all 9 test modules

### Phase 4: Investor Portal Enhancements
- [ ] Task 4.1: Historical Performance Chart with FD (5.5%) & Govt Bond (6.0%) Benchmarks
- [ ] Task 4.2: News & Announcements Stream for All Investors
- [ ] Task 4.3: Investor Profile Management (Phone, Address, Email)
- [ ] Task 4.4: Global Broadcast Notifications Banner Panel

### Checkpoint: Investor Portal Verification
- [ ] Chart displays benchmark overlays
- [ ] Profile update persists phone, address, and email

### Phase 5: Standalone Zaga Admin Portal & CRUD Modules
- [ ] Task 5.1: Standalone Admin Layout matching Zaga Design System (`app.raghuvircons.local`)
- [ ] Task 5.2: Smallcases & Services Management Modules
- [ ] Task 5.3: Model Portfolio Stocks & Research Reports Management
- [ ] Task 5.4: Investor Users Management & Password Reset Controls
- [ ] Task 5.5: Investor Notifications Workflow (Draft, Published, Archived)
- [ ] Task 5.6: Blog Post Manager with Integrated Markdown Editor & Tag Input
- [ ] Task 5.7: Platform Settings Manager Module

### Checkpoint: Complete System
- [ ] All 7 CRUD modules functioning with server-side pagination & Zaga UI
- [ ] Production build succeeds cleanly (`npm run build`)
