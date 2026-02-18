#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
  docker compose down >/dev/null 2>&1 || true
}
trap cleanup EXIT

COMPOSE_STARTED=0

if command -v docker >/dev/null 2>&1; then
  docker compose up -d postgres
  COMPOSE_STARTED=1
fi

echo "Waiting for postgres healthcheck..."
if [[ "$COMPOSE_STARTED" -eq 1 ]]; then
  for _ in {1..30}; do
    status="$(docker inspect --format='{{json .State.Health.Status}}' askhat-postgres 2>/dev/null | tr -d '"' || true)"
    if [[ "$status" == "healthy" ]]; then
      break
    fi
    sleep 2
  done

  if [[ "$(docker inspect --format='{{json .State.Health.Status}}' askhat-postgres | tr -d '"')" != "healthy" ]]; then
    echo "Postgres is not healthy" >&2
    exit 1
  fi
else
  echo "docker not found; expecting external postgres via DATABASE_URL"
fi

for _ in {1..30}; do
  if npm run migrate -w backend >/tmp/askhat-migrate.log 2>&1; then
    break
  fi
  sleep 2
done

if ! npm run migrate -w backend >/tmp/askhat-migrate.log 2>&1; then
  echo "Migrations failed" >&2
  cat /tmp/askhat-migrate.log >&2 || true
  exit 1
fi

npm run dev -w backend > /tmp/askhat-backend.log 2>&1 &
BACKEND_PID=$!

echo "Waiting for backend /health..."
for _ in {1..30}; do
  if curl -fsS "http://127.0.0.1:3001/health" >/dev/null; then
    echo "Smoke check passed"
    exit 0
  fi
  sleep 2
done

echo "Backend /health did not become ready" >&2
cat /tmp/askhat-backend.log >&2 || true
exit 1
