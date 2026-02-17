# QUESTIONS

1. В `PLANS.md` зафиксированы целевые сервисы и API/сущности, но не зафиксирован технологический стек (язык/фреймворк) для skeleton.
   - Решение для P0 skeleton: выбран минимальный стек Node.js + TypeScript, Express (backend), React + Vite (frontend), Postgres в docker-compose.

2. В `docs/UI_COPY.md` отсутствуют отдельные тексты для экранов Login/Project Select (есть глобальные элементы, подписи ключевых экранов и Wizard step copy).
   - Решение для P0 skeleton: использованы только дословные строки из `docs/UI_COPY.md`; дополнительные пользовательские тексты не добавлялись.

3. В `docs/TZ.md` не определён формат передачи tenant scope в HTTP заголовках для API guard.
   - Решение для P0 skeleton: использованы `x-org-id` и `x-project-id` как явный runtime scoping-контракт до финализации.
