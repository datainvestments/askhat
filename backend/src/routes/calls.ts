import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';
import { type CallState, inMemoryStore } from '../store.js';
import { appendAudit, pushRealtimeEvent } from './_helpers.js';

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
    state: 'ended',
    from_number,
    to_number,
    outcome: 'completed',
    transcript: [
      { role: 'assistant', text: 'Здравствуйте, чем могу помочь?' },
      { role: 'user', text: 'Хочу записаться на завтра.' }
    ],
    tool_invocations: [{ tool: 'google-calendar.create-event', status: 'succeeded', result: 'event_created' }],
    issues: [],
    kb_notes: [],
    handoff_context: null,
    cost_breakdown: { stt: 0.02, llm: 0.03, tts: 0.02, telephony: 0.05, tools: 0.01 },
    total_cost: 0.13,
    created_at: now,
    updated_at: now
  });

  pushRealtimeEvent({
    call_id: id,
    project_id: req.tenant!.projectId,
    type: 'call.started',
    payload: { state: 'new', human_status: 'new' },
    ts: now
  });
  pushRealtimeEvent({
    call_id: id,
    project_id: req.tenant!.projectId,
    type: 'call.ended',
    payload: { state: 'ended', human_status: 'ended' },
    ts: now
  });
  appendAudit(req, 'call.test_call');

  res.status(201).json({ id, direction, state: 'ended' });
});

callsRouter.post('/', (req, res) => {
  const direction = req.body?.direction === 'inbound' ? 'inbound' : 'outbound';
  const now = new Date().toISOString();
  const id = randomUUID();
  inMemoryStore.calls.set(id, {
    id,
    project_id: req.tenant!.projectId,
    direction,
    state: 'new',
    from_number: String(req.body?.from_number ?? '+10000000001'),
    to_number: String(req.body?.to_number ?? '+10000000002'),
    outcome: null,
    transcript: [],
    tool_invocations: [],
    issues: [],
    kb_notes: [],
    handoff_context: null,
    cost_breakdown: { stt: 0, llm: 0, tts: 0, telephony: 0, tools: 0 },
    total_cost: 0,
    created_at: now,
    updated_at: now
  });
  pushRealtimeEvent({ call_id: id, project_id: req.tenant!.projectId, type: 'call.started', payload: { state: 'new' }, ts: now });
  appendAudit(req, `call.create.${direction}`);
  res.status(201).json({ id });
});

callsRouter.post('/:id/state', (req, res) => {
  const call = inMemoryStore.calls.get(req.params.id);
  if (!call || call.project_id !== req.tenant!.projectId) {
    res.status(404).json({ items: [] });
    return;
  }

  const nextState = String(req.body?.state ?? '');
  const flow: readonly CallState[] = transitions[call.direction];
  const currentIndex = flow.indexOf(call.state);
  const nextIndex = flow.indexOf(nextState as never);
  if (nextIndex === -1 || nextIndex < currentIndex) {
    res.status(400).json({ ok: false });
    return;
  }

  call.state = nextState as never;
  call.updated_at = new Date().toISOString();
  if (nextState === 'handoff') {
    call.handoff_context = {
      summary: 'Клиент просит оператора.',
      last_user_phrase: 'Соедините с оператором.',
      recommended_action: 'Продолжить разговор и закрыть вопрос.'
    };
  }
  if (nextState === 'ended') {
    call.outcome = 'completed';
    call.transcript.push({ role: 'assistant', text: 'Перевожу на оператора.' });
    call.total_cost = Number((call.total_cost + 0.07).toFixed(2));
    call.cost_breakdown.telephony = Number((call.cost_breakdown.telephony + 0.07).toFixed(2));
  }

  const type: 'call.ended' | 'call.state_changed' = nextState === 'ended' ? 'call.ended' : 'call.state_changed';
  pushRealtimeEvent({
    call_id: call.id,
    project_id: call.project_id,
    type,
    payload: { state: nextState, human_status: nextState, handoff_context: call.handoff_context }
  });

  appendAudit(req, `call.state.${nextState}`);
  res.json({ id: call.id, state: call.state, handoff_context: call.handoff_context });
});

callsRouter.get('/', (req, res) => {
  const items = [...inMemoryStore.calls.values()].filter((call) => call.project_id === req.tenant!.projectId);
  res.json({ items });
});

callsRouter.get('/inbox', (req, res) => {
  const items = inMemoryStore.callEvents.filter((event) => event.project_id === req.tenant!.projectId);
  res.json({ items });
});

callsRouter.get('/:id', (req, res) => {
  const call = inMemoryStore.calls.get(req.params.id);
  if (!call || call.project_id !== req.tenant!.projectId) {
    res.status(404).json({ item: null });
    return;
  }
  res.json({ item: call });
});

callsRouter.post('/:id/issue', (req, res) => {
  const call = inMemoryStore.calls.get(req.params.id);
  if (!call || call.project_id !== req.tenant!.projectId) {
    res.status(404).json({ item: null });
    return;
  }
  const issue = { id: randomUUID(), text: String(req.body?.text ?? 'issue'), created_at: new Date().toISOString() };
  call.issues.push(issue);
  appendAudit(req, 'call.issue.add');
  res.status(201).json({ item: issue });
});

callsRouter.post('/:id/add-to-kb', (req, res) => {
  const call = inMemoryStore.calls.get(req.params.id);
  if (!call || call.project_id !== req.tenant!.projectId) {
    res.status(404).json({ item: null });
    return;
  }
  const kb = { id: randomUUID(), text: String(req.body?.text ?? 'kb'), created_at: new Date().toISOString() };
  call.kb_notes.push(kb);
  appendAudit(req, 'call.kb.add');
  res.status(201).json({ item: kb });
});
