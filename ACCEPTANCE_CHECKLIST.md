# ACCEPTANCE_CHECKLIST.md

Источник критериев: `docs/TZ.md`, раздел **13.3 Критерии приёмки релиза P0**.

| # | Acceptance пункт (из TZ) | Status | Verification |
|---|---|---|---|
| 1 | Клиент проходит Wizard и делает успешный тест-звонок без инженера. | IN PROGRESS | Wizard draft/submit API and 7-step UI flow implemented; test-call API added (`POST /api/calls/test-call`). End-to-end runtime check remains blocked by npm dependency install restrictions in current environment. |
| 2 | Входящие и исходящие звонки работают; есть перевод на оператора с контекстом. | NOT STARTED | Skeleton verification: архитектурный каркас backend и tenant-scoped API готов, но telephony/orchestrator/handoff бизнес-логика не реализована. |
| 3 | Интеграции Bitrix24/amoCRM/Google Calendar работают и проверяются кнопкой «Проверить». | IN PROGRESS | Implemented API connect/check/logs flow for `bitrix24`, `amocrm`, `google-calendar`; backend smoke test verifies connect + check + logs for Bitrix24. |
| 4 | Сообщения по всем каналам отправляются, есть шаблоны и журнал статусов. | NOT STARTED | Skeleton verification: заложен realtime/event каркас и единый error-handler, но каналы сообщений/шаблоны/журнал ещё не реализованы. |
| 5 | По каждому звонку отображаются итог, транскрипт, действия, ошибки и стоимость. | NOT STARTED | Skeleton verification: определены API/error/realtime контракты foundation-уровня; полноценные calls/inbox данные и UI карточка звонка не реализованы. |
| 6 | Живой монитор отображает текущие звонки/кампании/сообщения/расходы в реальном времени. | IN PROGRESS | Implemented call event generation and SSE stream now emits latest project call event (`call.started`/`call.state_changed`/`call.ended`) in TZ event schema. |
| 7 | RBAC, audit log и изоляция данных подтверждены тестами. | IN PROGRESS | Added backend API tests for no token, RBAC forbidden role, and foreign tenant/org mismatch with TZ-format error envelope; audit log remains pending. |
