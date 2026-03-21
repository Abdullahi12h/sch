import AcademicYear from '../models/AcademicYear.js';
import Attendance from '../models/Attendance.js';
import AttendanceConfig from '../models/AttendanceConfig.js';
import ExamMark from '../models/ExamMark.js';
import ExamType from '../models/ExamType.js';
import Finance from '../models/Finance.js';
import Grade from '../models/Grade.js';
import Period from '../models/Period.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';
import TeacherAttendance from '../models/TeacherAttendance.js';
import User from '../models/User.js';
import LessonLog from '../models/LessonLog.js';

// @desc    Export all data as JSON
// @route   GET /api/backup/export
// @access  Private (Admin)
export const exportData = async (req, res) => {
    try {
        const data = {
            academicYears: await AcademicYear.find(),
            attendances: await Attendance.find(),
            attendanceConfigs: await AttendanceConfig.find(),
            examMarks: await ExamMark.find(),
            examTypes: await ExamType.find(),
            finances: await Finance.find(),
            grades: await Grade.find(),
            periods: await Period.find(),
            students: await Student.find(),
            subjects: await Subject.find(),
            teachers: await Teacher.find(),
            teacherAttendances: await TeacherAttendance.find(),
            users: await User.find(), // Include hashed passwords for full backup
            lessonLogs: await LessonLog.find()
        };

        res.json(data);
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: 'Error exporting data' });
    }
};

// @desc    Import data from JSON
// @route   POST /api/backup/import
// @access  Private (Admin)
export const importData = async (req, res) => {
    try {
        const data = req.body;

        if (!data || typeof data !== 'object') {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const models = {
            academicYears: AcademicYear,
            attendances: Attendance,
            attendanceConfigs: AttendanceConfig,
            examMarks: ExamMark,
            examTypes: ExamType,
            finances: Finance,
            grades: Grade,
            periods: Period,
            students: Student,
            subjects: Subject,
            teachers: Teacher,
            teacherAttendances: TeacherAttendance,
            users: User,
            lessonLogs: LessonLog
        };

        const summary = {};

        for (const [key, Model] of Object.entries(models)) {
            if (data[key] && Array.isArray(data[key])) {
                // Special handling for User to ensure passwords exist
                let dataToInsert = data[key];
                
                if (key === 'users') {
                    dataToInsert = data[key].map(user => ({
                        ...user,
                        password: user.password || 'password123' // Default password for safety
                    }));
                }

                // Skip deletion if the count is zero to avoid total data loss
                if (dataToInsert.length > 0) {
                    await Model.deleteMany({});
                    await Model.insertMany(dataToInsert);
                }
                
                summary[key] = dataToInsert.length;
            }
        }

        res.json({ message: 'Import completed successfully', summary });
    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ message: 'Error importing data: ' + error.message });
    }
};
