import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// @desc    Add bulk attendance
// @route   POST /api/attendance/bulk
// @access  Private/Admin
export const addBulkAttendance = async (req, res) => {
    try {
        const { attendanceData } = req.body;

        if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: 'No attendance data provided' });
        }

        // Use bulkWrite for efficiency and handling potential duplicate keys gracefully
        const operations = attendanceData.map(item => ({
            updateOne: {
                filter: { studentId: item.studentId, date: item.date, period: item.period, academicYear: item.academicYear },
                update: { $set: item },
                upsert: true
            }
        }));

        const result = await Attendance.bulkWrite(operations);

        // Update student absences if the status is 'A' (Absent)
        for (const item of attendanceData) {
            if (item.status === 'A') {
                await Student.findOneAndUpdate(
                    { id: item.studentId },
                    { $inc: { absences: 1 } }
                );
            }
        }

        res.status(201).json({ message: 'Attendance added successfully', result });
    } catch (error) {
        console.error('Attendance error:', error);
        res.status(500).json({ message: 'Server error adding attendance' });
    }
};

// @desc    Get attendance by class, date, period OR student history
// @route   GET /api/attendance
// @access  Private/Admin
export const getAttendance = async (req, res) => {
    try {
        const { grade, date, period, studentId, academicYear } = req.query;

        const query = {};
        if (grade) query.grade = grade;
        if (date) query.date = date;
        if (period) query.period = period;
        if (studentId) query.studentId = studentId;
        if (academicYear) query.academicYear = academicYear;

        const attendance = await Attendance.find(query).sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Server error fetching attendance' });
    }
};

// @desc    Get student absences report
// @route   GET /api/attendance/absents/:grade
// @access  Private/Admin
export const getStudentAbsents = async (req, res) => {
    try {
        const { grade } = req.params;
        const { academicYear } = req.query;

        // Find all students in this grade
        const students = await Student.find({ grade });

        // Calculate absences for each student from Attendance records for the specific year
        const reports = await Promise.all(students.map(async (student) => {
            const query = { studentId: student.id, status: 'A' };
            if (academicYear) query.academicYear = academicYear;

            const absenceCount = await Attendance.countDocuments(query);
            
            return {
                id: student.id,
                name: student.name,
                phone: student.phone,
                grade: student.grade,
                absences: absenceCount
            };
        }));

        // Only return students with at least 1 absence
        const filteredReports = reports.filter(r => r.absences > 0);

        res.json(filteredReports);
    } catch (error) {
        console.error('Get absents error:', error);
        res.status(500).json({ message: 'Server error fetching absents report' });
    }
};

// @desc    Get students who have NOT had attendance taken for a given class/date/period
// @route   GET /api/attendance/not-taken/:grade
// @access  Private
export const getStudentsNotTaken = async (req, res) => {
    try {
        const { grade } = req.params;
        const { date, period, academicYear } = req.query;

        // All students in the grade
        const allStudents = await Student.find({ grade });

        // Build filter
        const filter = { grade };
        if (date) filter.date = date;
        if (period) filter.period = period;
        if (academicYear) filter.academicYear = academicYear;

        // Find studentIds that already have a record
        const taken = await Attendance.find(filter).select('studentId');
        const takenIds = new Set(taken.map(a => String(a.studentId)));

        // Return students whose id is NOT in taken set
        const notTaken = allStudents.filter(s => !takenIds.has(String(s.id)));

        res.json(notTaken);
    } catch (error) {
        console.error('Get not-taken error:', error);
        res.status(500).json({ message: 'Server error fetching not-taken students' });
    }
};
