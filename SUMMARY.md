# SUMMARY.md

## Созданные файлы
1. `AGENTS.md` — правила исполнения и приоритет источников.
2. `PLANS.md` — ExecPlan P0: архитектура, БД, API, realtime, ошибки, безопасность, observability, этапы по backlog.
3. `ACCEPTANCE_CHECKLIST.md` — чеклист критериев приёмки P0 со статусом `NOT STARTED` и полем Verification.
4. `SUMMARY.md` — сводка и ближайшие шаги.

## Следующие 3 шага реализации
1. Поднять foundation из E01: JWT/refresh, RBAC middleware, audit log, миграции и секреты.
2. Реализовать E03 telephony onboarding: SIP connections (CRUD/check/test-call), phone numbers, базовый UI «Номера и подключение».
3. Запустить E04 runtime-контур: orchestrator state machine + STT/LLM/TTS + tool-calling + handoff оператору.
