import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';

mongoose.connect(uri).then(async () => {
    console.log('Connected to DB');
    const result = await mongoose.connection.db.collection('students').updateMany(
        { gpa: { $exists: true } },
        { $rename: { 'gpa': 'address' } }
    );
    console.log('Update result:', result);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
