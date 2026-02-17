# PROGRESS.md

| Step | Status | Notes |
|---|---|---|
| 4 | DONE | README smoke-check section added with zero-to-run commands/URLs; attempted local smoke bootstrap, blocked by npm registry 403 in environment. |
| 5 | DONE | Added API tests for: no bearer token (401 TZ-format), RBAC deny (403), tenant mismatch deny (403). |
| 6 | DONE | Added calls API (`/api/calls/test-call`, state transitions, inbox events) and realtime stream now emits latest call event in TZ event shape. |
| 7 | DONE | Implemented 7-step Wizard UI flow with draft/submit API calls and minimal validation/status messages; added wizard API smoke test. |
| 8 | DONE | Added integration endpoints for Bitrix24/amoCRM/Google Calendar (connect/check/logs), added integration smoke test, refreshed acceptance checklist and questions. |

## Decision log
- Following strict P0-only implementation boundaries from TZ/BACKLOG.
- Environment package install currently blocked by npm 403; continue with code-level changes and command-level verification where possible.
- Kept TZ error envelope (`error.code/human_title/human_how_to_fix/details.trace_id`) for security denials.
- Calls state machine kept minimal for P0: inbound/outbound transition flow with `call.started`, `call.state_changed`, `call.ended` events.
- Wizard copy uses TZ/UI_COPY step texts (7 steps) and supports draft (`/api/wizard/draft`) + submit (`/api/wizard/submit`).
- Integrations implemented as project-scoped contract endpoints: `/api/integrations/:provider/connect`, `/api/integrations/:id/check`, `/api/integrations/:id/logs`.
