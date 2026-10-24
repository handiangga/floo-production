export class AppError extends Error {
  constructor(message, status = 500, { expose = status < 500 } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.expose = expose;
  }
}

export const isAppError = error => error instanceof AppError;
