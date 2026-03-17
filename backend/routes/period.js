import express from 'express';
import { getPeriods, addPeriod, updatePeriod, deletePeriod } from '../controllers/periodController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getPeriods)
    .post(protect, adminOnly, addPeriod);

router.route('/:id')
    .put(protect, adminOnly, updatePeriod)
    .delete(protect, adminOnly, deletePeriod);

export default router;
