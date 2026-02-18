# QUESTIONS

1. В `docs/TZ.md` не зафиксирован обязательный transport для realtime в P0 (WS или SSE).
   - Решение для текущей реализации: использован SSE `GET /api/realtime/stream` с TZ-форматом события.

2. В `docs/TZ.md` нет точного контракта для операторского UI при handoff (поля карточки и команды оператора).
   - Решение для текущей реализации: минимальный handoff context packet (`summary`, `last_user_phrase`, `recommended_action`) в call details и realtime payload.

3. В `docs/TZ.md` не задан числовой порог budget threshold для P0.
   - Решение для текущей реализации: минимальный порог `spend >= 1` для генерации `budget.threshold_reached` в `GET /api/monitor/live`.

4. Browser screenshot automation не сработала в текущей среде (`ERR_EMPTY_RESPONSE` при доступе к frontend dev server из browser tool).
   - Решение для текущего прогона: зафиксировано как ограничение среды; функциональность проверена командами lint/test/build/smoke.
