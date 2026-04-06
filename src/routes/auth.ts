import { Router } from 'express';
import { login, logout, me, refresh } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
