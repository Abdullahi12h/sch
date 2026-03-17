import mongoose from 'mongoose';
import Student from './models/Student.js';

async function testFilter() {
    try {
        await mongoose.connect('mongodb://localhost:27017/school_portal');
        
        const testGrades = ['form one', 'form two', 'form four'];
        
        for (const g of testGrades) {
            const filter = {
                grade: { $regex: `^${g.trim()}$`, $options: 'i' },
                status: { $in: ['Enrolled', 'Active'] }
            };
            const students = await Student.find(filter);
            console.log(`Grade: "${g}", Found: ${students.length}`);
            students.forEach(s => console.log(` - ${s.name} (Grade in DB: "${s.grade}")`));
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

testFilter();
