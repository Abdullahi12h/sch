import express from 'express';
import { getCleaningChecklists, createCleaningChecklist, deleteCleaningChecklist } from '../controllers/cleaningController.js';
import { protect, adminOrHr } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, adminOrHr, getCleaningChecklists)
    .post(protect, adminOrHr, createCleaningChecklist);

router.route('/:id')
    .delete(protect, adminOrHr, deleteCleaningChecklist);

export default router;
