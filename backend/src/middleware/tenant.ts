import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { errorCatalog } from '../errors/catalog.js';

export function tenantIsolationGuard(req: Request, _res: Response, next: NextFunction): void {
  const orgId = req.header('x-org-id');
  const projectId = req.header('x-project-id');

  if (!req.auth || !orgId || !projectId) {
    next(
      new AppError(400, {
        ...errorCatalog.INTEGRATION_AUTH_FAILED,
        details: { reason: 'missing_org_or_project_scope' }
      })
    );
    return;
  }

  if (orgId !== req.auth.orgId) {
    next(
      new AppError(403, {
        ...errorCatalog.INTEGRATION_AUTH_FAILED,
        details: { reason: 'org_scope_mismatch', org_id: orgId, auth_org_id: req.auth.orgId }
      })
    );
    return;
  }

  req.tenant = { orgId, projectId };
  next();
}
