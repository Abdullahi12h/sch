import mongoose from 'mongoose';

const teacherSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Full-Time', 'Part-Time', 'Contract'],
        default: 'Full-Time'
    },
    phone: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    assignedClasses: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    salary: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
