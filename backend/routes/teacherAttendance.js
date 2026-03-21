import express from 'express';
import {
    getTeacherAttendanceHistory,
    getTeacherAttendanceStats,
    clockInTeacher,
    clockOutTeacher,
    getMyAttendanceHistory
} from '../controllers/teacherAttendanceController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getTeacherAttendanceHistory);
router.get('/my-attendance', protect, getMyAttendanceHistory);
router.post('/clock-in', protect, clockInTeacher);
router.post('/clock-out', protect, clockOutTeacher);
router.get('/stats', protect, adminOnly, getTeacherAttendanceStats);

export default router;
