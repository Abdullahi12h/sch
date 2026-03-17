import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamMark from './models/ExamMark.js';

dotenv.config();

const clearExams = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        console.log('Connected to MongoDB');

        const result = await ExamMark.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} exam marks.`);

        process.exit(0);
    } catch (error) {
        console.error('Error clearing exam marks:', error);
        process.exit(1);
    }
};

clearExams();
