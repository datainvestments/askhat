import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';
import { inMemoryStore } from '../store.js';
import { pushRealtimeEvent } from './_helpers.js';

export const monitorRouter = Router();

monitorRouter.use(authMiddleware);
monitorRouter.use(tenantIsolationGuard);

monitorRouter.get('/live', (req, res) => {
  const projectId = req.tenant!.projectId;
  const calls = [...inMemoryStore.calls.values()].filter((c) => c.project_id === projectId).length;
  const messages = inMemoryStore.messages.filter((m) => m.project_id === projectId).length;
  const spend = [...inMemoryStore.calls.values()]
    .filter((c) => c.project_id === projectId)
    .reduce((acc, call) => acc + call.total_cost, 0);
  const campaigns = Math.max(1, Math.floor(calls / 2));

  pushRealtimeEvent({ call_id: `campaign-${projectId}`, project_id: projectId, type: 'campaign.progress', payload: { calls, campaigns } });
  if (spend >= 1) {
    pushRealtimeEvent({ call_id: `budget-${projectId}`, project_id: projectId, type: 'budget.threshold_reached', payload: { spend } });
  }

  res.json({ calls, campaigns, messages, spend: Number(spend.toFixed(2)) });
});
