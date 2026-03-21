import AssetCategory from '../models/AssetCategory.js';

// @desc    Get all asset categories
// @route   GET /api/asset-categories
// @access  Private/Admin
export const getCategories = async (req, res) => {
    try {
        const categories = await AssetCategory.find({}).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new asset category
// @route   POST /api/asset-categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const exists = await AssetCategory.findOne({ name: name.trim() });
        if (exists) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        const category = await AssetCategory.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete asset category
// @route   DELETE /api/asset-categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
    try {
        const category = await AssetCategory.findById(req.params.id);
        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
