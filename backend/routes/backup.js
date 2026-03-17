import express from 'express';
import { exportData, importData } from '../controllers/backupController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/export', protect, adminOnly, exportData);
router.post('/import', protect, adminOnly, importData);

export default router;
