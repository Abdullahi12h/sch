import express from 'express';
import { authUser, registerUser, getUserProfile, getUsers, updateUserCredentials, deleteUser, bulkDeleteUsers } from '../controllers/authController.js';
import { protect, adminOnly, adminOrHr } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

// User Management (Admin Only)
router.get('/users', protect, adminOnly, getUsers);
router.put('/users', protect, adminOnly, updateUserCredentials);
router.post('/users/bulk-delete', protect, adminOnly, bulkDeleteUsers);
router.delete('/users/:username', protect, adminOnly, deleteUser);

export default router;
