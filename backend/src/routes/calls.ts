import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';
import { inMemoryStore } from '../store.js';

const transitions = {
  inbound: ['new', 'ringing', 'in_progress', 'handoff', 'ended'],
  outbound: ['new', 'ringing', 'in_progress', 'ended']
} as const;

export const callsRouter = Router();

callsRouter.use(authMiddleware);
callsRouter.use(tenantIsolationGuard);

callsRouter.post('/test-call', (req, res) => {
  const direction = req.body?.direction === 'inbound' ? 'inbound' : 'outbound';
  const from_number = String(req.body?.from_number ?? '+10000000001');
  const to_number = String(req.body?.to_number ?? '+10000000002');
  const now = new Date().toISOString();
  const id = randomUUID();

  inMemoryStore.calls.set(id, {
    id,
    project_id: req.tenant!.projectId,
    direction,
    state: 'new',
    from_number,
    to_number,
    outcome: null,
    created_at: now,
    updated_at: now
  });

  const startedEvent = {
    id: randomUUID(),
    call_id: id,
    project_id: req.tenant!.projectId,
    type: 'call.started' as const,
    payload: { state: 'new', human_status: 'new' },
    ts: now
  };
  inMemoryStore.callEvents.push(startedEvent);

  res.status(201).json({ id, direction, state: 'new', event: startedEvent });
});

callsRouter.post('/:id/state', (req, res) => {
  const call = inMemoryStore.calls.get(req.params.id);
  if (!call || call.project_id !== req.tenant!.projectId) {
    res.status(404).json({ items: [] });
    return;
  }

  const nextState = String(req.body?.state ?? '');
  const flow = transitions[call.direction];
  const currentIndex = flow.indexOf(call.state);
  const nextIndex = flow.indexOf(nextState as never);
  if (nextIndex === -1 || nextIndex < currentIndex) {
    res.status(400).json({ ok: false });
    return;
  }

  call.state = nextState as never;
  call.updated_at = new Date().toISOString();
  if (nextState === 'ended') {
    call.outcome = 'completed';
  }

  const type = nextState === 'ended' ? 'call.ended' : 'call.state_changed';
  const event = {
    id: randomUUID(),
    call_id: call.id,
    project_id: call.project_id,
    type,
    payload: { state: nextState, human_status: nextState },
    ts: call.updated_at
  };
  inMemoryStore.callEvents.push(event);

  res.json({ id: call.id, state: call.state, event });
});

callsRouter.get('/', (req, res) => {
  const items = [...inMemoryStore.calls.values()].filter((call) => call.project_id === req.tenant!.projectId);
  res.json({ items });
});

callsRouter.get('/inbox', (req, res) => {
  const items = inMemoryStore.callEvents.filter((event) => event.project_id === req.tenant!.projectId);
  res.json({ items });
});
