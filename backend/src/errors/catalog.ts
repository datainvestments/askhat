import type { AppErrorShape } from './app-error.js';

export const errorCatalog: Record<string, Omit<AppErrorShape, 'details'>> = {
  SIP_CONNECT_FAILED: {
    code: 'SIP_CONNECT_FAILED',
    human_title: 'Не удалось подключить номер',
    human_how_to_fix: ['Проверьте адрес, логин и пароль у провайдера. Затем нажмите «Проверить подключение».']
  },
  TEST_CALL_FAILED: {
    code: 'TEST_CALL_FAILED',
    human_title: 'Тест‑звонок не прошёл',
    human_how_to_fix: ['Проверьте, что номер доступен, и повторите тест.']
  },
  STT_LOW_CONFIDENCE: {
    code: 'STT_LOW_CONFIDENCE',
    human_title: 'Система плохо слышит',
    human_how_to_fix: ['Попросите говорить чуть громче. Если проблема повторяется — включите перевод на оператора после 2 уточнений.']
  },
  INTEGRATION_AUTH_FAILED: {
    code: 'INTEGRATION_AUTH_FAILED',
    human_title: 'Интеграция не подключена',
    human_how_to_fix: ['Переподключите интеграцию и нажмите «Проверить».']
  },
  INTEGRATION_TIMEOUT: {
    code: 'INTEGRATION_TIMEOUT',
    human_title: 'Интеграция временно недоступна',
    human_how_to_fix: ['Повторите позже или переведите звонок оператору.']
  },
  MESSAGE_PROVIDER_DOWN: {
    code: 'MESSAGE_PROVIDER_DOWN',
    human_title: 'Сообщение не отправлено',
    human_how_to_fix: ['Проверьте канал сообщений и отправьте тестовое сообщение.']
  },
  BUDGET_LIMIT_REACHED: {
    code: 'BUDGET_LIMIT_REACHED',
    human_title: 'Достигнут лимит расходов',
    human_how_to_fix: ['Увеличьте лимит или остановите кампании. При необходимости включите перевод на оператора.']
  }
};
