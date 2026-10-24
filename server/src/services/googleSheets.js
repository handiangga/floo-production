import { google } from 'googleapis';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
export function getSheetsClient(){
  if(!env.clientId || !env.clientSecret || !env.refreshToken) throw new AppError('Google Sheets OAuth belum dikonfigurasi. Isi GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN di server/.env',503);
  const oauth=new google.auth.OAuth2(env.clientId,env.clientSecret,'http://localhost:4000/auth/google/callback');
  oauth.setCredentials({refresh_token:env.refreshToken});
  return google.sheets({version:'v4',auth:oauth});
}
