import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAdminFeed, getMyLessonLogs, createLessonLog } from './controllers/lessonLogController.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_db'); // Let's guess the DB name, though we can check config/db.js
        console.log('Connected to MongoDB');

        const req = { user: { username: 'testuser' }, body: {} };
        const res = { 
            status: (s) => ({ json: (d) => console.log('STATUS', s, 'JSON', d) }),
            json: (d) => console.log('JSON', d)
        };

        console.log('--- Testing getAdminFeed ---');
        await getAdminFeed(req, res);
        
        console.log('--- Testing getMyLessonLogs ---');
        await getMyLessonLogs(req, res);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

run();
