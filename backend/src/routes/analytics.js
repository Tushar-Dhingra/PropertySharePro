import express from 'express';
import {
    getDashboardAnalytics,
    getDailyUploads,
    getWeeklyTrends,
    getEmployeeActivity,
    getEmployeeStats
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/daily-uploads', getDailyUploads);
router.get('/weekly-trends', getWeeklyTrends);

// Admin only route
router.get('/employee/:id/activity', authorize('ADMIN'), getEmployeeActivity);
router.get('/employee-stats', authorize('ADMIN'), getEmployeeStats);

export default router;
