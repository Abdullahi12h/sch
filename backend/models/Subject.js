import mongoose from 'mongoose';

const subjectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
