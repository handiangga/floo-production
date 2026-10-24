import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
const app=express();
app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin tidak diizinkan'));
  },
  credentials:true
}));
app.use(express.json({limit:'32kb'}));
app.use(cookieParser());
app.get('/health', (req,res)=>res.json({ok:true}));
app.use('/api',authRoutes);
app.use('/api',orderRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
