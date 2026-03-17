import mongoose from 'mongoose';

const attendanceConfigSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['teacher', 'student'],
        default: 'teacher'
    },
    startTime: {
        type: String, // 'HH:mm' e.g. '07:30'
        required: true
    },
    lateTime: {
        type: String, // 'HH:mm' e.g. '08:00'
        required: true
    },
    absentTime: {
        type: String, // 'HH:mm' e.g. '09:00'
        required: true
    },
    checkInStart: {
        type: String, // 'HH:mm' e.g. '06:00'
        default: '06:00'
    },
    checkOutLimit: {
        type: String, // 'HH:mm' e.g. '18:00'
        default: '18:00'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const AttendanceConfig = mongoose.model('AttendanceConfig', attendanceConfigSchema);

export default AttendanceConfig;
