import mongoose from 'mongoose';

const lessonLogSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    chapter: {
        type: String,
        required: true
    },
    page: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Completed', 'Pending'],
        default: 'Completed'
    }
}, { timestamps: true });

const LessonLog = mongoose.model('LessonLog', lessonLogSchema);
export default LessonLog;
