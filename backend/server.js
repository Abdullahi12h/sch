import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import studentRoutes from './routes/student.js';
import gradeRoutes from './routes/grade.js';
import teacherRoutes from './routes/teacher.js';
import teacherAttendanceRoutes from './routes/teacherAttendance.js';
import financeRoutes from './routes/finance.js';
import examTypeRoutes from './routes/examType.js';
import examMarkRoutes from './routes/examMark.js';
import subjectRoutes from './routes/subject.js';
import dashboardRoutes from './routes/dashboard.js';
import attendanceConfigRoutes from './routes/attendanceConfig.js';
import academicYearRoutes from './routes/academicYear.js';
import periodRoutes from './routes/period.js';
import backupRoutes from './routes/backup.js';
import resetRequestRoutes from './routes/resetRequest.js';
import expenseRoutes from './routes/expense.js';
import lessonLogRoutes from './routes/lessonLog.js';
import salaryRoutes from './routes/salaryRoutes.js';
import { bulkToggleStudentResultsLock } from './controllers/studentController.js';
import { protect, adminOnly } from './middleware/authMiddleware.js';


dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/teacher-attendance', teacherAttendanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/exam-types', examTypeRoutes);
app.use('/api/exam-marks', examMarkRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance-config', attendanceConfigRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/reset-requests', resetRequestRoutes);
app.use('/api/lesson-logs', lessonLogRoutes);
app.use('/api/salaries', salaryRoutes);

// Direct test route
app.post('/api/direct-bulk-lock', protect, adminOnly, bulkToggleStudentResultsLock);



app.get('/api/ping', (req, res) => {
    res.json({ message: 'Server is reachable', time: new Date() });
});

app.post('/api/lock-all', protect, adminOnly, (req, res, next) => {
    console.log('--- BULK LOCK REQUEST RECEIVED ---');
    bulkToggleStudentResultsLock(req, res, next);
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
