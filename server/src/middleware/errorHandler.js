import { isAppError } from '../utils/appError.js';

export function notFound(req, res) {
  res.status(404).json({ error: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });
}

export function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error('Request failed:', { method: req.method, path: req.originalUrl, message: error.message });
  res.status(status).json({ error: isAppError(error) && error.expose ? error.message : 'Terjadi kesalahan pada server' });
}
