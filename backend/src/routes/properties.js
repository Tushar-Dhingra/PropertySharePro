import express from 'express';
import {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertyStats
} from '../controllers/propertyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/').get(getProperties).post(createProperty);
router.get('/stats', getPropertyStats);

router.route('/:id').get(getProperty).put(updateProperty).delete(deleteProperty);

export default router;
