import mongoose from 'mongoose';

const salarySchema = mongoose.Schema({
    employeeId: {
        type: String,
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    employeeType: {
        type: String,
        enum: ['Teacher', 'Staff'],
        required: true
    },
    month: {
        type: String, // 'January', 'February', etc.
        required: true
    },
    year: {
        type: String, // '2024/2025'
        required: true
    },
    salaryAmount: {
        type: Number,
        required: true
    },
    bonus: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    paidAmount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: String, // 'YYYY-MM-DD'
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Partial', 'Unpaid'],
        default: 'Paid'
    },
    academicYear: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Ensure unique record per employee per month/year
salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Salary = mongoose.model('Salary', salarySchema);

export default Salary;
