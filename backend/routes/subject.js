import express from 'express';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSubjects)
    .post(protect, adminOnly, addSubject);

router.route('/:id')
    .put(protect, adminOnly, updateSubject)
    .delete(protect, adminOnly, deleteSubject);

export default router;
