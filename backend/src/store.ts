export type CallDirection = 'inbound' | 'outbound';
export type CallState = 'new' | 'ringing' | 'in_progress' | 'handoff' | 'ended';

export interface CostBreakdown {
  stt: number;
  llm: number;
  tts: number;
  telephony: number;
  tools: number;
}

export interface CallRecord {
  id: string;
  project_id: string;
  direction: CallDirection;
  state: CallState;
  from_number: string;
  to_number: string;
  outcome: string | null;
  transcript: Array<{ role: 'assistant' | 'user'; text: string }>;
  tool_invocations: Array<{ tool: string; status: 'succeeded' | 'failed'; result: string }>;
  issues: Array<{ id: string; text: string; created_at: string }>;
  kb_notes: Array<{ id: string; text: string; created_at: string }>;
  handoff_context: { summary: string; last_user_phrase: string; recommended_action: string } | null;
  cost_breakdown: CostBreakdown;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface CallEventRecord {
  id: string;
  call_id: string;
  project_id: string;
  type:
    | 'call.started'
    | 'call.state_changed'
    | 'call.ended'
    | 'message.sent'
    | 'message.delivered'
    | 'message.failed'
    | 'integration.up'
    | 'integration.down'
    | 'campaign.progress'
    | 'campaign.finished'
    | 'budget.threshold_reached';
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

export interface MessageChannelState {
  id: string;
  project_id: string;
  type: 'sms' | 'whatsapp' | 'telegram' | 'email';
  connected: boolean;
}

export interface MessageTemplate {
  id: string;
  project_id: string;
  title: string;
  body: string;
}

export interface MessageRecord {
  id: string;
  project_id: string;
  channel: 'sms' | 'whatsapp' | 'telegram' | 'email';
  status: 'sent' | 'delivered' | 'failed';
  text: string;
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  project_id: string;
  org_id: string;
  actor_id: string;
  action: string;
  ts: string;
}

export const inMemoryStore = {
  calls: new Map<string, CallRecord>(),
  callEvents: [] as CallEventRecord[],
  wizardDrafts: new Map<string, WizardDraft>(),
  integrations: new Map<string, IntegrationState>(),
  channels: new Map<string, MessageChannelState>(),
  templates: new Map<string, MessageTemplate>(),
  messages: [] as MessageRecord[],
  auditLogs: [] as AuditLogRecord[]
};
