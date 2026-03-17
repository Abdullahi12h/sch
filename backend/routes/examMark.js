import express from 'express';
const router = express.Router();
import {
    getMarks,
    submitMarks,
    deleteMark
} from '../controllers/examMarkController.js';
import { protect, adminOrTeacher } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, getMarks)
    .post(protect, adminOrTeacher, submitMarks);

router.route('/:id')
    .delete(protect, adminOrTeacher, deleteMark);

export default router;
