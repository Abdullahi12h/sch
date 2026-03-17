import mongoose from 'mongoose';
import Student from './models/Student.js';

async function check() {
    await mongoose.connect('mongodb://localhost:27017/school_portal');
    const students = await Student.find({
        $or: [
            { grade: '' },
            { grade: null },
            { grade: { $exists: false } }
        ]
    });
    console.log(`Students without grade: ${students.length}`);
    students.forEach(s => console.log(` - ${s.name} (ID: ${s.id})`));
    process.exit(0);
}
check();
