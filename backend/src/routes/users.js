import express from 'express';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetPassword
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

router.route('/').get(getUsers).post(createUser);

router.route('/:id').put(updateUser).delete(deleteUser);

router.patch('/:id/toggle-status', toggleUserStatus);
router.post('/:id/reset-password', resetPassword);

export default router;
