import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const checkAdmin = async () => {
    try {
        await connectDB();
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            console.log('Admin User Found:');
            console.log('Username:', adminUser.username);
            console.log('Name:', adminUser.name);
            console.log('Raw Password:', adminUser.rawPassword || 'Not stored');
            console.log('Hashed Password:', adminUser.password);
        } else {
            console.log('No Admin User found.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
