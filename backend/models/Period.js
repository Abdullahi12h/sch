import mongoose from 'mongoose';

const periodSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startTime: {
        type: String, // HH:mm
        required: true
    },
    endTime: {
        type: String, // HH:mm
        required: true
    },
    type: {
        type: String,
        enum: ['Regular', 'Break'],
        default: 'Regular'
    },
    isBreak: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

const Period = mongoose.model('Period', periodSchema);

export default Period;
