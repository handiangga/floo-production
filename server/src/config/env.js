import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(configDirectory, '../../.env') });

const list = value => (value || '').split(',').map(item => item.trim()).filter(Boolean);
const port = Number(process.env.PORT || 3001);

export const env = {
  port: Number.isInteger(port) && port > 0 && port < 65536 ? port : 3001,
  isProduction: process.env.NODE_ENV === 'production',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  clientOrigins: list(process.env.CLIENT_ORIGIN || 'http://localhost:5173'),
  secret: process.env.SESSION_SECRET,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  allowedEmails: list(process.env.ALLOWED_EMAILS).map(email => email.toLowerCase()),
  sheetIds: {
    Shopee: process.env.SHOPEE_SHEET_ID,
    TikTok: process.env.TIKTOK_SHEET_ID,
    WhatsApp: process.env.WA_SHEET_ID
  }
};

export const sessionCookie = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  path: '/',
  maxAge: 12 * 60 * 60 * 1000
};
