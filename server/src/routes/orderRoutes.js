import { Router } from 'express';
import { orders } from '../controllers/ordersController.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();
router.get('/orders',auth,asyncHandler(orders));
export default router;
