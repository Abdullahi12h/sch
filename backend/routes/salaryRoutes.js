import express from 'express';
const router = express.Router();
import {
    getSalaries,
    createSalary,
    updateSalary,
    deleteSalary
} from '../controllers/salaryController.js';
import { protect, adminOrHr } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, adminOrHr, getSalaries)
    .post(protect, adminOrHr, createSalary);

router.route('/:id')
    .put(protect, adminOrHr, updateSalary)
    .delete(protect, adminOrHr, deleteSalary);

export default router;
