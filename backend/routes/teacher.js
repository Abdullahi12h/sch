import express from 'express';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher, generateTeacherCredentials, clearTeacherCredentials } from '../controllers/teacherController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTeachers)
    .post(protect, addTeacher);

router.route('/:id')
    .put(protect, updateTeacher)
    .delete(protect, deleteTeacher);

router.post('/generate-credentials', protect, generateTeacherCredentials);
router.post('/clear-credentials', protect, clearTeacherCredentials);

export default router;
