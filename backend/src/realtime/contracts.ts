export const realtimeEventTypes = [
  'call.started',
  'call.state_changed',
  'call.ended',
  'tool.started',
  'tool.succeeded',
  'tool.failed',
  'message.sent',
  'message.delivered',
  'message.failed',
  'campaign.progress',
  'campaign.finished',
  'integration.up',
  'integration.down',
  'budget.threshold_reached'
] as const;

export type RealtimeEventType = (typeof realtimeEventTypes)[number];

export interface RealtimeEvent {
  type: RealtimeEventType;
  ts: string;
  project_id: string;
  entity: { type: string; id: string };
  payload: Record<string, unknown>;
}

export const realtimeEventSchemaSample: RealtimeEvent = {
  type: 'call.state_changed',
  ts: new Date('2026-02-17T12:34:56.789Z').toISOString(),
  project_id: 'uuid',
  entity: { type: 'call', id: 'uuid' },
  payload: { human_status: 'Агент отвечает', cost_so_far: 0.12 }
};
