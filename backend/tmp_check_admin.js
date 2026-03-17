import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        const admin = await User.findOne({ username: 'admin' });
        if (admin) {
            console.log(`Username: ${admin.username}`);
            console.log(`Password: ${admin.rawPassword}`);
        } else {
            console.log('Admin not found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAdmin();
