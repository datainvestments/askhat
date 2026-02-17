import type { NextFunction, Request, Response } from 'express';
import { AppError } from './app-error.js';
import { errorCatalog } from './catalog.js';

const defaultError = errorCatalog.INTEGRATION_TIMEOUT;

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(
    new AppError(404, {
      ...defaultError,
      details: { trace_id: req.traceId, path: req.path }
    })
  );
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        ...err.payload,
        details: { trace_id: req.traceId, ...(err.payload.details ?? {}) }
      }
    });
    return;
  }

  res.status(500).json({
    error: {
      ...defaultError,
      details: { trace_id: req.traceId }
    }
  });
}
