import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamMark from './backend/models/ExamMark.js';
import ExamType from './backend/models/ExamType.js';

dotenv.config({ path: './backend/.env' });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const markCount = await ExamMark.countDocuments();
        const typeCount = await ExamType.countDocuments();

        console.log(`Total ExamMarks in DB: ${markCount}`);
        console.log(`Total ExamTypes in DB: ${typeCount}`);

        if (markCount > 0) {
            const sampleMarks = await ExamMark.find().limit(5).populate('examTypeId');
            console.log('Sample Marks (titles/types):');
            sampleMarks.forEach(m => {
                console.log(`- Student: ${m.studentName}, Subject: ${m.subjectName}, Score: ${m.totalScore}, Year: ${m.examTypeId?.academicYear}, Type: ${m.examTypeId?.name}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkData();
