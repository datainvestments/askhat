# PLANS.md — ExecPlan (P0)

## 1) Архитектура компонентов P0
Базируемся на целевой логической архитектуре из TZ:
- `telephony-gw` (jambonz + FreeSWITCH): вход/исход, SIP/RTP, call events.
- `orchestrator`: state machine звонка, STT/LLM/TTS, tool-calling, handoff.
- `api`: REST кабинета, мульти-тенант сущности, Agent Studio, CRM, billing.
- `tool-service`: Bitrix24/amoCRM/Google Calendar/встроенная CRM.
- `notifications-service`: SMS/WhatsApp/Telegram/Email, ретраи, delivery webhooks.
- `realtime-gateway`: WS/SSE-поток в UI.
- `worker`: кампании, индексация знаний, отчёты.
- `storage`: S3-совместимое хранилище записей/документов.
- `observability`: логи/метрики/алерты/trace.

Поток P0:
1. Telephony gateway принимает/инициирует звонок.
2. Orchestrator ведёт диалог и вызывает инструменты.
3. Все доменные события публикуются в event bus.
4. API/Worker обновляют Postgres/Redis/Storage.
5. Realtime gateway пушит события в Live Monitor.

## 2) БД: таблицы / связи / индексы
### 2.1 Основные домены таблиц
- SaaS: `orgs`, `projects`, `users`, `roles`, `user_roles`, `audit_logs`, `api_keys`.
- Telephony: `sip_connections`, `phone_numbers`, `routing_rules`, `operator_routes`.
- Agents: `agents`, `agent_versions`, `agent_policies`, `agent_settings`, `agent_tools`.
- Calls: `calls`, `call_events`, `transcripts`, `tool_invocations`, `call_issues`, `handoff_packets`.
- Campaigns: `campaigns`, `campaign_contacts`, `campaign_runs`, `campaign_results`.
- Messages: `message_channels`, `message_providers`, `message_templates`, `messages`, `message_deliveries`, `message_errors`, `dnc_list`, `consents`.
- Billing: `pricing_profiles`, `usage_records`, `cost_breakdowns`, `budgets_limits`, `invoices`.
- Built-in CRM: `crm_contacts`, `crm_companies`, `crm_deals`, `crm_tasks`, `crm_notes`, `crm_call_links`.

### 2.2 Ключевые связи
- `orgs 1-N projects`.
- `projects 1-N` ко всем project-scoped сущностям (numbers/agents/calls/campaigns/messages/billing/crm).
- `agents 1-N agent_versions`.
- `calls 1-N transcripts/call_events/tool_invocations/call_issues`.
- `campaigns 1-N campaign_contacts/campaign_runs/campaign_results`.
- `messages 1-N message_deliveries/message_errors`.

### 2.3 Индексы (минимум P0)
- По tenant-границе: составные индексы `(project_id, created_at)` на high-volume таблицах.
- По операционным фильтрам:
  - `calls(project_id, started_at desc)`.
  - `campaign_results(campaign_id, status)`.
  - `messages(project_id, status, created_at desc)`.
  - `audit_logs(project_id, ts desc)`.
- Уникальность:
  - `phone_numbers(e164_number)` в пределах tenant/pool по бизнес-правилу.
  - `agent_versions(agent_id, version)`.

## 3) API: эндпоинты и контракты
### 3.1 Эндпоинты P0 (из TZ)
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Projects: `POST /projects`, `GET /projects`
- Numbers: `POST /sip-connections`, `POST /sip-connections/{id}/check`, `POST /sip-connections/{id}/test-call`, `POST /phone-numbers`
- Agents: `POST /agents`, `POST /agents/{id}/versions`, `POST /agents/{id}/publish`, `POST /agents/{id}/rollback`
- Calls: `GET /calls`, `GET /calls/{id}`, `POST /calls/{id}/issue`, `POST /calls/{id}/add-to-kb`
- Campaigns: `POST /campaigns`, `POST /campaigns/{id}/upload-contacts`, `POST /campaigns/{id}/start`, `POST /campaigns/{id}/pause`, `GET /campaigns/{id}/stats`
- Integrations: `POST /integrations/*/connect`, `POST /integrations/{id}/check`, `GET /integrations/{id}/logs`
- Messages: `POST /channels/{type}/connect`, `POST /channels/{type}/check`, `POST /templates`, `POST /templates/{id}/test-send`, `GET /messages`
- Billing: `GET /billing/usage`, `GET /billing/cost-breakdown`, `POST /billing/limits`
- Realtime: `GET /realtime/token`, `WS/SSE /realtime/stream`

### 3.2 Контракт ошибок (единый)
Использовать единый JSON-формат ошибок из TZ без отклонений:
- `error.code`
- `error.human_title`
- `error.human_how_to_fix[]`
- `error.details{ trace_id, ... }`

## 4) Realtime: события / каналы / pipeline
### 4.1 События P0
- `call.started`, `call.state_changed`, `call.ended`
- `tool.started`, `tool.succeeded`, `tool.failed`
- `message.sent`, `message.delivered`, `message.failed`
- `campaign.progress`, `campaign.finished`
- `integration.up`, `integration.down`
- `budget.threshold_reached`

### 4.2 Формат события
- `type`, `ts`, `project_id`, `entity{type,id}`, `payload{...}`.

### 4.3 Каналы и пайплайн
1. Producer (orchestrator/tool/worker/notifications) публикует событие в event bus.
2. Event bus маршрутизирует по `project_id`.
3. Realtime gateway валидирует доступ (RBAC + tenant) и стримит в WS/SSE.
4. UI Live Monitor обновляет карточки звонков/кампаний/сообщений/расходов.

## 5) Ошибки: таксономия и единый формат
Минимальная таксономия (P0):
- `SIP_CONNECT_FAILED`
- `TEST_CALL_FAILED`
- `STT_LOW_CONFIDENCE`
- `INTEGRATION_AUTH_FAILED`
- `INTEGRATION_TIMEOUT`
- `MESSAGE_PROVIDER_DOWN`
- `BUDGET_LIMIT_REACHED`

Все ошибки во всех сервисах возвращаются в едином формате из раздела API 9.1 TZ.

## 6) Auth / RBAC / tenant isolation
- Auth: JWT + refresh tokens.
- RBAC на все действия, включая критичные зоны: billing, integrations, publish/rollback агента.
- Tenant isolation:
  - Каждая project-scoped запись содержит `project_id`.
  - Все запросы фильтруются по `project_id` и роли пользователя.
  - Realtime-подписки ограничиваются проектом.
- Audit:
  - Логируются входы, операции публикации, изменения интеграций/лимитов/ролей.

## 7) Observability / audit / logging
- Trace-id обязателен для звонка, tool-вызова и сообщения.
- Метрики P0: latency STT/LLM/TTS, error rate, escalation rate, cost rate.
- Алерты P0: деградация интеграций, всплеск ошибок, достижение budget thresholds.
- Логи: структурированные JSON-логи по сервисам + correlation по trace-id.

## 8) План реализации по BACKLOG (этапы/коммиты)
### Этап 1: Foundation + Security (E01–E02)
- Коммиты: auth, refresh, RBAC middleware, audit log, env/migrations, wizard state API/UI каркас.

### Этап 2: Telephony onboarding (E03)
- Коммиты: SIP CRUD/check/test-call, phone numbers CRUD, UI «Номера и подключение», deploy jambonz/FreeSWITCH.

### Этап 3: Runtime ядро звонков (E04–E08)
- Коммиты: orchestrator state machine, STT/LLM/TTS connectors, tool-calling, handoff routing/packet, calls inbox/details/issues.

### Этап 4: Agent + Knowledge (E05–E06)
- Коммиты: agents/versions/publish/rollback, Agent Studio UI, KB ingestion + RAG, KB UI.

### Этап 5: Integrations + CRM (E09–E10)
- Коммиты: Bitrix24/amoCRM/GCal connectors + checks/logs, built-in CRM API/UI.

### Этап 6: Campaigns + Messages + Realtime + Billing (E11–E14)
- Коммиты: campaign worker/scheduler/UI, notifications/templates/DNC, realtime gateway/event bus/live monitor, cost engine/limits/billing UI.

### Этап 7: Release hardening
- Коммиты: end-to-end acceptance, perf tuning, observability completion, runbook/backup/retention.
