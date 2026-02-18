import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';
import { realtimeEventSchemaSample, realtimeEventTypes } from '../realtime/contracts.js';
import { inMemoryStore } from '../store.js';

export const realtimeRouter = Router();

realtimeRouter.use(authMiddleware);
realtimeRouter.use(tenantIsolationGuard);

realtimeRouter.get('/token', (_req, res) => {
  res.json({ token: 'realtime-dev-token' });
});

realtimeRouter.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  const recent = [...inMemoryStore.callEvents].filter((event) => event.project_id === req.tenant!.projectId).slice(-10);
  const items =
    recent.length > 0
      ? recent.map((evt) => ({
          type: evt.type,
          ts: evt.ts,
          project_id: evt.project_id,
          entity: { type: evt.type.startsWith('call.') ? 'call' : 'event', id: evt.call_id },
          payload: evt.payload
        }))
      : [realtimeEventSchemaSample];

  for (const payload of items) {
    res.write(`event: ${payload.type}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
  res.end();
});

realtimeRouter.get('/contracts', (_req, res) => {
  res.json({ event_types: realtimeEventTypes, schema_sample: realtimeEventSchemaSample });
});
