import express from 'express';
const router = express.Router();
import {
    createResetRequest,
    getResetRequests,
    updateRequestStatus,
    deleteResetRequest
} from '../controllers/resetRequestController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.route('/')
    .post(createResetRequest)
    .get(protect, adminOnly, getResetRequests);

router.route('/:id')
    .put(protect, adminOnly, updateRequestStatus)
    .delete(protect, adminOnly, deleteResetRequest);

export default router;
