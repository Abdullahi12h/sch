import mongoose from 'mongoose';

const financeSchema = mongoose.Schema(
    {
        student: {
            type: String,
            required: true,
        },
        grade: {
            type: String,
            required: true,
        },
        term: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 0,
        },
        paid: {
            type: Number,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            required: true,
            enum: ['Paid', 'Partial', 'Unpaid'],
            default: 'Unpaid',
        },
        date: {
            type: String,
            required: true,
        },
        academicYear: {
            type: String,
            required: false, // For backward compatibility
        },
    },
    {
        timestamps: true,
    }
);

const Finance = mongoose.model('Finance', financeSchema);

export default Finance;
