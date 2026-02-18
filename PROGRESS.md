# PROGRESS.md

| Step | Status | Notes |
|---|---|---|
| 1 | DONE (local) | Reproducible install/run baseline tightened: added root `package-lock.json`, switched README install to `npm ci`, added executable `scripts/smoke.sh`, and verified `npm ci`, `npm run lint`, `npm run test -w backend`, `npm run build -w frontend`, `./scripts/smoke.sh` locally. GitHub PR/CI operations for #6/#7 could not be executed in this environment because `gh` is unavailable and outbound access to github.com is blocked (HTTP 403 via proxy). |
| 4 | DONE | README smoke-check section added with zero-to-run commands/URLs; attempted local smoke bootstrap, blocked by npm registry 403 in environment. |
| 5 | DONE | Added API tests for: no bearer token (401 TZ-format), RBAC deny (403), tenant mismatch deny (403). |
| 6 | DONE | Added calls API (`/api/calls/test-call`, state transitions, inbox events) and realtime stream now emits latest call event in TZ event shape. |
| 7 | DONE | Implemented 7-step Wizard UI flow with draft/submit API calls and minimal validation/status messages; added wizard API smoke test. |
| 8 | DONE | Added integration endpoints for Bitrix24/amoCRM/Google Calendar (connect/check/logs), added integration smoke test, refreshed acceptance checklist and questions. |

## Decision log
- GitHub PR/CI verification via gh CLI is blocked in current environment (no `gh` binary + github.com 403 through proxy), so merge/check steps for PR #6/#7 require execution in a network-enabled runner.
- Following strict P0-only implementation boundaries from TZ/BACKLOG.
- Environment package install currently blocked by npm 403; continue with code-level changes and command-level verification where possible.
- Kept TZ error envelope (`error.code/human_title/human_how_to_fix/details.trace_id`) for security denials.
- Calls state machine kept minimal for P0: inbound/outbound transition flow with `call.started`, `call.state_changed`, `call.ended` events.
- Wizard copy uses TZ/UI_COPY step texts (7 steps) and supports draft (`/api/wizard/draft`) + submit (`/api/wizard/submit`).
- Integrations implemented as project-scoped contract endpoints: `/api/integrations/:provider/connect`, `/api/integrations/:id/check`, `/api/integrations/:id/logs`.
