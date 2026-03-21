import TeacherAttendance from '../models/TeacherAttendance.js';
import Teacher from '../models/Teacher.js';
import AttendanceConfig from '../models/AttendanceConfig.js';
import AcademicYear from '../models/AcademicYear.js';

const getTeacherAttendanceHistory = async (req, res) => {
    try {
        const attendance = await TeacherAttendance.find({}).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history: ' + error.message });
    }
};

const getTeacherAttendanceStats = async (req, res) => {
    try {
        const { academicYear, period = 'daily', date } = req.query;
        const allTeachers = await Teacher.find({ status: 'Active' });
        
        let query = {};
        if (academicYear && academicYear !== 'All') query.academicYear = academicYear;
        
        if (period === 'daily' && date) {
            query.date = date;
            const records = await TeacherAttendance.find(query);
            
            // Map records to a format the dashboard expects
            const formattedStats = records.map(r => ({
                teacherId: r.teacherId,
                teacherName: r.teacherName,
                checkIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                hoursWorked: r.totalWork || '-',
                status: r.status
            }));

            const present = records.filter(r => r.status === 'P').length;
            const late = records.filter(r => r.status === 'L').length;
            const absent = allTeachers.length - present - late;

            return res.json({ 
                stats: formattedStats, 
                teachers: allTeachers,
                present,
                late,
                absent,
                total: allTeachers.length 
            });
        }

        // Default aggregation for other periods
        const attendanceStats = await TeacherAttendance.aggregate([
            { $match: query },
            { $group: {
                _id: '$teacherId',
                presentCount: { $sum: { $cond: [{ $eq: ['$status', 'P'] }, 1, 0] } },
                absentCount: { $sum: { $cond: [{ $eq: ['$status', 'A'] }, 1, 0] } },
                lateCount: { $sum: { $cond: [{ $eq: ['$status', 'L'] }, 1, 0] } },
                totalDays: { $sum: 1 }
            }}
        ]);
        res.json({ stats: attendanceStats, teachers: allTeachers });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats: ' + error.message });
    }
};

const clockInTeacher = async (req, res) => {
    try {
        let { teacherId, teacherName, academicYear } = req.body;
        if (!academicYear || academicYear === 'All') {
            const activeYear = await AcademicYear.findOne({ status: 'active' });
            academicYear = activeYear ? activeYear.name : '2024/25';
        }

        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const config = await AttendanceConfig.findOne({ type: 'teacher', isActive: true });
        
        const isHR = req.user?.role === 'hr';
        let referenceInMin = 7 * 60 + 30; // 07:30 default
        let lateMin = 8 * 60, absentMin = 9 * 60, checkInStartMin = 6 * 60;
        
        if (config) {
            const baseIn = isHR ? (config.cleaningIn || '07:30') : config.startTime;
            const [bh, bm] = baseIn.split(':').map(Number);
            referenceInMin = bh * 60 + bm;

            const [lh, lm] = config.lateTime.split(':').map(Number);
            const [ah, am] = config.absentTime.split(':').map(Number);
            lateMin = lh * 60 + lm;
            absentMin = ah * 60 + am;
            
            if (config.checkInStart) {
                const [cish, cism] = config.checkInStart.split(':').map(Number);
                checkInStartMin = cish * 60 + cism;
            }
        }

        const hour = now.getHours(), min = now.getMinutes(), totalNowMin = hour * 60 + min;
        
        if (totalNowMin < checkInStartMin) {
            return res.status(400).json({ message: `Check-in starts at ${config?.checkInStart || '06:00'}` });
        }

        let status = 'P'; // Default
        if (!isHR) {
            status = totalNowMin > absentMin ? 'A' : (totalNowMin > lateMin ? 'L' : 'P');
        } else {
            // If HR is late relative to their cleaningIn, maybe mark as late?
            // For now, let's keep it 'P' since user only has IN/OUT config.
            status = totalNowMin > (referenceInMin + 30) ? 'L' : 'P';
        }

        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacherId: String(teacherId), date },
            { teacherName, status, academicYear, $setOnInsert: { checkIn: now } },
            { upsert: true, new: true }
        );

        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Clock-in server error: ' + error.message });
    }
};

const clockOutTeacher = async (req, res) => {
    try {
        const { teacherId, academicYear } = req.body;
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        
        const attendance = await TeacherAttendance.findOne({ teacherId: String(teacherId), date });
        if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today.' });

        const checkIn = new Date(attendance.checkIn);
        const diffMs = now - checkIn;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        attendance.checkOut = now;
        attendance.totalWork = `${diffHrs}h ${diffMins}m`;
        await attendance.save();

        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Clock-out error: ' + error.message });
    }
};

const getMyAttendanceHistory = async (req, res) => {
    try {
        const { academicYear } = req.query;
        const teacherId = req.user.teacherData?.id || req.user.id || req.user._id;
        let query = { teacherId: String(teacherId) };
        if (academicYear && academicYear !== 'All') query.academicYear = academicYear;
        const attendance = await TeacherAttendance.find(query).sort({ date: -1 });
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching personal history: ' + error.message });
    }
};

export {
    getTeacherAttendanceHistory,
    getTeacherAttendanceStats,
    clockInTeacher,
    clockOutTeacher,
    getMyAttendanceHistory
};
