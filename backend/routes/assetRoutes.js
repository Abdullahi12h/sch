import express from 'express';
const router = express.Router();
import {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset
} from '../controllers/assetController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, adminOnly, getAssets)
    .post(protect, adminOnly, createAsset);

router.route('/:id')
    .put(protect, adminOnly, updateAsset)
    .delete(protect, adminOnly, deleteAsset);

export default router;
