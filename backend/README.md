# Personal Finance Tracker API

Backend generated strictly from `api_spec.yaml`, `SRS.txt`, and `user-stories.txt`.

## High-Level Analysis

Entities:

- `User`, `Role`
- `Account`
- `Transaction`
- `Category`
- `Budget`
- `RecurringTemplate`
- `Notification`
- `AuditLog`
- `ReportHistory`
- `RevokedToken`

Relationships:

- A user owns accounts, transactions, budgets, recurring templates, notifications, and reports.
- Every transaction belongs to exactly one account.
- Expense transactions require a category; income categories are optional.
- Budgets are unique by user, category, month, and year.
- Transfers create paired transaction records linked by `transferPairId`.
- Admin audit logs are immutable records of admin actions.

Key flows:

- Registration hashes passwords with Argon2id and sends verification email placeholder.
- Login rejects unverified/suspended users, locks account for 15 minutes after 5 failed attempts, and requires TOTP for admins.
- Account creation enforces the 10-account limit and records an Initial Balance transaction.
- Transaction writes update balances atomically and trigger budget threshold checks.
- Transfers create debit and credit records in one database transaction.
- Reports generate structured monthly or annual data and can export a PDF payload.
- Admin routes require admin JWT access with verified 2FA.

## Folder Structure

```text
.
├── .env.example
├── README.md
├── api_spec.yaml
├── package.json
├── prisma
│   ├── schema.prisma
│   └── seed.js
├── src
│   ├── app.js
│   ├── config
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers
│   ├── middlewares
│   ├── routes
│   ├── server.js
│   ├── services
│   ├── utils
│   └── validators.js
├── SRS.txt
└── user-stories.txt
```

## Implemented Routes

All routes from `api_spec.yaml` are implemented:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`
- `GET /accounts`
- `POST /accounts`
- `GET /accounts/:id`
- `PATCH /accounts/:id`
- `DELETE /accounts/:id`
- `POST /accounts/transfer`
- `GET /transactions`
- `POST /transactions`
- `GET /transactions/:id`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id`
- `DELETE /transactions/bulk`
- `GET /recurring`
- `POST /recurring`
- `PATCH /recurring/:id`
- `DELETE /recurring/:id`
- `POST /recurring/:id/skip`
- `GET /budgets`
- `POST /budgets`
- `PATCH /budgets/:id`
- `DELETE /budgets/:id`
- `GET /categories`
- `POST /reports/generate`
- `POST /reports/export/pdf`
- `GET /reports/history`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`
- `GET /admin/users`
- `PATCH /admin/users/:id/status`
- `DELETE /admin/users/:id`
- `GET /admin/analytics`
- `GET /admin/audit`
- `POST /admin/categories`
- `PATCH /admin/categories/:id`
- `POST /admin/broadcast`

Routes are mounted at both `/` and `/v1` to match local development and the OpenAPI base URL path convention.

## TODOs From Missing Spec Details

- Email verification endpoint/token format is not present in `api_spec.yaml`.
- Phone OTP verification endpoint/format is not present in `api_spec.yaml`.
- SMTP/SMS vendor settings are not specified; `emailService` is a safe placeholder.
- Object storage fields for receipt uploads and PDF URLs are not specified.
- Analytics bucket response shape is not specified.
- Full recurring scheduler implementation is outside the listed API endpoints and needs job semantics beyond the route spec.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Required environment variables are documented in `.env.example`.

Swagger UI is available after startup at:

```text
http://localhost:3000/docs
```

The raw OpenAPI YAML is served from:

```text
http://localhost:3000/docs/openapi.yaml
```

## Verification

Syntax validation was run with:

```bash
find src prisma -name '*.js' -exec node --check {} \;
```
