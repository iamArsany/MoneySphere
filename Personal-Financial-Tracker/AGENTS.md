cat > AGENTS.md << 'EOF'
# PFT Project — Codex Instructions

## Stack
- Frontend: React 18 + Vite + TypeScript + Redux Toolkit + React Query + Tailwind CSS
- Backend: Node.js 18 + Express + TypeScript + Prisma + PostgreSQL 15 + Redis
- Auth: JWT (7-day access, 30-day refresh) + Argon2id password hashing
- i18n: react-i18next, supports en and ar (RTL)

## Rules
- All monetary values: DECIMAL(18,2), never floating-point
- All balance updates: atomic Prisma transactions, rollback on failure
- Expense transactions must belong to a category
- Transfer transactions excluded from income/expense totals
- Passwords: Argon2id only, never logged or stored plaintext
- RBAC enforced on every protected route via middleware

## Folder Structure
- Frontend: frontend/src/features/<module>/
- Backend: backend/src/modules/<module>/controller.ts, service.ts, routes.ts, dto.ts

## API
- Base URL: /api/v1
- All responses: JSON
- Error format: { error: { code, message, details } }
- Auth: Bearer token in Authorization header
EOF