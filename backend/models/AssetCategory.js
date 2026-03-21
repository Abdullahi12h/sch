import mongoose from 'mongoose';

const assetCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const AssetCategory = mongoose.model('AssetCategory', assetCategorySchema);
export default AssetCategory;
