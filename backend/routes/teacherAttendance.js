import express from 'express';
import {
    saveTeacherAttendance,
    getTeacherAttendanceHistory,
    getTeacherAttendanceStats,
    clockInTeacher,
    clockOutTeacher,
    submitExcuse,
    handleExcuse,
    clearAllTeacherAttendance
} from '../controllers/teacherAttendanceController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, adminOnly, getTeacherAttendanceHistory)
    .post(protect, adminOnly, saveTeacherAttendance);

router.post('/clock-in', protect, clockInTeacher);
router.post('/clock-out', protect, clockOutTeacher);
router.post('/excuse', protect, submitExcuse);
router.put('/excuse', protect, adminOnly, handleExcuse);

router.get('/stats', protect, adminOnly, getTeacherAttendanceStats);
router.delete('/all', protect, adminOnly, clearAllTeacherAttendance);

export default router;
