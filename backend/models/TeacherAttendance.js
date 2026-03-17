import mongoose from 'mongoose';

const teacherAttendanceSchema = mongoose.Schema({
    teacherId: {
        type: Number,
        required: true,
        ref: 'Teacher'
    },
    teacherName: {
        type: String,
        required: true
    },
    date: {
        type: String, // 'YYYY-MM-DD'
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['P', 'A', 'L'], // Present, Absent, Late
        default: 'P'
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    excuseReason: {
        type: String,
        default: ''
    },
    excuseStatus: {
        type: String,
        enum: ['None', 'Pending', 'Approved', 'Rejected'],
        default: 'None'
    },
    excuseImage: {
        type: String, // URL/Path to proof image
        default: ''
    }
}, {
    timestamps: true
});

// Ensure a teacher can only have one attendance for a specific date
teacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

const TeacherAttendance = mongoose.model('TeacherAttendance', teacherAttendanceSchema);

export default TeacherAttendance;
