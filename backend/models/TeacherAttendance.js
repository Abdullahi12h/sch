import mongoose from 'mongoose';

const teacherAttendanceSchema = mongoose.Schema({
    teacherId: {
        type: String,
        required: true
    },
    teacherName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['P', 'A', 'L'],
        default: 'P'
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    totalWork: {
        type: String,
        default: '-'
    },
    reason: {
        type: String,
        default: '-'
    },
    isExcused: {
        type: Boolean,
        default: false
    },
    excuseReason: {
        type: String
    },
    excuseStatus: {
        type: String,
        default: 'pending'
    }
}, {
    timestamps: true
});

// Remove unique constraint temporarily to diagnose 500 errors
teacherAttendanceSchema.index({ teacherId: 1, date: 1 });

const TeacherAttendance = mongoose.model('TeacherAttendance', teacherAttendanceSchema);

export default TeacherAttendance;
