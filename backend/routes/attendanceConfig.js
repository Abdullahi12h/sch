import express from 'express';
import { getConfig, updateConfig } from '../controllers/attendanceConfigController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getConfig)
    .post(protect, adminOnly, updateConfig);

export default router;
