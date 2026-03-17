import express from 'express';
const router = express.Router();
import {
    getFinanceRecords,
    createFinanceRecord,
    updateFinanceRecord,
    deleteFinanceRecord,
    getMyFinanceRecords
} from '../controllers/financeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

// Middleware to allow both admin and cashier
const adminOrCashier = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'cashier')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin or cashier' });
    }
};

// Student: get their own finance records (no admin required)
router.get('/student/me', protect, getMyFinanceRecords);

router.route('/')
    .get(protect, adminOrCashier, getFinanceRecords)
    .post(protect, adminOrCashier, createFinanceRecord);

router.route('/:id')
    .put(protect, adminOrCashier, updateFinanceRecord)
    .delete(protect, adminOrCashier, deleteFinanceRecord);

export default router;
