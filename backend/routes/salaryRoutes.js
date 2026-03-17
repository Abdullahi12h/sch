import express from 'express';
const router = express.Router();
import {
    getSalaries,
    createSalary,
    updateSalary,
    deleteSalary
} from '../controllers/salaryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, adminOnly, getSalaries)
    .post(protect, adminOnly, createSalary);

router.route('/:id')
    .put(protect, adminOnly, updateSalary)
    .delete(protect, adminOnly, deleteSalary);

export default router;
