import mongoose from 'mongoose';

const resetRequestSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true,
        default: 'Wuxuu codsaday in loo reset gareeyo password-ka.'
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ResetRequest = mongoose.model('ResetRequest', resetRequestSchema);
export default ResetRequest;
