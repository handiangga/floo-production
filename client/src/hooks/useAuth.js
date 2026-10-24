import {useEffect,useState} from 'react';
import {getMe,logout} from '../services/authService';
export function useAuth(){const[user,setUser]=useState(undefined);useEffect(()=>{let mounted=true;getMe().then(d=>{if(mounted)setUser(d.user)}).catch(()=>{if(mounted)setUser(null)});return()=>{mounted=false}},[]);return {user,setUser,signOut:async()=>{await logout();setUser(null)}};}
