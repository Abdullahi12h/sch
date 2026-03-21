import express from 'express';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher, generateTeacherCredentials, clearTeacherCredentials } from '../controllers/teacherController.js';
import { protect, adminOrHr } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, adminOrHr, getTeachers)
    .post(protect, adminOrHr, addTeacher);

router.route('/:id')
    .put(protect, adminOrHr, updateTeacher)
    .delete(protect, adminOrHr, deleteTeacher);

router.post('/generate-credentials', protect, adminOrHr, generateTeacherCredentials);
router.post('/clear-credentials', protect, adminOrHr, clearTeacherCredentials);

export default router;
