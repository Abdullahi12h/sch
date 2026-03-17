import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

const clearData = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal';
        console.log(`Connecting to ${uri}...`);
        await mongoose.connect(uri);
        console.log('Connected.');

        // Raw collection access to avoid model import issues
        const result = await mongoose.connection.db.collection('teacherattendances').deleteMany({});
        console.log(`Deleted ${result.deletedCount} records.`);
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

clearData();
