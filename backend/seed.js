import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedAdminUser = async () => {
    try {
        await User.deleteMany(); // Clear existing

        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@school.com',
            password: 'password123',
            role: 'admin'
        });

        const teacherUser = new User({
            name: 'Teacher Jama',
            email: 'teacher@school.com',
            password: 'password123',
            role: 'teacher'
        });

        const studentUser = new User({
            name: 'Student Ali',
            email: 'student@school.com',
            password: 'password123',
            role: 'student'
        });

        const cashierUser = new User({
            name: 'Cashier Ahmed',
            email: 'cashier@school.com',
            password: 'password123',
            role: 'cashier'
        });

        await adminUser.save();
        await teacherUser.save();
        await studentUser.save();
        await cashierUser.save();

        console.log('Users seeded successfully.');
        console.log('- Admin: admin@school.com | password123');
        console.log('- Teacher: teacher@school.com | password123');
        console.log('- Student: student@school.com | password123');
        console.log('- Cashier: cashier@school.com | password123');
        process.exit();
    } catch (error) {
        console.error(`Error with seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedAdminUser();
