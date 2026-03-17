import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const updateAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        
        // Update admin@gmail.com to have username "admin"
        const result1 = await User.updateOne(
            { email: 'admin@gmail.com' },
            { $set: { username: 'admin' } }
        );
        console.log('Update admin@gmail.com:', result1);

        // Also ensure it has a rawPassword for reference if missing
        const admin = await User.findOne({ username: 'admin' });
        if (admin && !admin.rawPassword) {
            admin.rawPassword = '12345';
            await admin.save();
            console.log('Set rawPassword for admin');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateAdmins();
