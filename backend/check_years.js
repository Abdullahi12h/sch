import mongoose from 'mongoose';
import AcademicYear from './models/AcademicYear.js';

async function checkYears() {
    try {
        await mongoose.connect('mongodb://localhost:27017/school_portal');
        const years = await AcademicYear.find();
        console.log('--- ACADEMIC YEARS ---');
        console.log(JSON.stringify(years, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
checkYears();
