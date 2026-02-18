import express from 'express';
import { errorHandler, notFoundHandler } from './errors/error-handler.js';
import { traceIdMiddleware } from './middleware/trace-id.js';
import { auditRouter } from './routes/audit.js';
import { authRouter } from './routes/auth.js';
import { callsRouter } from './routes/calls.js';
import { healthRouter } from './routes/health.js';
import { integrationsRouter } from './routes/integrations.js';
import { messagesRouter } from './routes/messages.js';
import { monitorRouter } from './routes/monitor.js';
import { projectsRouter } from './routes/projects.js';
import { realtimeRouter } from './routes/realtime.js';
import { wizardRouter } from './routes/wizard.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(traceIdMiddleware);

  app.use('/', healthRouter);

  app.use('/api/errors/example', (_req, _res, next) => {
    next(new Error('example'));
  });

  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/calls', callsRouter);
  app.use('/api/realtime', realtimeRouter);
  app.use('/api/wizard', wizardRouter);
  app.use('/api/integrations', integrationsRouter);
  app.use('/api', messagesRouter);
  app.use('/api/monitor', monitorRouter);
  app.use('/api/audit', auditRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
