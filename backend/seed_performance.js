import mongoose from 'mongoose';
import Student from './models/Student.js';
import ExamMark from './models/ExamMark.js';
import Subject from './models/Subject.js';
import ExamType from './models/ExamType.js';

async function seedData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/school_portal');
        console.log('Connected to MongoDB');

        const academicYear = '2026-2027';

        // 1. Ensure Exam Type exists for the year
        let examType = await ExamType.findOne({ name: 'First Term', academicYear });
        if (!examType) {
            examType = await ExamType.create({
                name: 'First Term',
                academicYear,
                isActive: true,
                passPercentage: 50,
                weight: 100,
                totalMarks: 100
            });
            console.log('Created Exam Type: First Term 2026-2027');
        }

        // 2. Ensure some subjects exist
        const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
        const subjectDocs = [];
        for (const sName of subjects) {
            let s = await Subject.findOne({ name: sName });
            if (!s) s = await Subject.create({ name: sName });
            subjectDocs.push(s);
        }
        console.log('Ensured subjects exist');

        // 3. Get all students
        const students = await Student.find({ status: { $in: ['Enrolled', 'Active'] } });
        if (students.length === 0) {
            console.log('No students found to seed marks for!');
            return;
        }

        // 4. Clear existing marks for this exam type? 
        // No, let's just add new ones for simplicity.
        
        console.log(`Seeding marks for ${students.length} students...`);
        
        const marksToInsert = [];
        for (const student of students) {
            for (const subject of subjectDocs) {
                // Random total score between 60 and 99
                const totalScore = Math.floor(Math.random() * 40) + 60;
                
                marksToInsert.push({
                    studentId: student._id,
                    studentName: student.name,
                    subjectId: subject._id,
                    subjectName: subject.name,
                    examTypeId: examType._id,
                    examScore: Math.floor(totalScore * 0.7),
                    activityScore: Math.floor(totalScore * 0.3),
                    totalScore: totalScore,
                    isPassed: totalScore >= 50,
                    grade: student.grade
                });
            }
        }

        if (marksToInsert.length > 0) {
            await ExamMark.insertMany(marksToInsert);
            console.log(`Successfully inserted ${marksToInsert.length} exam marks.`);
        }

    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedData();
