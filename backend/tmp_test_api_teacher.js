import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import http from 'http';

dotenv.config();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_db');
        console.log('Connected to MongoDB');

        const teacherUser = await User.findOne({ role: 'teacher' });
        if (!teacherUser) {
            console.log('No teacher user found in DB!');
            process.exit(1);
        }
        
        const token = generateToken(teacherUser._id);
        console.log('Got teacher user token:', token);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/lesson-logs/my-logs',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, res => {
            console.log(`STATUS: ${res.statusCode}`);
            res.on('data', d => {
                console.log('DATA:', d.toString());
            });
            res.on('end', () => process.exit(0));
        });

        req.on('error', error => {
            console.error('Request Error:', error);
            process.exit(1);
        });

        req.end();

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

run();
