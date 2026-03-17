import express from 'express';
import { getGrades, addGrade, updateGrade, deleteGrade, getGradeById } from '../controllers/gradeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getGrades)
    .post(protect, addGrade);

router.route('/:id')
    .get(protect, getGradeById)
    .put(protect, updateGrade)
    .delete(protect, deleteGrade);

export default router;
