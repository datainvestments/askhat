import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { rbacGuard } from '../middleware/rbac.js';
import { tenantIsolationGuard } from '../middleware/tenant.js';

export const projectsRouter = Router();

projectsRouter.use(authMiddleware);
projectsRouter.use(tenantIsolationGuard);
projectsRouter.get('/', rbacGuard(['admin', 'manager', 'viewer']), (_req, res) => {
  res.json({ items: [{ id: 'project-dev', name: 'project-dev' }] });
});
projectsRouter.post('/', rbacGuard(['admin']), (_req, res) => {
  res.status(201).json({ id: 'project-dev', name: 'project-dev' });
});
