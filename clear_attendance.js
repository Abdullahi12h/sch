import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the model using absolute path
import TeacherAttendance from './backend/models/TeacherAttendance.js';

dotenv.config();

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_stms');
        console.log('MongoDB Connected...');

        const result = await TeacherAttendance.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} teacher attendance records.`);
        
        process.exit();
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
