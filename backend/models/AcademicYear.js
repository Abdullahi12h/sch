import mongoose from 'mongoose';

const academicYearSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // e.g. '2024-2025'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isCurrent: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'upcoming'],
        default: 'upcoming'
    }
}, {
    timestamps: true
});

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

export default AcademicYear;
