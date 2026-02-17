import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    traceId?: string;
    auth?: {
      userId: string;
      role: string;
      orgId: string;
    };
    tenant?: {
      orgId: string;
      projectId: string;
    };
  }
}
