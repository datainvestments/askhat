# PROGRESS.md

| Step | Status | Notes |
|---|---|---|
| A | DONE | Calls API expanded: `GET /api/calls`, `GET /api/calls/:id`, `POST /api/calls/:id/issue`, `POST /api/calls/:id/add-to-kb`, `POST /api/calls/test-call`, state transitions + details payload with outcome/transcript/tool invocations/issues/cost. Wizard now drives test call to calls details page. |
| B | DONE | Added inbound/outbound creation (`POST /api/calls`) and handoff state with context packet in call details; realtime stream includes call lifecycle events. |
| C | DONE | Integrations API for Bitrix24/amoCRM/Google Calendar supports connect/check/logs; realtime emits `integration.up`. Frontend integrations screen with «Проверить». |
| D | DONE | Messages API added (`/api/channels/:type/connect`, `/api/channels/:type/check`, `/api/templates`, `/api/templates/:id/test-send`, `/api/messages`) + realtime `message.sent`/`message.delivered`; frontend messages screen with templates and journal. |
| E | DONE | Live monitor endpoint `/api/monitor/live` and frontend `/monitor` page display calls/campaigns/messages/spend; realtime stream includes campaign and budget threshold events. |
| F | DONE | Security checks covered (401, RBAC 403, tenant mismatch 403), audit log persisted in-memory and exposed via `/api/audit/logs` (RBAC-protected), tenant filtering enforced on API/realtime. |
| G | DONE | Updated `ACCEPTANCE_CHECKLIST.md`, `PROGRESS.md`, and `QUESTIONS.md` with completed status and verification commands. |

## Commands run
- `npm run lint`
- `npm run test -w backend`
- `npm run build -w backend`
- `npm run build -w frontend`
- `./scripts/smoke.sh`

## Notes
- GitHub remote CI/check statuses are not verifiable in this container; local CI-equivalent commands are green.
