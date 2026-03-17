import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AcademicYear from './models/AcademicYear.js';
import ExamType from './models/ExamType.js';
import Grade from './models/Grade.js';
import Student from './models/Student.js';
import Subject from './models/Subject.js';
import ExamMark from './models/ExamMark.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_db');
        console.log('Connected to MongoDB');

        const yearName = '2026-2027';
        
        // 1. Ensure Academic Year exists
        let academicYear = await AcademicYear.findOne({ name: yearName });
        if (!academicYear) {
            academicYear = await AcademicYear.create({
                name: yearName,
                startDate: new Date('2026-08-01'),
                endDate: new Date('2027-06-30'),
                status: 'upcoming',
                isCurrent: false
            });
            console.log(`Created Academic Year: ${yearName}`);
        }

        // 2. Clear previous 2026-2027 data to avoid duplicates/overlap
        const oldTypes = await ExamType.find({ academicYear: yearName });
        const oldTypeIds = oldTypes.map(t => t._id);
        
        await ExamMark.deleteMany({ examTypeId: { $in: oldTypeIds } });
        await ExamType.deleteMany({ academicYear: yearName });
        console.log(`Cleared previous data for ${yearName}`);

        // 3. Create NEW Exam Types: Billeed 1, Billeed 2, Term, Final
        const examNames = ['Billeed 1', 'Billeed 2', 'Term', 'Final'];
        const examTypes = [];
        for (const name of examNames) {
            const et = await ExamType.create({
                name,
                academicYear: yearName,
                passPercentage: 50,
                weight: 25,
                totalMarks: 100,
                isActive: true
            });
            console.log(`Created Exam Type: ${name} for ${yearName}`);
            examTypes.push(et);
        }

        // 4. Get active grades and subjects
        const grades = await Grade.find({ status: 'Active' });
        const subjects = await Subject.find({ status: 'Active' });
        
        if (grades.length === 0 || subjects.length === 0) {
            console.log('No active grades or subjects found.');
            process.exit(1);
        }

        // 5. Generate Sample Marks
        for (const grade of grades) {
            const students = await Student.find({ grade: grade.name, status: 'Active' });
            if (students.length === 0) {
                console.log(`No active students in ${grade.name}, skipping.`);
                continue;
            }

            for (const subject of subjects) {
                for (const student of students) {
                    for (const examType of examTypes) {
                        const examScore = Math.floor(Math.random() * 40) + 50; // 50-90
                        const activityScore = Math.floor(Math.random() * 5) + 2; // 2-7
                        const totalScore = examScore + activityScore;
                        
                        await ExamMark.create({
                            studentId: student._id,
                            studentName: student.name,
                            subjectId: subject._id,
                            subjectName: subject.name,
                            examTypeId: examType._id,
                            examScore,
                            activityScore,
                            totalScore,
                            isPassed: totalScore >= examType.passPercentage,
                            grade: grade.name
                        });
                    }
                }
            }
            console.log(`Generated marks for ${grade.name} (${students.length} students)`);
        }

        console.log('New sample data generation (Billeed 1, 2, Term, Final) completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

run();
