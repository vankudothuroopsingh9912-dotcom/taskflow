import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.get('/stats', protect, getDashboardStats);

export default router;
