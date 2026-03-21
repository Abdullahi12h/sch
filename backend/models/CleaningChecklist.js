import mongoose from 'mongoose';

const cleaningSectionSchema = mongoose.Schema({
    task: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const cleaningChecklistSchema = mongoose.Schema(
    {
        staffName: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        sections: {
            classrooms: [cleaningSectionSchema],
            toilets: [cleaningSectionSchema],
            yard: [cleaningSectionSchema],
            security: [cleaningSectionSchema],
        },
        comments: {
            type: String,
        },
        supervisorName: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        suppliesStatus: {
            type: String,
            default: 'Haystaa',
        },
        suppliesNote: {
            type: String,
        },
        checkInTime: {
            type: String,
        },
        checkOutTime: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const CleaningChecklist = mongoose.model('CleaningChecklist', cleaningChecklistSchema);

export default CleaningChecklist;
