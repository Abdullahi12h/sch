import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Teacher from './models/Teacher.js';
import Student from './models/Student.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_db');
        console.log('Connected to DB');

        const users = await User.find();
        console.log(`Total Users: ${users.length}`);

        for (const user of users) {
             console.log(`User: ${user.username}, Role: ${user.role}`);
             if (user.role === 'teacher') {
                 const t = await Teacher.findOne({ username: user.username });
                 if (!t) console.log(`  MISSING TEACHER RECORD for ${user.username}`);
             }
             if (user.role === 'student') {
                 const s = await Student.findOne({ 
                     $or: [
                        { email: user.username },
                        { username: user.username }
                     ]
                 });
                 if (!s) console.log(`  MISSING STUDENT RECORD for ${user.username}`);
             }
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkData();
