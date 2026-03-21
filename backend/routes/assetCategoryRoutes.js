import express from 'express';
const router = express.Router();
import {
    getCategories,
    createCategory,
    deleteCategory
} from '../controllers/assetCategoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, adminOnly, getCategories)
    .post(protect, adminOnly, createCategory);

router.route('/:id')
    .delete(protect, adminOnly, deleteCategory);

export default router;
