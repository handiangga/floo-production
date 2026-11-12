import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env, sessionCookie } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { accessRequestsEnabled, canManageAccess, requestAccess } from '../services/accessRequests.js';
const oauth = new OAuth2Client(env.clientId);
const hasLoginConfig = () => Boolean(env.secret && env.clientId && env.allowedEmails.length);

export async function login(req, res) {
  if (!hasLoginConfig()) throw new AppError('Konfigurasi login belum lengkap', 503);
  let profile;
  try {
    const ticket = await oauth.verifyIdToken({ idToken: req.body.credential.trim(), audience: env.clientId });
    profile = ticket.getPayload();
  } catch {
    throw new AppError('Login Google gagal', 401);
  }

  const email = profile?.email?.toLowerCase();
  if (!profile?.email_verified || !email || !profile.sub) {
    throw new AppError('Alamat email Google belum terverifikasi', 403);
  }

  if (!env.allowedEmails.includes(email)) {
    if (!accessRequestsEnabled) throw new AppError('Akun Google belum diberi akses', 403);
    if (!email.endsWith('@gmail.com') && !profile.hd) {
      throw new AppError('Gunakan akun Gmail atau Google Workspace untuk meminta akses', 403);
    }

    const status = await requestAccess({ ...profile, email });
    if (status === 'pending') return res.status(202).json({ status });
    if (status !== 'approved') throw new AppError('Permintaan akses ditolak', 403);
  }

  const { name, picture, sub } = profile;
  const token = jwt.sign({ email, name, picture, sub }, env.secret, { algorithm: 'HS256', expiresIn: '12h' });
  res.cookie('floo_session', token, sessionCookie).json({ user: { email, name, canManageAccess: canManageAccess(email) } });
}
export function logout(req,res){const { maxAge, ...cookieOptions } = sessionCookie; res.clearCookie('floo_session',cookieOptions).json({ok:true});}
export function me(req,res){res.json({user:req.user});}
export function publicConfig(req,res){res.json({googleClientId:env.clientId||'',accessRequestsEnabled});}
