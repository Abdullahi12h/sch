import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal';

async function fix() {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    await db.collection('exammarks').updateMany({ grade: 'Form 1' }, { $set: { grade: 'form one' } });
    await db.collection('exammarks').updateMany({ grade: 'Form 2' }, { $set: { grade: 'form two' } });
    await db.collection('exammarks').updateMany({ grade: 'Form 4' }, { $set: { grade: 'form four' } });

    await db.collection('students').updateMany({ grade: 'Form 1' }, { $set: { grade: 'form one' } });
    await db.collection('students').updateMany({ grade: 'Form 2' }, { $set: { grade: 'form two' } });
    await db.collection('students').updateMany({ grade: 'Form 4' }, { $set: { grade: 'form four' } });

    console.log('✅ Updated all grades to match API format.');
    mongoose.disconnect();
}

fix();
