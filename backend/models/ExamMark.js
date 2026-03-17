import mongoose from 'mongoose';

const examMarkSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    },
    studentName: {
        type: String,
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subject'
    },
    subjectName: {
        type: String,
        required: true
    },
    examTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ExamType'
    },
    examScore: {
        type: Number,
        required: true,
        default: 0
    },
    activityScore: {
        type: Number,
        required: true,
        default: 0
    },
    totalScore: {
        type: Number,
        required: true
    },
    isPassed: {
        type: Boolean,
        default: false
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    grade: {
        type: String
    },
    period: {
        type: String
    }
}, {
    timestamps: true
});

const ExamMark = mongoose.model('ExamMark', examMarkSchema);

export default ExamMark;
