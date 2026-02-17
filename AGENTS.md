# AGENTS.md

## Scope discipline
- No scope creep.
- Любые изменения и решения ограничиваются требованиями P0.

## Source-of-truth priority
- Приоритет источников: `TZ.md` > `UI_COPY.md` > `BACKLOG.md`.
- При конфликте использовать только более приоритетный источник.

## UI copy policy
- UI-тексты и тексты ошибок брать только из `docs/UI_COPY.md` дословно.
- Перефразирование UI-текстов и ошибок запрещено.

## Contracts and formats
- Формат ошибок, API-контракты, realtime-события, RBAC и tenant isolation — строго по `docs/TZ.md`.

## Ambiguities
- Любые неясности фиксировать в `QUESTIONS.md`.
- Неясности не блокируют прогресс: продолжать выполнение в рамках доступных требований.
