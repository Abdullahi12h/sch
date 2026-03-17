import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        console.log('Connected to MongoDB');

        // Find admin by role
        let admin = await User.findOne({ role: 'admin' });
        
        if (!admin) {
            console.log('No admin found, creating one...');
            admin = await User.create({
                name: 'Admin User',
                username: 'admin@gmail.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin created: admin@gmail.com / admin123');
        } else {
            console.log(`Found admin: ${admin.username || admin.email || 'unknown'}`);
            
            // Force username to be admin@gmail.com if it's missing or we want to be sure
            admin.username = 'admin@gmail.com';
            admin.password = 'admin123';
            admin.rawPassword = 'admin123';
            
            await admin.save();
            console.log(`Admin updated: ${admin.username} / admin123`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetAdminPassword();
