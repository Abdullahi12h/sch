import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const findAdmin = async () => {
    try {
        await connectDB();
        
        // Get ALL admin users
        const adminUsers = await User.find({ role: 'admin' });
        console.log(`Found ${adminUsers.length} admin user(s):\n`);
        
        for (const u of adminUsers) {
            console.log('----------------------------');
            console.log('Name:', u.name);
            console.log('Username:', JSON.stringify(u.username));
            console.log('Email:', JSON.stringify(u.email));
            console.log('rawPassword:', JSON.stringify(u.rawPassword));
            console.log('Password hash:', u.password);
            
            // Try common passwords
            const tries = ['admin123', '12345', 'password123', 'admin', '1234', 'admin@123'];
            for (const pw of tries) {
                const match = await bcrypt.compare(pw, u.password);
                if (match) {
                    console.log(`✅ PASSWORD MATCH: "${pw}"`);
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findAdmin();
