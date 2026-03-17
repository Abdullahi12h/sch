import mongoose from 'mongoose';

const gradeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        default: 40
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    subjects: {
        type: [String],
        default: []
    },
    feeAmount: {
        type: Number,
        required: true,
        default: 0
    },
    examFeeAmount: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;
