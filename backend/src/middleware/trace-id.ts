import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export function traceIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.traceId = req.header('x-trace-id') ?? randomUUID();
  next();
}
