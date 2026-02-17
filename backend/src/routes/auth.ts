import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/login', (_req, res) => {
  res.json({ access_token: 'user-dev:admin:org-dev', refresh_token: 'refresh-dev' });
});

authRouter.post('/refresh', (_req, res) => {
  res.json({ access_token: 'user-dev:admin:org-dev' });
});

authRouter.post('/logout', (_req, res) => {
  res.status(204).send();
});
