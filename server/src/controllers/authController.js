import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env, sessionCookie } from '../config/env.js';
import { AppError } from '../utils/appError.js';
const oauth = new OAuth2Client(env.clientId);
const hasLoginConfig = () => Boolean(env.secret && env.clientId && env.allowedEmails.length);

export async function login(req, res) {
  if (!hasLoginConfig()) throw new AppError('Konfigurasi login belum lengkap', 503);
  try {
    const ticket = await oauth.verifyIdToken({ idToken: req.body.credential.trim(), audience: env.clientId });
    const profile = ticket.getPayload();
    const email = profile?.email?.toLowerCase();
    if (!profile?.email_verified || !email || !env.allowedEmails.includes(email)) throw new AppError('Akun Google belum diberi akses', 403);
    const token = jwt.sign({ email, name: profile.name, picture: profile.picture }, env.secret, { algorithm: 'HS256', expiresIn: '12h' });
    res.cookie('floo_session', token, sessionCookie).json({ user: { email, name: profile.name } });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Login Google gagal', 401);
  }
}
export function logout(req,res){const { maxAge, ...cookieOptions } = sessionCookie; res.clearCookie('floo_session',cookieOptions).json({ok:true});}
export function me(req,res){res.json({user:req.user});}
export function publicConfig(req,res){res.json({googleClientId:env.clientId||''});}
