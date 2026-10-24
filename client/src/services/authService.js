import {api} from './api';
export const getMe=()=>api('/api/me');
export const loginGoogle=credential=>api('/api/auth/google',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential})});
export const logout=()=>api('/api/logout',{method:'POST'});
export const publicConfig=()=>api('/api/public-config');
