import mongoose from 'mongoose';

const examTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true,
        default: '2024-2025'
    },
    passPercentage: {
        type: Number,
        required: true,
        default: 50
    },
    weight: {
        type: Number,
        required: true,
        default: 25
    },
    totalMarks: {
        type: Number,
        required: true,
        default: 100
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isResultsLocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const ExamType = mongoose.model('ExamType', examTypeSchema);

export default ExamType;
