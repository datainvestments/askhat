# TZ — Voice AI Platform v1.0 (RU)

Источник: `/docs/_inputs/TZ_Voice_AI_Platform_v1.0_Dev_Package.docx`.

## Scope P0

### 1.2 Что входит (Scope)
- Входящие звонки: диалог, сбор данных, действия (CRM/календарь/сообщения), завершение или перевод оператору.
- Исходящие звонки: одиночные вызовы и массовые кампании (обзвоны) по спискам с расписанием и лимитами.
- Перевод на оператора: правила эскалации + передача контекста (handoff-пакет).
- Интеграции: Bitrix24, amoCRM, Google Calendar, встроенная CRM платформы.
- Сообщения и уведомления: SMS, WhatsApp, Telegram, Email + сообщения/задачи внутри CRM.
- Agent Studio: конструктор агента, адаптивность, версии, публикация и откат.
- База знаний (FAQ/документы) и быстрые улучшения из звонков.
- Inbox звонков: запись (опционально), транскрипт, действия, ошибки, стоимость.
- Показатели в реальном времени: экран «Живой монитор» + live-обновления.
- Биллинг: стоимость по компонентам, лимиты, прогноз, алерты.

### 1.3 Что не входит (Out of Scope) на этапе P0
- Собственная платёжная система (оплата услуг платформы может быть вынесена в отдельный контур).
- Сложные IVR-деревья с десятками веток (в P0 — базовые fallback-сценарии).
- Глубокая BI-витрина и кастомные отчёты под каждого клиента (в P0 — стандартные отчёты и экспорт).
- Автоматическое распознавание личности по голосу (использовать только безопасные методы подтверждения: код/ссылка/оператор).

## Архитектура

### 7.1 Логическая архитектура (целевое состояние)
```text
Клиентский телефон
|
| (SIP/RTP)
v
Telephony Gateway (jambonz + FreeSWITCH)
|
| (media stream + call events)
v
Realtime Orchestrator
|\
| \--> STT (распознавание речи)
| \--> LLM (логика + инструменты)
| \--> TTS (синтез речи)
|
+--> Tool Service (Bitrix24 / amoCRM / Google Calendar / Встроенная CRM)
+--> Notifications Service (SMS / WhatsApp / Telegram / Email)
+--> Cost Engine (стоимость по компонентам)
+--> Event Bus (события)
API Backend (кабинет) <--> Postgres/Redis/Storage
|
+--> Realtime Gateway (WebSocket/SSE) -> UI (Живой монитор)
+--> Worker (кампании, индексация знаний, отчёты)
```

### 7.2 Компоненты (сервисы)
- `telephony-gw`: Приём/совершение звонков, работа с SIP/RTP, интеграция с jambonz/FreeSWITCH.
- `orchestrator`: Машина состояний звонка, turn-taking, STT/LLM/TTS, вызовы инструментов, перевод оператору.
- `api`: REST API кабинета, мульти-тенант сущности, Agent Studio, CRM, биллинг.
- `tool-service`: Единый слой интеграций: Bitrix24/amoCRM/Google Calendar/встроенная CRM.
- `notifications-service`: Отправка сообщений по каналам, ретраи, webhooks статусов доставки.
- `realtime-gateway`: WebSocket/SSE: пуш событий в UI.
- `worker`: Фоновые задачи: кампании, индексация знаний, отчёты.
- `storage`: S3-совместимое хранилище: записи звонков и документы.
- `observability`: Логи, метрики, алерты, трассировка.

## Модель данных (БД)

### 8.1 Сущности (P0)
- SaaS: `orgs`, `projects`, `users`, `roles`, `user_roles`, `audit_logs`, `api_keys`.
- Телефония: `sip_connections`, `phone_numbers`, `routing_rules`, `operator_routes`.
- Агенты: `agents`, `agent_versions`, `agent_policies`, `agent_settings`, `agent_tools`.
- Звонки: `calls`, `call_events`, `transcripts`, `tool_invocations`, `call_issues`, `handoff_packets`.
- Кампании: `campaigns`, `campaign_contacts`, `campaign_runs`, `campaign_results`.
- Сообщения: `message_channels`, `message_providers`, `message_templates`, `messages`, `message_deliveries`, `message_errors`, `dnc_list`, `consents`.
- Биллинг: `pricing_profiles`, `usage_records`, `cost_breakdowns`, `budgets_limits`, `invoices`.
- Встроенная CRM: `crm_contacts`, `crm_companies`, `crm_deals`, `crm_tasks`, `crm_notes`, `crm_call_links`.

### 8.2 Минимальные поля (чтобы начать разработку)
- `projects`: id, org_id, name, timezone, default_language, created_at
- `sip_connections`: id, project_id, name, provider_host, login, password_encrypted, status, last_check_at
- `phone_numbers`: id, project_id, e164_number, sip_connection_id, agent_id, schedule_json, recording_enabled
- `agent_versions`: id, agent_id, version, state(draft/published), config_json, created_at, published_at
- `calls`: id, project_id, direction, from_number, to_number, started_at, ended_at, outcome, agent_version_id, cost_total
- `transcripts`: id, call_id, speaker, text, ts_start_ms, ts_end_ms, stt_confidence
- `tool_invocations`: id, call_id, tool_name, request_json, response_json, status, duration_ms
- `messages`: id, project_id, channel, to, template_id, status, cost_total, related_call_id, created_at
- `campaigns`: id, project_id, name, agent_version_id, schedule_json, status, limits_json, created_at
- `cost_breakdowns`: id, project_id, entity_type, entity_id, telephony_cost, stt_cost, llm_cost, tts_cost, platform_fee, total_cost

## API

### 9.1 Единый формат ошибок
```json
{
  "error": {
    "code": "INTEGRATION_TIMEOUT",
    "human_title": "Не получилось записать данные в CRM",
    "human_how_to_fix": [
      "Проверьте подключение CRM и нажмите «Проверить»",
      "Если проблема повторяется — включите перевод на оператора"
    ],
    "details": { "trace_id": "abc-123", "provider": "amocrm" }
  }
}
```

### 9.2 Основные эндпоинты (P0)
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

## Realtime

### 10.1 Типы событий
- `call.started`, `call.state_changed`, `call.ended`
- `tool.started`, `tool.succeeded`, `tool.failed`
- `message.sent`, `message.delivered`, `message.failed`
- `campaign.progress`, `campaign.finished`
- `integration.up`, `integration.down`
- `budget.threshold_reached`

### 10.2 Формат события
```json
{
  "type": "call.state_changed",
  "ts": "2026-02-17T12:34:56.789Z",
  "project_id": "uuid",
  "entity": { "type": "call", "id": "uuid" },
  "payload": { "human_status": "Агент отвечает", "cost_so_far": 0.12 }
}
```

## Ошибки

### 12.1 Каталог (P0 минимум)
- `SIP_CONNECT_FAILED` — Не удалось подключить номер. Как исправить: Проверьте адрес/логин/пароль у провайдера. Нажмите «Проверить подключение».
- `TEST_CALL_FAILED` — Тест-звонок не прошёл. Как исправить: Проверьте доступность номера и разрешённые IP. Повторите тест.
- `STT_LOW_CONFIDENCE` — Система плохо слышит. Как исправить: Попросите повторить или включите перевод оператору после 2 уточнений.
- `INTEGRATION_AUTH_FAILED` — Интеграция не подключена. Как исправить: Переподключите и нажмите «Проверить».
- `INTEGRATION_TIMEOUT` — Интеграция недоступна. Как исправить: Повторите позже или переведите на оператора.
- `MESSAGE_PROVIDER_DOWN` — Сообщения не отправляются. Как исправить: Проверьте канал и сделайте тестовую отправку.
- `BUDGET_LIMIT_REACHED` — Достигнут лимит расходов. Как исправить: Увеличьте лимит или остановите кампании.

## Security

### 14.1 Безопасность
- RBAC на все действия (особенно биллинг, интеграции, публикация агента).
- Секреты интеграций — в зашифрованном виде, доступ только нужным сервисам.
- IP allowlist для подключения номера (если доступно).
- Rate limiting на outbound и отправку сообщений.
- Политики хранения и уведомление о записи (если запись включена).

### 14.2 Наблюдаемость
- Trace-id на звонок, на tool-вызов, на сообщение.
- Метрики: latency STT/LLM/TTS, error rates, escalation rate, расходы.
- Алерты: падение интеграций, рост ошибок, достижение лимитов.

### 14.3 Эксплуатация
- Backup БД, политики retention, контроль доступа к записям.
- Обновления без простоя (rolling).

## Acceptance

### 13.3 Критерии приёмки релиза P0
- Клиент проходит Wizard и делает успешный тест-звонок без инженера.
- Входящие и исходящие звонки работают; есть перевод на оператора с контекстом.
- Интеграции Bitrix24/amoCRM/Google Calendar работают и проверяются кнопкой «Проверить».
- Сообщения по всем каналам отправляются, есть шаблоны и журнал статусов.
- По каждому звонку отображаются итог, транскрипт, действия, ошибки и стоимость.
- Живой монитор отображает текущие звонки/кампании/сообщения/расходы в реальном времени.
- RBAC, audit log и изоляция данных подтверждены тестами.
