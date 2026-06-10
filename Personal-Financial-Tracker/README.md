# PFT (Personal Finance Tracker)

PFT is an institutional-grade, bilingual personal finance tracker designed to help you manage your wealth securely. Track your transactions, visualize your cash flow, and generate comprehensive reports in both English and Arabic.

## 🚀 Features

- **Bilingual Interface**: Seamlessly switch between English (LTR) and Arabic (RTL) natively across the entire platform.
- **Financial Dashboards**: Institutional-grade visualization of income vs expenses, category breakdowns, and active budgets.
- **Robust Transactions Engine**: Add, categorize, and track recurring transactions. All monetary values are handled precisely without floating-point inaccuracies.
- **Budgeting**: Create monthly spending limits and track your progress.
- **Reports**: Generate highly detailed, interactive financial reports.
- **Secure Authentication**: Protected by Argon2id password hashing and robust JWT implementation.

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **State Management**: Redux Toolkit & React Query
- **Styling**: Tailwind CSS
- **i18n**: Custom dictionary architecture fully supporting RTL

### Backend
- **Runtime**: Node.js 18 + Express
- **Language**: TypeScript
- **Database**: PostgreSQL 15 via Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT (7-day access, 30-day refresh)
- **Security**: Argon2id password hashing, strict RBAC enforced on all protected routes

## 📂 Project Structure

Currently, the repository contains the frontend client structured using a feature-based architecture for maximum scalability.

```text
PFT/
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable global UI components (buttons, inputs, layout shell)
│   │   ├── features/      # Isolated feature modules
│   │   │   ├── accounts/      # Bank accounts and wallets management
│   │   │   ├── admin/         # Administrative dashboards and user management
│   │   │   ├── auth/          # Login, Register, OTP, and Profile Settings
│   │   │   ├── budgets/       # Monthly spending limits and budget tracking
│   │   │   ├── dashboard/     # Landing page and main analytics dashboard
│   │   │   ├── notifications/ # User alerts and system notifications
│   │   │   ├── reports/       # Interactive financial data reporting
│   │   │   └── transactions/  # Income, expenses, transfers, and recurring tracking
│   │   ├── router/        # React Router configuration
│   │   ├── store/         # Global Redux state (e.g. language preferences)
│   │   └── assets/        # Static files and branding imagery
└── backend/           # (Planned) Node.js + Express + Prisma API
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)
- Redis

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with PostgreSQL and Redis connection strings.
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

## 🔒 Security & Architecture Principles

- **Precision Pricing**: All monetary values are strictly `DECIMAL(18,2)`.
- **ACID Compliance**: All balance updates use atomic Prisma transactions and will rollback completely on failure.
- **Transfer Isolation**: Transfer transactions are excluded from income/expense totals to prevent duplicate counting.
- **API Standards**: All responses are JSON. Standardized error payloads: `{ error: { code, message, details } }`.

## 📜 License

© 2026 PFT Personal Finance Tracker. All rights reserved.
