import mongoose from 'mongoose';

async function wipeStudentData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/school_portal');
        console.log('Connected to database...');

        const db = mongoose.connection.db;

        // 1. Delete all students
        const studentResult = await db.collection('students').deleteMany({});
        console.log(`Deleted ${studentResult.deletedCount} student records from "students" collection.`);

        // 2. Delete all attendance records
        const attendanceResult = await db.collection('attendances').deleteMany({});
        console.log(`Deleted ${attendanceResult.deletedCount} attendance records.`);

        // 3. Delete all exam marks
        const marksResult = await db.collection('exammarks').deleteMany({});
        console.log(`Deleted ${marksResult.deletedCount} exam marks records.`);

        // 4. Delete all exam attendances
        const examAttResult = await db.collection('examattendances').deleteMany({});
        console.log(`Deleted ${examAttResult.deletedCount} exam attendance records.`);

        // 5. Delete all student users
        const usersResult = await db.collection('users').deleteMany({ role: 'student' });
        console.log(`Deleted ${usersResult.deletedCount} student users from "users" collection.`);

        // 6. Delete student finances (if any)
        const financeResult = await db.collection('finances').deleteMany({});
        console.log(`Deleted ${financeResult.deletedCount} finance records (clearing all for fresh start).`);

        console.log('\nSUCCESS: All student-related data has been wiped.');
        
    } catch (err) {
        console.error('ERROR during wipe:', err);
    } finally {
        process.exit(0);
    }
}

wipeStudentData();
