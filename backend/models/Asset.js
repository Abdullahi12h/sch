import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Asset name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        default: 'Other'
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 1
    },
    condition: {
        type: String,
        enum: ['New', 'Good', 'Fair', 'Poor', 'Broken'],
        default: 'Good'
    },
    location: {
        type: String,
        required: [true, 'Store/Location is required'],
        default: 'Main Office'
    },
    purchaseDate: {
        type: String,
        default: new Date().toISOString().split('T')[0]
    },
    price: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    lastMaintenance: {
        type: String
    },
    status: {
        type: String,
        enum: ['Available', 'In Use', 'In Repair', 'Retired'],
        default: 'Available'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
