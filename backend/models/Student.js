import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    grade: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female']
    },
    shift: {
        type: String,
        required: true,
        enum: ['Morning', 'Afternoon']
    },
    address: {
        type: String,
        required: false,
        default: ''
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive', 'Enrolled', 'Pending', 'Rejected'],
        default: 'Pending'
    },
    parent: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    absences: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isResultsLocked: {
        type: Boolean,
        default: false
    },
    tuitionFee: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
