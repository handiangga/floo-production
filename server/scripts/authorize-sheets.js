import dotenv from 'dotenv';
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { google } from 'googleapis';
import { env } from '../src/config/env.js';
dotenv.config();
if(!env.clientId || !env.clientSecret) { console.error('Isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di server/.env'); process.exit(1); }
const redirect='http://localhost:4000/auth/google/callback';
const oauth=new google.auth.OAuth2(env.clientId,env.clientSecret,redirect);
const state=randomBytes(24).toString('hex');
const url=oauth.generateAuthUrl({access_type:'offline',prompt:'consent',scope:['https://www.googleapis.com/auth/spreadsheets.readonly','https://www.googleapis.com/auth/userinfo.email'],state});
const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://localhost:4000');
  if(u.pathname!=='/auth/google/callback'){res.writeHead(404).end('Not found');return;}
  if(u.searchParams.get('state')!==state){res.writeHead(400).end('State tidak valid');return;}
  if(u.searchParams.get('error')){res.writeHead(400).end('Google menolak otorisasi');return;}
  try{
    const {tokens}=await oauth.getToken(u.searchParams.get('code'));
    oauth.setCredentials(tokens);
    const userinfo=await google.oauth2({version:'v2',auth:oauth}).userinfo.get();
    if(!env.allowedEmails.includes(userinfo.data.email?.toLowerCase())){res.writeHead(403).end('Email tidak ada di ALLOWED_EMAILS');return;}
    if(!tokens.refresh_token){res.writeHead(400).end('Refresh token tidak diberikan. Coba cabut akses aplikasi di Google Account lalu ulangi.');return;}
    res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'}).end('Otorisasi berhasil. Kembali ke terminal untuk menyimpan refresh token di .env.');
    console.log('\nEmail:',userinfo.data.email);
    console.log('Tambahkan ke server/.env (JANGAN bagikan):\nGOOGLE_REFRESH_TOKEN='+tokens.refresh_token);
  }catch(e){res.writeHead(500).end('Gagal menukar kode OAuth. Periksa terminal.');console.error(e.message);}
  finally{server.close();}
});
server.listen(4000,'127.0.0.1',()=>console.log('Buka URL ini di browser untuk mengizinkan akses Google Sheets:\n'+url+'\n'));
