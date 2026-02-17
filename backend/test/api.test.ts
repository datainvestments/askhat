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

  it('rejects request without bearer token', async () => {
    const response = await request(createApp()).get('/api/projects').set('x-org-id', 'org-dev').set('x-project-id', 'project-dev');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INTEGRATION_AUTH_FAILED');
    expect(response.body.error.details.reason).toBe('missing_or_invalid_bearer');
  });

  it('rejects request without role permission', async () => {
    const response = await request(createApp())
      .post('/api/projects')
      .set('authorization', 'Bearer user-dev:viewer:org-dev')
      .set('x-org-id', 'org-dev')
      .set('x-project-id', 'project-dev')
      .send({ name: 'x' });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('INTEGRATION_AUTH_FAILED');
    expect(response.body.error.details.reason).toBe('rbac_forbidden');
  });

  it('rejects request for foreign org/project scope', async () => {
    const response = await request(createApp())
      .get('/api/projects')
      .set('authorization', 'Bearer user-dev:admin:org-dev')
      .set('x-org-id', 'org-foreign')
      .set('x-project-id', 'project-foreign');

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('INTEGRATION_AUTH_FAILED');
    expect(response.body.error.details.reason).toBe('org_scope_mismatch');
  });

  it('creates call and records inbox events', async () => {
    const app = createApp();
    const created = await request(app).post('/api/calls/test-call').set(scopedHeaders).send({ direction: 'outbound' });
    expect(created.status).toBe(201);

    const changed = await request(app)
      .post(`/api/calls/${created.body.id}/state`)
      .set(scopedHeaders)
      .send({ state: 'ringing' });
    expect(changed.status).toBe(200);

    const inbox = await request(app).get('/api/calls/inbox').set(scopedHeaders);
    expect(inbox.status).toBe(200);
    expect(inbox.body.items.length).toBeGreaterThanOrEqual(2);
    expect(inbox.body.items[0].type).toBe('call.started');
  });

  it('wizard draft and submit smoke', async () => {
    const app = createApp();

    const saved = await request(app)
      .post('/api/wizard/draft')
      .set(scopedHeaders)
      .send({ step: 3, data: { '3': 'ok' } });
    expect(saved.status).toBe(200);
    expect(saved.body.draft.status).toBe('draft');

    const submitted = await request(app).post('/api/wizard/submit').set(scopedHeaders);
    expect(submitted.status).toBe(200);
    expect(submitted.body.draft.status).toBe('submitted');
    expect(submitted.body.draft.step).toBe(7);
  });

  it('integration connect + check + logs smoke', async () => {
    const app = createApp();

    const connected = await request(app).post('/api/integrations/bitrix24/connect').set(scopedHeaders);
    expect(connected.status).toBe(201);

    const checked = await request(app).post(`/api/integrations/${connected.body.id}/check`).set(scopedHeaders);
    expect(checked.status).toBe(200);
    expect(checked.body.ok).toBe(true);

    const logs = await request(app).get(`/api/integrations/${connected.body.id}/logs`).set(scopedHeaders);
    expect(logs.status).toBe(200);
    expect(logs.body.items.length).toBeGreaterThanOrEqual(2);
  });
});
