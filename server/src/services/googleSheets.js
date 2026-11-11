import { google } from 'googleapis';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';

let sheetsClient;

export function getSheetsClient(){
  if (sheetsClient) return sheetsClient;

  if (env.sheetsServiceAccount?.trim()) {
    let credentials;
    try {
      credentials = JSON.parse(env.sheetsServiceAccount);
    } catch {
      throw new AppError('GOOGLE_SERVICE_ACCOUNT_JSON bukan JSON yang valid.', 503);
    }

    if (credentials?.type !== 'service_account' ||
        typeof credentials.client_email !== 'string' || !credentials.client_email.trim() ||
        typeof credentials.private_key !== 'string' || !credentials.private_key.trim()) {
      throw new AppError('Kredensial service account Google Sheets tidak lengkap.', 503);
    }

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  }

  if(!env.clientId || !env.clientSecret || !env.refreshToken) throw new AppError('Google Sheets OAuth belum dikonfigurasi. Isi GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN di server/.env',503);
  const oauth=new google.auth.OAuth2(env.clientId,env.clientSecret,'http://localhost:4000/auth/google/callback');
  oauth.setCredentials({refresh_token:env.refreshToken});
  sheetsClient = google.sheets({ version: 'v4', auth: oauth });
  return sheetsClient;
}
