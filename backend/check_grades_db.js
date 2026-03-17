
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkGrades() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_system');
        const db = mongoose.connection.db;
        const grades = await db.collection('grades').find({}).toArray();
        console.log('Grades:', JSON.stringify(grades, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkGrades();
