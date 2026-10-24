import { AppError } from '../utils/appError.js';

export function requireGoogleCredential(req, res, next) {
  const credential = req.body?.credential;
  if (typeof credential !== 'string' || credential.trim().length < 20) return next(new AppError('Credential tidak valid', 400));
  next();
}
