import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';
import Subject from './models/Subject.js';
import Grade from './models/Grade.js';
import ExamMark from './models/ExamMark.js';
import ExamType from './models/ExamType.js';

dotenv.config();

const checkAllData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management');

        const usersCount = await User.countDocuments();
        const studentsCount = await Student.countDocuments();
        const teachersCount = await Teacher.countDocuments();
        const subjectsCount = await Subject.countDocuments();
        const gradesCount = await Grade.countDocuments();
        const examMarksCount = await ExamMark.countDocuments();
        const examTypesCount = await ExamType.countDocuments();

        console.log('--- Database Stats ---');
        console.log(`Users: ${usersCount}`);
        console.log(`Students: ${studentsCount}`);
        console.log(`Teachers: ${teachersCount}`);
        console.log(`Subjects: ${subjectsCount}`);
        console.log(`Grades: ${gradesCount}`);
        console.log(`Exam Marks: ${examMarksCount}`);
        console.log(`Exam Types: ${examTypesCount}`);

        if (subjectsCount > 0) {
            const subjects = await Subject.find({});
            console.log('\n--- Subjects ---');
            console.log(JSON.stringify(subjects, null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAllData();
