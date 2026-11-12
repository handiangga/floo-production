import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { approvedAccess, canManageAccess } from '../services/accessRequests.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const auth = asyncHandler(async (req, res, next) => {
  let user;
  try {
    user = jwt.verify(req.cookies.floo_session, env.secret, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ error: 'Silakan login kembali' });
  }
  const email = user?.email?.toLowerCase();
  if (!email || (!env.allowedEmails.includes(email) && !(await approvedAccess(email, user.sub)))) {
    return res.status(401).json({ error: 'Silakan login kembali' });
  }
  req.user = { email, name: user.name, picture: user.picture, canManageAccess: canManageAccess(email) };
  next();
});

export function requireAccessApprover(req, res, next) {
  if (!req.user?.canManageAccess) return res.status(403).json({ error: 'Hanya pemberi persetujuan yang dapat membuka permintaan akses' });
  next();
}
