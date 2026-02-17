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

realtimeRouter.get('/stream', (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  const recentEvent = [...inMemoryStore.callEvents].reverse()[0];
  const payload = recentEvent
    ? {
        type: recentEvent.type,
        ts: recentEvent.ts,
        project_id: recentEvent.project_id,
        entity: { type: 'call', id: recentEvent.call_id },
        payload: recentEvent.payload
      }
    : realtimeEventSchemaSample;
  res.write(`event: ${payload.type}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  res.end();
});

realtimeRouter.get('/contracts', (_req, res) => {
  res.json({ event_types: realtimeEventTypes, schema_sample: realtimeEventSchemaSample });
});
