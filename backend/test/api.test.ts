import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('API skeleton smoke', () => {
  const scopedHeaders = {
    authorization: 'Bearer user-dev:admin:org-dev',
    'x-org-id': 'org-dev',
    'x-project-id': 'project-dev'
  };

  it('GET /health returns ok', async () => {
    const response = await request(createApp()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns error format from TZ', async () => {
    const response = await request(createApp()).get('/api/errors/example');
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error.code');
    expect(response.body).toHaveProperty('error.human_title');
    expect(response.body).toHaveProperty('error.human_how_to_fix');
    expect(response.body).toHaveProperty('error.details.trace_id');
    expect(Array.isArray(response.body.error.human_how_to_fix)).toBe(true);
  });

  it('security checks: 401, 403 rbac, 403 tenant mismatch', async () => {
    const missingToken = await request(createApp()).get('/api/projects').set('x-org-id', 'org-dev').set('x-project-id', 'project-dev');
    expect(missingToken.status).toBe(401);

    const rbacDenied = await request(createApp())
      .post('/api/projects')
      .set('authorization', 'Bearer user-dev:viewer:org-dev')
      .set('x-org-id', 'org-dev')
      .set('x-project-id', 'project-dev');
    expect(rbacDenied.status).toBe(403);

    const tenantDenied = await request(createApp())
      .get('/api/projects')
      .set('authorization', 'Bearer user-dev:admin:org-dev')
      .set('x-org-id', 'org-foreign')
      .set('x-project-id', 'project-foreign');
    expect(tenantDenied.status).toBe(403);
  });

  it('wizard + successful test call + call details with outcome/transcript/actions/issues/cost', async () => {
    const app = createApp();
    const submitted = await request(app).post('/api/wizard/submit').set(scopedHeaders);
    expect(submitted.status).toBe(200);

    const created = await request(app).post('/api/calls/test-call').set(scopedHeaders).send({ direction: 'outbound' });
    expect(created.status).toBe(201);

    const issue = await request(app).post(`/api/calls/${created.body.id}/issue`).set(scopedHeaders).send({ text: 'STT_LOW_CONFIDENCE' });
    expect(issue.status).toBe(201);

    const details = await request(app).get(`/api/calls/${created.body.id}`).set(scopedHeaders);
    expect(details.status).toBe(200);
    expect(details.body.item.outcome).toBe('completed');
    expect(details.body.item.transcript.length).toBeGreaterThan(0);
    expect(details.body.item.tool_invocations.length).toBeGreaterThan(0);
    expect(details.body.item.issues.length).toBeGreaterThan(0);
    expect(details.body.item.cost_breakdown).toBeDefined();
    expect(details.body.item.total_cost).toBeGreaterThan(0);
  });

  it('inbound/outbound and handoff context with realtime events', async () => {
    const app = createApp();
    const created = await request(app).post('/api/calls').set(scopedHeaders).send({ direction: 'inbound' });
    expect(created.status).toBe(201);

    const handoff = await request(app).post(`/api/calls/${created.body.id}/state`).set(scopedHeaders).send({ state: 'handoff' });
    expect(handoff.status).toBe(200);
    expect(handoff.body.handoff_context).toBeTruthy();

    const ended = await request(app).post(`/api/calls/${created.body.id}/state`).set(scopedHeaders).send({ state: 'ended' });
    expect(ended.status).toBe(200);

    const stream = await request(app).get('/api/realtime/stream').set(scopedHeaders);
    expect(stream.status).toBe(200);
    expect(stream.text).toContain('call.started');
    expect(stream.text).toContain('call.state_changed');
    expect(stream.text).toContain('call.ended');
  });

  it('integrations connect/check/logs and realtime integration event', async () => {
    const app = createApp();
    const connected = await request(app).post('/api/integrations/bitrix24/connect').set(scopedHeaders);
    expect(connected.status).toBe(201);

    const checked = await request(app).post(`/api/integrations/${connected.body.id}/check`).set(scopedHeaders);
    expect(checked.status).toBe(200);

    const logs = await request(app).get(`/api/integrations/${connected.body.id}/logs`).set(scopedHeaders);
    expect(logs.status).toBe(200);
    expect(logs.body.items.length).toBeGreaterThan(0);

    const stream = await request(app).get('/api/realtime/stream').set(scopedHeaders);
    expect(stream.text).toContain('integration.up');
  });

  it('messages channels/templates/test send/journal and realtime message events', async () => {
    const app = createApp();
    const connected = await request(app).post('/api/channels/sms/connect').set(scopedHeaders);
    expect(connected.status).toBe(201);
    const checked = await request(app).post('/api/channels/sms/check').set(scopedHeaders);
    expect(checked.status).toBe(200);

    const template = await request(app)
      .post('/api/templates')
      .set(scopedHeaders)
      .send({ title: 'Сообщения', body: 'Сообщения' });
    expect(template.status).toBe(201);

    const sent = await request(app).post(`/api/templates/${template.body.id}/test-send`).set(scopedHeaders).send({ channel: 'sms' });
    expect(sent.status).toBe(200);

    const journal = await request(app).get('/api/messages').set(scopedHeaders);
    expect(journal.status).toBe(200);
    expect(journal.body.items.length).toBeGreaterThan(0);

    const stream = await request(app).get('/api/realtime/stream').set(scopedHeaders);
    expect(stream.text).toContain('message.sent');
    expect(stream.text).toContain('message.delivered');
  });

  it('live monitor metrics with campaigns/budget realtime and audit log', async () => {
    const app = createApp();
    await request(app).post('/api/calls/test-call').set(scopedHeaders).send({ direction: 'outbound' });
    const monitor = await request(app).get('/api/monitor/live').set(scopedHeaders);
    expect(monitor.status).toBe(200);
    expect(monitor.body).toHaveProperty('calls');
    expect(monitor.body).toHaveProperty('campaigns');
    expect(monitor.body).toHaveProperty('messages');
    expect(monitor.body).toHaveProperty('spend');

    const audit = await request(app).get('/api/audit/logs').set(scopedHeaders);
    expect(audit.status).toBe(200);
    expect(audit.body.items.length).toBeGreaterThan(0);
  });
});
