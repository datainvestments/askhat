import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';
import { inMemoryStore } from '../store.js';
import { appendAudit, pushRealtimeEvent } from './_helpers.js';

const channels = ['sms', 'whatsapp', 'telegram', 'email'] as const;

export const messagesRouter = Router();

messagesRouter.use(authMiddleware);
messagesRouter.use(tenantIsolationGuard);

messagesRouter.post('/channels/:type/connect', (req, res) => {
  const type = req.params.type as (typeof channels)[number];
  if (!channels.includes(type)) {
    res.status(404).json({ ok: false });
    return;
  }
  const state = { id: randomUUID(), project_id: req.tenant!.projectId, type, connected: true };
  inMemoryStore.channels.set(`${req.tenant!.projectId}:${type}`, state);
  appendAudit(req, `channel.connect.${type}`);
  res.status(201).json(state);
});

messagesRouter.post('/channels/:type/check', (req, res) => {
  const type = req.params.type as (typeof channels)[number];
  const item = inMemoryStore.channels.get(`${req.tenant!.projectId}:${type}`);
  if (!item) {
    res.status(404).json({ ok: false });
    return;
  }
  appendAudit(req, `channel.check.${type}`);
  res.json({ ok: true, type });
});

messagesRouter.post('/templates', (req, res) => {
  const template = {
    id: randomUUID(),
    project_id: req.tenant!.projectId,
    title: String(req.body?.title ?? 'template'),
    body: String(req.body?.body ?? 'body')
  };
  inMemoryStore.templates.set(template.id, template);
  appendAudit(req, 'template.create');
  res.status(201).json(template);
});

messagesRouter.post('/templates/:id/test-send', (req, res) => {
  const template = inMemoryStore.templates.get(req.params.id);
  if (!template || template.project_id !== req.tenant!.projectId) {
    res.status(404).json({ ok: false });
    return;
  }
  const channel = (req.body?.channel ?? 'sms') as 'sms' | 'whatsapp' | 'telegram' | 'email';
  const msg = {
    id: randomUUID(),
    project_id: req.tenant!.projectId,
    channel,
    status: 'delivered' as const,
    text: template.body,
    created_at: new Date().toISOString()
  };
  inMemoryStore.messages.unshift(msg);
  pushRealtimeEvent({ call_id: msg.id, project_id: req.tenant!.projectId, type: 'message.sent', payload: { channel } });
  pushRealtimeEvent({ call_id: msg.id, project_id: req.tenant!.projectId, type: 'message.delivered', payload: { channel } });
  appendAudit(req, 'message.test_send');
  res.json({ item: msg });
});

messagesRouter.get('/messages', (req, res) => {
  const items = inMemoryStore.messages.filter((m) => m.project_id === req.tenant!.projectId);
  res.json({ items });
});

messagesRouter.get('/templates', (req, res) => {
  const items = [...inMemoryStore.templates.values()].filter((t) => t.project_id === req.tenant!.projectId);
  res.json({ items });
});
