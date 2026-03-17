import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config({ path: './.env' });

const checkStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const studentCount = await Student.countDocuments();
        console.log(`Total Students in DB: ${studentCount}`);

        const sampleStudents = await Student.find().limit(10);
        console.log('Sample Students (name/status):');
        sampleStudents.forEach(s => {
            console.log(`- ${s.name}: Status: ${s.status}, Grade: ${s.grade}, CreatedAt: ${s.createdAt}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkStudents();
