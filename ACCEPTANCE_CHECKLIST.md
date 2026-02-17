# ACCEPTANCE_CHECKLIST.md

Источник критериев: `docs/TZ.md`, раздел **13.3 Критерии приёмки релиза P0**.

| # | Acceptance пункт (из TZ) | Status | Verification |
|---|---|---|---|
| 1 | Клиент проходит Wizard и делает успешный тест-звонок без инженера. | FOUNDATION READY | Skeleton verification: в frontend есть Wizard Stepper на 7 шагов (copy из UI_COPY), backend имеет каркас API и кнопку/поток для test-call оставлен как следующий этап полной реализации. |
| 2 | Входящие и исходящие звонки работают; есть перевод на оператора с контекстом. | NOT STARTED | Skeleton verification: архитектурный каркас backend и tenant-scoped API готов, но telephony/orchestrator/handoff бизнес-логика не реализована. |
| 3 | Интеграции Bitrix24/amoCRM/Google Calendar работают и проверяются кнопкой «Проверить». | NOT STARTED | Skeleton verification: UI copy и кнопки «Проверить» присутствуют в UI skeleton; реальные connect/check/logs интеграции не реализованы. |
| 4 | Сообщения по всем каналам отправляются, есть шаблоны и журнал статусов. | NOT STARTED | Skeleton verification: заложен realtime/event каркас и единый error-handler, но каналы сообщений/шаблоны/журнал ещё не реализованы. |
| 5 | По каждому звонку отображаются итог, транскрипт, действия, ошибки и стоимость. | NOT STARTED | Skeleton verification: определены API/error/realtime контракты foundation-уровня; полноценные calls/inbox данные и UI карточка звонка не реализованы. |
| 6 | Живой монитор отображает текущие звонки/кампании/сообщения/расходы в реальном времени. | FOUNDATION READY | Skeleton verification: реализован realtime каркас `GET /api/realtime/token`, `GET /api/realtime/stream` (SSE stub) и контракты событий по TZ. |
| 7 | RBAC, audit log и изоляция данных подтверждены тестами. | FOUNDATION READY | Skeleton verification: реализованы middleware auth + RBAC guard + tenant isolation guard (`org_id/project_id` scoping через заголовки), smoke tests добавлены для health и error format; расширенные security/audit тесты остаются следующим этапом. |
