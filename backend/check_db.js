import mongoose from 'mongoose';
import Teacher from './models/Teacher.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const checkTeachers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        const teachers = await Teacher.find({});
        console.log('Teachers in DB:');
        console.log(JSON.stringify(teachers, null, 2));

        const users = await User.find({ role: 'teacher' });
        console.log('Teacher Users in DB:');
        console.log(JSON.stringify(users, null, 2));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkTeachers();
