import express from 'express';
import { getAcademicYears, createAcademicYear, updateAcademicYear } from '../controllers/academicYearController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getAcademicYears)
    .post(protect, createAcademicYear);

router.route('/:id')
    .put(protect, updateAcademicYear);

export default router;
