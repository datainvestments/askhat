export type CallDirection = 'inbound' | 'outbound';
export type CallState = 'new' | 'ringing' | 'in_progress' | 'handoff' | 'ended';

export interface CallRecord {
  id: string;
  project_id: string;
  direction: CallDirection;
  state: CallState;
  from_number: string;
  to_number: string;
  outcome: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallEventRecord {
  id: string;
  call_id: string;
  project_id: string;
  type: 'call.started' | 'call.state_changed' | 'call.ended';
  payload: Record<string, unknown>;
  ts: string;
}

export interface WizardDraft {
  project_id: string;
  step: number;
  data: Record<string, string>;
  status: 'draft' | 'submitted';
  updated_at: string;
}

export interface IntegrationState {
  id: string;
  project_id: string;
  provider: 'bitrix24' | 'amocrm' | 'google-calendar';
  connected: boolean;
  logs: Array<{ ts: string; level: 'info' | 'error'; message: string }>;
}

export const inMemoryStore = {
  calls: new Map<string, CallRecord>(),
  callEvents: [] as CallEventRecord[],
  wizardDrafts: new Map<string, WizardDraft>(),
  integrations: new Map<string, IntegrationState>()
};
