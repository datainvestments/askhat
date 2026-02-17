import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('API skeleton smoke', () => {
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
});
