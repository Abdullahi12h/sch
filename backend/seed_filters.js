import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Period from './models/Period.js';
import Grade from './models/Grade.js';
import AcademicYear from './models/AcademicYear.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal';

const initialPeriods = [
    { name: 'Period 1', startTime: '08:00', endTime: '08:45', type: 'Regular', isBreak: false, status: 'Active' },
    { name: 'Period 2', startTime: '08:45', endTime: '09:30', type: 'Regular', isBreak: false, status: 'Active' },
    { name: 'Period 3', startTime: '10:00', endTime: '10:45', type: 'Regular', isBreak: false, status: 'Active' },
    { name: 'Period 4', startTime: '10:45', endTime: '11:30', type: 'Regular', isBreak: false, status: 'Active' },
];

const initialGrades = [
    { name: 'Form 1', code: 'F1', capacity: 40, status: 'Active' },
    { name: 'Form 2', code: 'F2', capacity: 40, status: 'Active' },
    { name: 'Form 3', code: 'F3', capacity: 40, status: 'Active' },
    { name: 'Form 4', code: 'F4', capacity: 40, status: 'Active' },
];

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Seed Periods
    for (const p of initialPeriods) {
        const exists = await Period.findOne({ name: p.name });
        if (!exists) {
            await Period.create(p);
            console.log(`Created Period: ${p.name}`);
        }
    }

    // Seed Grades
    for (const g of initialGrades) {
        const exists = await Grade.findOne({ name: g.name });
        if (!exists) {
            await Grade.create(g);
            console.log(`Created Grade: ${g.name}`);
        }
    }

    // Ensure at least one Academic Year
    const yearExists = await AcademicYear.findOne({});
    if (!yearExists) {
        await AcademicYear.create({
            name: '2024-2025',
            startDate: '2024-09-01',
            endDate: '2025-06-30',
            isCurrent: true,
            status: 'active'
        });
        console.log('Created Academic Year: 2024-2025');
    }

    console.log('Seeding complete!');
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
