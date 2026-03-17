
import mongoose from 'mongoose';
import Finance from './models/Finance.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkFinance() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_system');
        const records = await Finance.find({});
        console.log('Total Finance Records:', records.length);
        if (records.length > 0) {
            console.log('Sample Record:', JSON.stringify(records[0], null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkFinance();
