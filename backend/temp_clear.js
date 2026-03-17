import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Finance from './models/Finance.js';

dotenv.config();

const clearFinance = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        console.log('Connected to MongoDB');

        const result = await Finance.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} finance records.`);

        process.exit(0);
    } catch (error) {
        console.error('Error clearing finance records:', error);
        process.exit(1);
    }
};

clearFinance();
