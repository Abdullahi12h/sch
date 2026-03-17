import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Subject from './models/Subject.js';
import Grade from './models/Grade.js';
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

        const teacherUser = await User.findOne({ role: 'teacher' });
        const subject = await Subject.findOne();
        const grade = await Grade.findOne();

        if (!teacherUser || !subject || !grade) return;
        
        const token = generateToken(teacherUser._id);
        
        const payload = JSON.stringify({
            subject: subject._id.toString(),
            grade: grade._id.toString(),
            academicYear: '2025/2026',
            chapter: 'Chapter 1',
            page: 'Page 5'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/lesson-logs',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = http.request(options, res => {
            console.log(`STATUS: ${res.statusCode}`);
            res.on('data', d => console.log('DATA:', d.toString()));
            res.on('end', () => process.exit(0));
        });

        req.write(payload);
        req.end();

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

run();
