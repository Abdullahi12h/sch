import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const testRegister = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        console.log('Connected');

        const name = "Test Register";
        const username = "testreg_" + Date.now();
        const password = "password123";
        const role = "cashier";
        const salary = 1000;

        const user = await User.create({
            name,
            username,
            password,
            rawPassword: password,
            role,
            salary
        });

        console.log('User created:', user._id);
        await user.deleteOne();
        console.log('Test cleanup done');

        process.exit();
    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.code) console.error('CODE:', error.code);
        if (error.keyValue) console.error('KEYVALUE:', error.keyValue);
        process.exit(1);
    }
};

testRegister();
