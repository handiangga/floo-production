import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function auth(req,res,next){
  try {
    if(!env.secret) throw Error('Missing secret');
    const user=jwt.verify(req.cookies.floo_session,env.secret,{algorithms:['HS256']});
    if(!user?.email || !env.allowedEmails.includes(user.email.toLowerCase())) throw Error('Unauthorized');
    req.user=user; next();
  } catch {res.status(401).json({error:'Silakan login kembali'});}
}
