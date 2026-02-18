# Voice AI Platform — P0 Skeleton

Runnable skeleton P0: backend + frontend + Postgres + migrations + auth/RBAC/tenant guards + unified TZ error format + realtime contracts + UI skeleton.

## 1. Prerequisites
- Node.js 20+
- npm 10+
- Docker + Docker Compose

## 2. Install dependencies
```bash
npm ci
```

## 3. Start Postgres
```bash
docker compose up -d postgres
```

## 4. Configure env
```bash
cp .env.example .env
```

## 5. Run DB migrations
```bash
npm run migrate -w backend
```

## 6. Run backend (API)
```bash
npm run dev -w backend
```
Backend starts on `http://localhost:3001`.

## 7. Run frontend
```bash
npm run dev -w frontend
```
Frontend starts on `http://localhost:5173`.

## 8. Checks
Lint all:
```bash
npm run lint
```

Backend tests:
```bash
npm run test -w backend
```

Frontend build:
```bash
npm run build -w frontend
```

## Smoke check
```bash
./scripts/smoke.sh
```

`./scripts/smoke.sh` runs minimal backend API smoke tests (`vitest`) and is used as a reproducible local smoke gate.

## 9. Skeleton coverage
- Backend:
  - `GET /health`
  - `/api` routing
  - auth middleware (`Bearer userId:role:orgId`)
  - RBAC guard
  - tenant isolation guard (`x-org-id`, `x-project-id`)
  - TZ error format handler
  - realtime contracts + SSE stub (`GET /api/realtime/stream`)
- Frontend:
  - routing
  - pages: Login, Project Select, Wizard (7 steps)
  - UI copy strings sourced from `docs/UI_COPY.md`
