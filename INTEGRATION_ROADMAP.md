# PFT (Personal Finance Tracker) — Integration Roadmap

This document provides a comprehensive overview of the Personal Finance Tracker (PFT) project context, details the integration work completed so far, and outlines the remaining steps required to achieve 100% feature parity between the frontend client and the backend REST API.

---

## 📖 1. Project Context

PFT is an institutional-grade, bilingual (English & Arabic) personal finance tracker designed with precise monetary tracking, atomic transactions, and role-based access control.

### Technology Stack
* **Frontend:** React 18 + Vite + TypeScript + Redux Toolkit + Tailwind CSS + RTL/i18n.
* **Backend:** Node.js 18 + Express (CommonJS) + Prisma ORM + PostgreSQL + Argon2id password hashing + JWT session security.
* **Database & Caching:** PostgreSQL 15 + Redis (for token revoking and session caching).

### Architecture & Design Rules
1. **Precision Currency:** All monetary values must be stored/handled as `DECIMAL(18,2)` to prevent floating-point calculation errors.
2. **ACID Compliance:** Balance updates are processed atomically via Prisma database transactions, rolling back completely on any failures.
3. **Isolation of Transfers:** Transfer transactions are paired debit/credit records linked by `transferPairId` and are excluded from income/expense sums.
4. **Auth Security:** Authentication uses JWT tokens (7-day access, 30-day refresh) passed via the `Authorization: Bearer <token>` header or `accessToken`/`refreshToken` HTTP cookies.
5. **Errors:** All error payloads use a standardized JSON wrapper:
   ```json
   {
     "error": {
       "code": "ERROR_CODE",
       "message": "Human readable message",
       "details": {}
     }
   }
   ```

---

## 🚀 2. What Has Been Done

We have established the connection framework, fixed all frontend compilation and layout bugs, and verified core services:

### A. Frontend Compilation & UI Fixes
* **TypeScript & Prop Fixes:** Resolved multiple compilation errors across `AccountDetailPage.tsx`, `AccountsPage.tsx`, `AdminDashboardPage.tsx`, and `ProfileSettingsPage.tsx` to enable successful production builds.
* **RTL Slide-In Animation:** Replaced invalid nested `@keyframes` inside CSS selectors with a top-level separate keyframe structure (`slideInRtl`) and a standard `.animate-slide-in` class.

### B. Database Schema & Mock Seed
* **Schema Sync:** Synchronized the PostgreSQL database schema with Prisma directly using `npx prisma db push`.
* **Seeding:** Seeded database roles (`guest`, `user`, `admin`) and baseline system categories (Food, Utilities, Salary, initial_balance, transfer, etc.).

### C. Core API & Authenticated Flows Integrated
The following components are now fully integrated and communicating with the backend:
* **Registration (`/auth/register`):** Creates users with `status: "active"`.
* **Login (`/auth/login`):** Exchanges credentials for Access/Refresh tokens and updates the Redux store.
* **Token Refresh (`/auth/refresh`):** The Axios interceptor silently exchanges refresh tokens on `401 Unauthorized` responses.
* **Accounts Overview (`/accounts`):** Loads active accounts, calculates net worth, handles archiving and deletion.
* **Account Details (`/accounts/:id`):** Dynamically loads account headers and associated transaction feeds.
* **Dashboard (`/dashboard`):** Fetches active accounts, latest transactions, budgets, and recurring list values in a single `Promise.all` sequence.

---

## 📋 3. Next Steps: Full Feature Integration

To make the remaining parts of the application work together, the following pages and modals need to be migrated from static fallback data to API services:

### 1. Transactions Feed & Management (`TransactionsPage.tsx`)
Currently uses static mock rows.
* **To Be Done:**
  * Fetch paginated list using `GET /transactions` with query filters for page, limit, type, account, and category.
  * Connect the transaction creation form to `POST /transactions`.
  * Implement bulk deleting using `DELETE /transactions/bulk` with an array of transaction IDs.
  * Add transactional updates using `PATCH /transactions/:id`.

### 2. Add / Transfer Modals (`AddTransferModal.tsx` & transaction forms)
Currently show alert dialog placeholders.
* **To Be Done:**
  * Hook up the transfer modal to `POST /accounts/transfer` passing `sourceAccountId`, `destinationAccountId`, `amount`, `date`, and `description`.

### 3. Budget Planning (`BudgetsPage.tsx`)
Currently uses mock data.
* **To Be Done:**
  * Fetch monthly category budgets using `GET /budgets?month=X&year=Y`.
  * Connect budget creation to `POST /budgets` with `categoryId`, `amount`, `month`, and `year`.
  * Integrate editing and deletion via `PATCH /budgets/:id` and `DELETE /budgets/:id`.
  * Ensure transaction inserts query threshold levels to trigger real-time notification alerts (e.g., budget exceeded 80% or 100%).

### 4. Recurring Transactions (`RecurringPage.tsx`)
Currently uses static templates.
* **To Be Done:**
  * Retrieve active schedulers using `GET /recurring`.
  * Connect scheduler creation to `POST /recurring` with custom frequencies (daily, weekly, biweekly, monthly, quarterly, yearly).
  * Integrate skip/pause actions using `POST /recurring/:id/skip` and `PATCH /recurring/:id`.

### 5. Report Generation & Analytics (`ReportsPage.tsx` & `ReportPreviewPage.tsx`)
Currently uses frontend mockup data.
* **To Be Done:**
  * Connect analytical report generation to `POST /reports/generate`.
  * Integrate PDF exports by consuming `POST /reports/export/pdf`.
  * Fetch lists of previous reports using `GET /reports/history`.

### 6. Profile Settings & Preferences (`ProfileSettingsPage.tsx`)
Currently saves profile changes locally in React state.
* **To Be Done:**
  * Fetch initial user details on settings mount using `GET /users/me`.
  * Save profile updates using `PATCH /users/me`.
  * Handle account termination using `DELETE /users/me`.
  * Connect notification channel toggles to `PATCH /notifications/preferences`.

### 7. Notification Center (`NotificationsPage.tsx` & header counts)
Currently employs static mocks.
* **To Be Done:**
  * Fetch active alerts using `GET /notifications`.
  * Connect mark-as-read/mark-all-read buttons to `PATCH /notifications/:id/read` and `PATCH /notifications/read-all`.

### 8. Administration Dashboard (`AdminDashboardPage.tsx` & `AdminUsersPage.tsx`)
Currently uses client-side lists.
* **To Be Done:**
  * Lock access behind 2FA verification middleware checks.
  * Fetch administrative lists using `GET /admin/users` and analytics/audit endpoints (`GET /admin/analytics`, `GET /admin/audit`).
  * Integrate user suspension and deletion using `PATCH /admin/users/:id/status` and `DELETE /admin/admin/users/:id`.
  * Hook custom category management to `POST /admin/categories` and `PATCH /admin/categories/:id`.
  * Support platform-wide banner messages using `POST /admin/broadcast`.
