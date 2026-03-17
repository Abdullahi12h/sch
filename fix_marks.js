import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamMark from './backend/models/ExamMark.js';
import Student from './backend/models/Student.js';

dotenv.config({ path: './backend/.env' });

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const marksCount = await ExamMark.countDocuments();
        const missingGradeCount = await ExamMark.countDocuments({ grade: { $exists: false } });
        console.log(`Summary: Total marks: ${marksCount}, missing grade: ${missingGradeCount}`);

        if (missingGradeCount > 0) {
            console.log('Fixing marks to include student grade from their profiles...');
            const allMarks = await ExamMark.find({ grade: { $exists: false } });
            let fixed = 0;
            for (const m of allMarks) {
                const s = await Student.findById(m.studentId);
                if (s && s.grade) {
                    m.grade = s.grade;
                    await m.save();
                    fixed++;
                }
            }
            console.log(`Done! Fixed ${fixed} marks.`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

fixData();
