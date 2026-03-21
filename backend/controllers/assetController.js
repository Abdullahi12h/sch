import Asset from '../models/Asset.js';

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private/Admin
export const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find({}).sort({ updatedAt: -1 });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new asset record
// @route   POST /api/assets
// @access  Private/Admin
export const createAsset = async (req, res) => {
    try {
        const {
            name,
            category,
            quantity,
            condition,
            location,
            purchaseDate,
            price,
            description,
            status
        } = req.body;

        const asset = await Asset.create({
            name,
            category,
            quantity,
            condition,
            location,
            purchaseDate,
            price,
            description,
            status,
            addedBy: req.user._id
        });

        res.status(201).json(asset);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update asset record
// @route   PUT /api/assets/:id
// @access  Private/Admin
export const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (asset) {
            Object.assign(asset, req.body);
            const updatedAsset = await asset.save();
            res.json(updatedAsset);
        } else {
            res.status(404).json({ message: 'Asset record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete asset record
// @route   DELETE /api/assets/:id
// @access  Private/Admin
export const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (asset) {
            await asset.deleteOne();
            res.json({ message: 'Asset record removed' });
        } else {
            res.status(404).json({ message: 'Asset record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
