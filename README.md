# Voice AI Platform — P0 Skeleton

Runnable skeleton P0: backend + frontend + Postgres + migrations + auth/RBAC/tenant guards + unified TZ error format + realtime contracts + UI skeleton.

## 1. Prerequisites
- Node.js 20+
- npm 10+
- Docker + Docker Compose

## 2. Install dependencies
```bash
npm install
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

## Smoke check
1) Start infra and run migrations:
```bash
docker compose up -d postgres
npm run migrate -w backend
```

2) Start backend and frontend in separate terminals:
```bash
npm run dev -w backend
npm run dev -w frontend
```

3) Verify health and app pages:
```bash
curl -sS http://localhost:3001/health
```

Open URLs:
- Backend health: `http://localhost:3001/health`
- Frontend app: `http://localhost:5173`

## CI + Smoke check
- Workflow: `.github/workflows/ci.yml`
- Triggers: `push` в `main` и `pull_request`
- CI выполняет:
  1. `npm ci`
  2. `npm run lint`
  3. `npm run test -w backend`
  4. `npm run build -w frontend`
  5. `./scripts/smoke.sh` (поднимает Postgres через `docker compose`, применяет миграции, поднимает backend и проверяет `GET /health`)

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
