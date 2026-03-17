import mongoose from 'mongoose';
import LessonLog from './models/LessonLog.js';
import Teacher from './models/Teacher.js';
import Subject from './models/Subject.js';
import Grade from './models/Grade.js';

async function seedLogs() {
    try {
        await mongoose.connect('mongodb://localhost:27017/school_portal');
        console.log('Connected to MongoDB');

        const teachers = await Teacher.find();
        const subjects = await Subject.find();
        const grades = await Grade.find();

        if (teachers.length === 0 || subjects.length === 0 || grades.length === 0) {
            console.log('Missing required data (Teachers, Subjects, or Grades)');
            process.exit(0);
        }

        await LessonLog.deleteMany({}); // Clear old logs

        const logs = [];
        const academicYear = '2026-2027';

        const lessonTitles = [
            'Introduction to Algebra', 'Chemical Reactions', 'The Civil War', 
            'Grammar Essentials', 'Geography of Africa', 'Human Biology',
            'Physics Fundamentals', 'World Poetry', 'Data Structures', 'Environmental Science'
        ];

        for (let i = 0; i < 20; i++) {
            const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            const randomGrade = grades[Math.floor(Math.random() * grades.length)];
            const randomTitle = lessonTitles[Math.floor(Math.random() * lessonTitles.length)];

            logs.push({
                teacher: randomTeacher._id,
                subject: randomSubject._id,
                grade: randomGrade._id,
                academicYear,
                title: randomTitle,
                chapter: `Chapter ${Math.floor(Math.random() * 5) + 1}`,
                page: `Page ${Math.floor(Math.random() * 100) + 10}`,
                date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
                status: 'Completed'
            });
        }

        await LessonLog.insertMany(logs);
        console.log(`Successfully seeded ${logs.length} lesson logs.`);

    } catch (error) {
        console.error('Error seeding logs:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedLogs();
