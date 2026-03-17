
import mongoose from 'mongoose';
import Student from './models/Student.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkStudent() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_system');

        const sid = '69adc8b7d4e4b187c3cc5bc5';
        const student = await Student.findById(sid);
        if (student) {
            console.log(`Student: ${student.name}, Grade: [${student.grade}], Status: ${student.status}`);
        } else {
            console.log('Student not found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStudent();
