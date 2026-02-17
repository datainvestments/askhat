import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';
import { inMemoryStore } from '../store.js';

const wizardStepTexts = [
  'Создайте проект, куда будут попадать звонки. Проект — это, например, отдел продаж или поддержка.',
  'Подключите ваш номер телефона. Укажите данные от провайдера и нажмите «Проверить подключение». Затем сделайте тест‑звонок.',
  'Настройте перевод на живого человека. Если агент не сможет помочь или клиент попросит оператора — переведём звонок.',
  'Подключите CRM и календарь. Агент сможет создавать лиды/задачи и назначать встречи.',
  'Подключите каналы сообщений. Агент сможет отправлять подтверждения и напоминания после звонка.',
  'Создайте агента по шаблону и настройте цели. Проверьте мини‑симуляцией.',
  'Добавьте базу знаний и запустите. Сделайте тест‑звонок и включите на реальный номер.'
] as const;

export const wizardRouter = Router();

wizardRouter.use(authMiddleware);
wizardRouter.use(tenantIsolationGuard);

wizardRouter.get('/', (req, res) => {
  const key = `${req.tenant!.projectId}`;
  const draft = inMemoryStore.wizardDrafts.get(key) ?? {
    project_id: req.tenant!.projectId,
    step: 1,
    data: {},
    status: 'draft',
    updated_at: new Date().toISOString()
  };

  res.json({ draft, steps: wizardStepTexts.map((text, index) => ({ step: index + 1, text })) });
});

wizardRouter.post('/draft', (req, res) => {
  const step = Number(req.body?.step ?? 1);
  const data = (req.body?.data ?? {}) as Record<string, string>;
  const key = `${req.tenant!.projectId}`;
  const draft = {
    project_id: req.tenant!.projectId,
    step,
    data,
    status: 'draft' as const,
    updated_at: new Date().toISOString()
  };
  inMemoryStore.wizardDrafts.set(key, draft);

  res.json({ draft });
});

wizardRouter.post('/submit', (req, res) => {
  const key = `${req.tenant!.projectId}`;
  const existing = inMemoryStore.wizardDrafts.get(key);
  const submitted = {
    project_id: req.tenant!.projectId,
    step: 7,
    data: existing?.data ?? {},
    status: 'submitted' as const,
    updated_at: new Date().toISOString()
  };
  inMemoryStore.wizardDrafts.set(key, submitted);
  res.json({ draft: submitted });
});
