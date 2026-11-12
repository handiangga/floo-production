import { Router } from 'express';
import { login,logout,me,publicConfig } from '../controllers/authController.js';
import { auth, requireAccessApprover } from '../middleware/auth.js';
import { decideAccessRequest, pendingAccessRequests } from '../services/accessRequests.js';
import { requireGoogleCredential } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();
router.post('/auth/google',requireGoogleCredential,asyncHandler(login));
router.post('/logout',logout);
router.get('/me',auth,me);
router.get('/public-config',publicConfig);
router.get('/access-requests', auth, requireAccessApprover, asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store').json({ requests: await pendingAccessRequests() });
}));
router.patch('/access-requests/:id', auth, requireAccessApprover, asyncHandler(async (req, res) => {
  const status = req.body?.status;
  if (!req.is('application/json') || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Keputusan akses tidak valid' });
  }
  await decideAccessRequest(req.params.id, status);
  res.json({ ok: true });
}));
export default router;
