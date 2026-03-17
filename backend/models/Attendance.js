import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    studentId: {
        type: Number,
        required: true,
        ref: 'Student'
    },
    studentName: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    period: {
        type: String,
        required: true
    },
    date: {
        type: String, // String for easier matching with the frontend's '2026-03-04'
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['P', 'A', 'S', 'V', 'L', 'N'], // Present, Absent, Sick, Vacation, Late, None
        default: 'P'
    },
    reason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure a student can only have one attendance for a specific date and period within a year
attendanceSchema.index({ studentId: 1, date: 1, period: 1, academicYear: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
