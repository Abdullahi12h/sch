import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TeacherAttendance from './models/TeacherAttendance.js';

dotenv.config();

const clearTeacherAttendance = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        console.log('Connected to MongoDB');

        const result = await TeacherAttendance.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} teacher attendance records.`);

        process.exit(0);
    } catch (error) {
        console.error('Error clearing teacher attendance:', error);
        process.exit(1);
    }
};

clearTeacherAttendance();
