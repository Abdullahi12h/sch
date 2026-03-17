
import mongoose from 'mongoose';
import Student from './models/Student.js';
import ExamMark from './models/ExamMark.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_system');

        const targetGrade = 'form four';
        const students = await Student.find({ grade: { $regex: new RegExp(`^${targetGrade}$`, 'i') } });
        console.log(`Students in ${targetGrade}:`, students.length);
        students.forEach(s => console.log(` - ${s.name} (${s._id})`));

        const marks = await ExamMark.find({ grade: { $regex: new RegExp(`^${targetGrade}$`, 'i') } });
        const uniqueStudentIdsInMarks = [...new Set(marks.map(m => m.studentId.toString()))];
        console.log(`Unique Student IDs with marks in ${targetGrade}:`, uniqueStudentIdsInMarks.length);

        for (const sid of uniqueStudentIdsInMarks) {
            const student = await Student.findById(sid);
            const studentMarks = marks.filter(m => m.studentId.toString() === sid);
            console.log(`Student ID ${sid}: ${student ? student.name : 'DELETED/NOT FOUND'} - ${studentMarks.length} marks`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
