import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';
import { inMemoryStore } from '../store.js';

const providers = ['bitrix24', 'amocrm', 'google-calendar'] as const;

export const integrationsRouter = Router();

integrationsRouter.use(authMiddleware);
integrationsRouter.use(tenantIsolationGuard);

integrationsRouter.post('/:provider/connect', (req, res) => {
  const provider = req.params.provider as (typeof providers)[number];
  if (!providers.includes(provider)) {
    res.status(404).json({ ok: false });
    return;
  }

  const id = randomUUID();
  const state = {
    id,
    provider,
    project_id: req.tenant!.projectId,
    connected: true,
    logs: [{ ts: new Date().toISOString(), level: 'info' as const, message: 'connected' }]
  };
  inMemoryStore.integrations.set(id, state);
  res.status(201).json(state);
});

integrationsRouter.post('/:id/check', (req, res) => {
  const integration = inMemoryStore.integrations.get(req.params.id);
  if (!integration || integration.project_id !== req.tenant!.projectId) {
    res.status(404).json({ ok: false });
    return;
  }
  integration.logs.push({ ts: new Date().toISOString(), level: 'info', message: 'check_ok' });
  res.json({ ok: true, provider: integration.provider });
});

integrationsRouter.get('/:id/logs', (req, res) => {
  const integration = inMemoryStore.integrations.get(req.params.id);
  if (!integration || integration.project_id !== req.tenant!.projectId) {
    res.status(404).json({ items: [] });
    return;
  }
  res.json({ items: integration.logs });
});
