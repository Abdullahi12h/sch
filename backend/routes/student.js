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
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes
router.get('/', protect, getStudents);
router.post('/', protect, addStudent);
router.post('/import', protect, adminOnly, importStudents);
router.post('/generate-credentials', protect, adminOnly, generateStudentCredentials);
router.post('/clear-credentials', protect, adminOnly, clearStudentCredentials);
router.post('/bulk-lock', protect, adminOnly, bulkToggleStudentResultsLock);

// Individual student routes
router.put('/:id/toggle-lock', protect, adminOnly, toggleStudentResultsLock);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

export default router;
