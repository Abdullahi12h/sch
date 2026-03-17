
import mongoose from 'mongoose';
import Finance from './models/Finance.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkFinanceAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_system');
        const records = await Finance.find({});
        console.log('Finance Records Statuses:');
        records.forEach(r => {
            console.log(` - Student: ${r.student}, Grade: ${r.grade}, Paid: ${r.paid}, Amount: ${r.amount}, Status: ${r.status}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkFinanceAll();
