import express from 'express';
const router = express.Router();
import {
    getExamTypes,
    createExamType,
    updateExamType,
    deleteExamType,
    toggleExamTypeResultsLock
} from '../controllers/examTypeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, getExamTypes)
    .post(protect, adminOnly, createExamType);

router.route('/:id')
    .put(protect, adminOnly, updateExamType)
    .delete(protect, adminOnly, deleteExamType);

router.put('/:id/toggle-lock', protect, adminOnly, toggleExamTypeResultsLock);

export default router;
