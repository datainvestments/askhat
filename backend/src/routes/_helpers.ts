import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { inMemoryStore, type CallEventRecord } from '../store.js';

export function pushRealtimeEvent(event: Omit<CallEventRecord, 'id' | 'ts'> & { ts?: string }) {
  inMemoryStore.callEvents.push({
    id: randomUUID(),
    ts: event.ts ?? new Date().toISOString(),
    ...event
  });
}

export function appendAudit(req: Request, action: string) {
  if (!req.auth || !req.tenant) {
    return;
  }
  inMemoryStore.auditLogs.push({
    id: randomUUID(),
    project_id: req.tenant.projectId,
    org_id: req.tenant.orgId,
    actor_id: req.auth.userId,
    action,
    ts: new Date().toISOString()
  });
}
