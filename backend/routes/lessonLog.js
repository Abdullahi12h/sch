import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
    createLessonLog,
    getMyLessonLogs,
    getAdminFeed,
    updateLessonLog,
    deleteLessonLog
} from '../controllers/lessonLogController.js';

const router = express.Router();

router.route('/')
    .post(protect, createLessonLog);

router.route('/my-logs')
    .get(protect, getMyLessonLogs);

router.route('/feed')
    .get(protect, adminOnly, getAdminFeed);

router.route('/:id')
    .put(protect, adminOnly, updateLessonLog)
    .delete(protect, adminOnly, deleteLessonLog);

export default router;
