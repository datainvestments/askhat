import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { rbacGuard } from '../middleware/rbac.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';
import { inMemoryStore } from '../store.js';

export const auditRouter = Router();

auditRouter.use(authMiddleware);
auditRouter.use(tenantIsolationGuard);
auditRouter.get('/logs', rbacGuard(['admin', 'manager']), (req, res) => {
  const items = inMemoryStore.auditLogs.filter((item) => item.project_id === req.tenant!.projectId);
  res.json({ items });
});
