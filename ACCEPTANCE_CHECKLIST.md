# ACCEPTANCE_CHECKLIST.md

Источник критериев: `docs/TZ.md`, раздел **13.3 Критерии приёмки релиза P0**.

| # | Acceptance пункт (из TZ) | Status | Verification |
|---|---|---|---|
| 1 | Клиент проходит Wizard и делает успешный тест-звонок без инженера. | DONE | Manual: открыть `/wizard`, пройти шаги, нажать «Сделать тест-звонок», перейти в `/calls/:id`, увидеть итог звонка. Auto: `backend/test/api.test.ts` тест `wizard + successful test call + call details with outcome/transcript/actions/issues/cost`. |
| 2 | Входящие и исходящие звонки работают; есть перевод на оператора с контекстом. | DONE | Manual: `POST /api/calls` с `direction=inbound|outbound`, перевести `POST /api/calls/{id}/state` в `handoff`, проверить `handoff_context` и завершение `ended`. Auto: `backend/test/api.test.ts` тест `inbound/outbound and handoff context with realtime events`. |
| 3 | Интеграции Bitrix24/amoCRM/Google Calendar работают и проверяются кнопкой «Проверить». | DONE | Manual: открыть `/integrations`, подключить провайдеры, нажимать «Проверить», проверить логи через `GET /api/integrations/{id}/logs`. Auto: `backend/test/api.test.ts` тест `integrations connect/check/logs and realtime integration event`. |
| 4 | Сообщения по всем каналам отправляются, есть шаблоны и журнал статусов. | DONE | Manual: открыть `/messages`, подключить каналы, создать шаблон, нажать «Отправить тестовое сообщение», проверить журнал `/api/messages`. Auto: `backend/test/api.test.ts` тест `messages channels/templates/test send/journal and realtime message events`. |
| 5 | По каждому звонку отображаются итог, транскрипт, действия, ошибки и стоимость. | DONE | Manual: открыть `/calls/:id` после test-call, проверить outcome/transcript/tool_invocations/issues/total_cost. Auto: `backend/test/api.test.ts` тест `wizard + successful test call + call details with outcome/transcript/actions/issues/cost`. |
| 6 | Живой монитор отображает текущие звонки/кампании/сообщения/расходы в реальном времени. | DONE | Manual: открыть `/monitor`, проверить метрики и события realtime из `/api/realtime/stream`. Auto: `backend/test/api.test.ts` тест `live monitor metrics with campaigns/budget realtime and audit log` + `inbound/outbound and handoff context with realtime events`. |
| 7 | RBAC, audit log и изоляция данных подтверждены тестами. | DONE | Manual: проверить `/api/audit/logs` (admin/manager allowed), проверить 401/403 сценарии без токена, с запрещённой ролью и чужим tenant. Auto: `backend/test/api.test.ts` тесты `security checks: 401, 403 rbac, 403 tenant mismatch` и `live monitor metrics with campaigns/budget realtime and audit log`. |

## Infra notes
- Локальный прогон проверок выполнен: `npm run lint`, `npm run test -w backend`, `npm run build -w backend`, `npm run build -w frontend`, `./scripts/smoke.sh`.
- Проверка GitHub Actions в этой среде не выполнялась (нет `gh` и нет подтверждения удалённого CI). Локальный эквивалент CI — зелёный.
