# ACCEPTANCE_CHECKLIST.md

Источник критериев: `docs/TZ.md`, раздел **13.3 Критерии приёмки релиза P0**.

| # | Acceptance пункт (из TZ) | Status | Verification |
|---|---|---|---|
| 1 | Клиент проходит Wizard и делает успешный тест-звонок без инженера. | NOT STARTED | E2E сценарий: новый клиент проходит Wizard, выполняет test-call, результат фиксируется в calls/inbox без ручного вмешательства инженера. |
| 2 | Входящие и исходящие звонки работают; есть перевод на оператора с контекстом. | NOT STARTED | Интеграционный тест inbound/outbound + проверка handoff packet: оператор получает контекст диалога и метаданные. |
| 3 | Интеграции Bitrix24/amoCRM/Google Calendar работают и проверяются кнопкой «Проверить». | NOT STARTED | Для каждой интеграции: connect → check → запись в logs, статус success в UI/API. |
| 4 | Сообщения по всем каналам отправляются, есть шаблоны и журнал статусов. | NOT STARTED | Smoke по SMS/WhatsApp/Telegram/Email: test-send по шаблону, статусы sent/delivered/failed в журнале. |
| 5 | По каждому звонку отображаются итог, транскрипт, действия, ошибки и стоимость. | NOT STARTED | Проверка API и UI карточки звонка: outcome, transcript, tool actions, issue list, cost breakdown присутствуют. |
| 6 | Живой монитор отображает текущие звонки/кампании/сообщения/расходы в реальном времени. | NOT STARTED | Тест WS/SSE: при генерации доменных событий обновляются все виджеты live monitor с задержкой в допустимом SLA. |
| 7 | RBAC, audit log и изоляция данных подтверждены тестами. | NOT STARTED | Набор security-тестов: role matrix, audit trail assertions, tenant cross-access negative tests. |
