export interface AppErrorShape {
  code: string;
  human_title: string;
  human_how_to_fix: string[];
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly payload: AppErrorShape;

  constructor(status: number, payload: AppErrorShape) {
    super(payload.code);
    this.status = status;
    this.payload = payload;
  }
}
