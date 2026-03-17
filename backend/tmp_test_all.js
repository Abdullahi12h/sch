import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import http from 'http';

dotenv.config();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });

const makeReq = (path, token, name) => {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost', port: 5000, path, method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, res => {
            let out = '';
            res.on('data', d => out += d);
            res.on('end', () => resolve({ name, path, status: res.statusCode, body: out }));
        });
        req.on('error', e => resolve({ name, path, status: 'ERROR', body: e.message }));
        req.end();
    });
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_db');
        const admin = await User.findOne({ role: 'admin' });
        const teacher = await User.findOne({ role: 'teacher' });

        const adminToken = admin ? generateToken(admin._id) : null;
        const teacherToken = teacher ? generateToken(teacher._id) : null;

        const results = [];
        if (adminToken) {
            results.push(await makeReq('/api/dashboard/stats?academicYear=All', adminToken, 'Admin Stats'));
            results.push(await makeReq('/api/lesson-logs/feed', adminToken, 'Admin Feed'));
        }
        if (teacherToken) {
            results.push(await makeReq('/api/dashboard/stats?academicYear=All', teacherToken, 'Teacher Stats'));
            results.push(await makeReq('/api/lesson-logs/my-logs', teacherToken, 'Teacher Logs'));
        }

        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
