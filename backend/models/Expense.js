import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: true,
            default: 'Coffee',
        },
        color: {
            type: String,
            required: true,
            default: 'bg-emerald-500',
        },
        date: {
            type: Date,
            default: Date.now,
        },
        academicYear: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
