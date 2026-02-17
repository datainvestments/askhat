import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { errorCatalog } from '../errors/catalog.js';

export function rbacGuard(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      next(
        new AppError(403, {
          ...errorCatalog.INTEGRATION_AUTH_FAILED,
          details: { reason: 'rbac_forbidden', allowed_roles: allowedRoles }
        })
      );
      return;
    }
    next();
  };
}
