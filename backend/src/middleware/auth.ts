import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { errorCatalog } from '../errors/catalog.js';

const authHeaderSchema = z.string().startsWith('Bearer ');

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const parsed = authHeaderSchema.safeParse(req.header('authorization'));
  if (!parsed.success) {
    next(
      new AppError(401, {
        ...errorCatalog.INTEGRATION_AUTH_FAILED,
        details: { reason: 'missing_or_invalid_bearer' }
      })
    );
    return;
  }

  const token = parsed.data.slice('Bearer '.length);
  const [userId = 'user-dev', role = 'admin', orgId = 'org-dev'] = token.split(':');

  req.auth = { userId, role, orgId };
  next();
}
