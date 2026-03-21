import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './backend/models/Student.js';
import Finance from './backend/models/Finance.js';
import Expense from './backend/models/Expense.js';

dotenv.config({ path: './backend/.env' });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const studentCount = await Student.countDocuments();
        const financeCount = await Finance.countDocuments();
        const expenseCount = await Expense.countDocuments();
        
        const sampleFinance = await Finance.findOne();
        const sampleExpense = await Expense.findOne();
        
        console.log({
            studentCount,
            financeCount,
            expenseCount,
            sampleFinance,
            sampleExpense
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
