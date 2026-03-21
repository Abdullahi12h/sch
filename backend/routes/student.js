import express from 'express';
import {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    generateStudentCredentials,
    importStudents,
    toggleStudentResultsLock,
    bulkToggleStudentResultsLock,
    clearStudentCredentials
} from '../controllers/studentController.js';
import { protect, adminOnly, adminOrHr } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes
router.get('/', protect, getStudents);
router.post('/', protect, adminOrHr, addStudent);
router.post('/import', protect, adminOrHr, importStudents);
router.post('/generate-credentials', protect, adminOrHr, generateStudentCredentials);
router.post('/clear-credentials', protect, adminOrHr, clearStudentCredentials);
router.post('/bulk-lock', protect, adminOnly, bulkToggleStudentResultsLock);

// Individual student routes
router.put('/:id/toggle-lock', protect, adminOnly, toggleStudentResultsLock);
router.put('/:id', protect, adminOrHr, updateStudent);
router.delete('/:id', protect, adminOrHr, deleteStudent);

export default router;
