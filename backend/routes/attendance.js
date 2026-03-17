import express from 'express';
import { addBulkAttendance, getAttendance, getStudentAbsents, getStudentsNotTaken } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getAttendance)
    .post(protect, addBulkAttendance);

router.get('/absents/:grade', protect, getStudentAbsents);
router.get('/not-taken/:grade', protect, getStudentsNotTaken);

export default router;
