import TeacherAttendance from '../models/TeacherAttendance.js';
import Teacher from '../models/Teacher.js';
import AttendanceConfig from '../models/AttendanceConfig.js';
import AcademicYear from '../models/AcademicYear.js';

// @desc    Save or update teacher attendance
// @route   POST /api/teacher-attendance
// @access  Private
const saveTeacherAttendance = async (req, res) => {
    try {
        const { attendanceData } = req.body;

        if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: 'Invalid attendance data' });
        }

        const savedRecords = [];

        for (const record of attendanceData) {
            const { teacherId, teacherName, date, academicYear, status, reason } = record;

            // Update if exists, otherwise create
            const attendance = await TeacherAttendance.findOneAndUpdate(
                { teacherId, date, academicYear },
                { teacherName, status, reason },
                { upsert: true, new: true }
            );
            savedRecords.push(attendance);
        }

        res.status(201).json(savedRecords);
    } catch (error) {
        console.error('Save teacher attendance error:', error);
        res.status(500).json({ message: 'Server error saving attendance' });
    }
};

// @desc    Get teacher attendance history
// @route   GET /api/teacher-attendance
// @access  Private
const getTeacherAttendanceHistory = async (req, res) => {
    try {
        const { date, academicYear } = req.query;

        let query = {};
        if (date) {
            query.date = date;
        }
        if (academicYear) {
            query.academicYear = academicYear;
        }

        const attendance = await TeacherAttendance.find(query).sort({ date: -1, teacherName: 1 });
        res.json(attendance);
    } catch (error) {
        console.error('Get teacher attendance history error:', error);
        res.status(500).json({ message: 'Server error fetching history' });
    }
};

// @desc    Get teacher attendance statistics
// @route   GET /api/teacher-attendance/stats
// @access  Private
const getTeacherAttendanceStats = async (req, res) => {
    try {
        const { academicYear, period, date } = req.query;
        const allTeachers = await Teacher.find({ status: 'Active' });
        
        const matchStage = {};
        if (academicYear) matchStage.academicYear = academicYear;

        if (period && period !== 'yearly') {
            const focusDate = date ? new Date(date) : new Date();
            if (period === 'daily') {
                matchStage.date = focusDate.toISOString().split('T')[0];
            } else if (period === 'weekly') {
                const startOfWeek = new Date(focusDate);
                startOfWeek.setDate(focusDate.getDate() - focusDate.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                matchStage.date = { 
                    $gte: startOfWeek.toISOString().split('T')[0], 
                    $lte: endOfWeek.toISOString().split('T')[0] 
                };
            } else if (period === 'monthly') {
                const startOfMonth = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
                const endOfMonth = new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 0);
                matchStage.date = { 
                    $gte: startOfMonth.toISOString().split('T')[0], 
                    $lte: endOfMonth.toISOString().split('T')[0] 
                };
            }
        }

        const attendanceStats = await TeacherAttendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$teacherId',
                    presentCount: { $sum: { $cond: [{ $eq: ['$status', 'P'] }, 1, 0] } },
                    absentCount: { $sum: { $cond: [{ $eq: ['$status', 'A'] }, 1, 0] } },
                    lateCount: { $sum: { $cond: [{ $eq: ['$status', 'L'] }, 1, 0] } },
                    totalDays: { $sum: 1 },
                    checkIns: { $push: '$checkIn' },
                    checkOuts: { $push: '$checkOut' },
                    totalMinutesWorked: {
                        $sum: {
                            $cond: [
                                { $and: ['$checkIn', '$checkOut'] },
                                { $divide: [{ $subtract: ['$checkOut', '$checkIn'] }, 1000 * 60] },
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const statsMap = attendanceStats.reduce((acc, curr) => {
            acc[curr._id] = curr;
            return acc;
        }, {});

        const processedStats = allTeachers.map(t => {
            const s = statsMap[t.id] || {
                presentCount: 0,
                absentCount: 0,
                lateCount: 0,
                totalDays: 0,
                checkIns: [],
                checkOuts: [],
                totalMinutesWorked: 0
            };

            const validCheckins = s.checkIns.filter(c => c);
            const validCheckouts = s.checkOuts.filter(c => c);
            let avgCheckIn = null;
            if (validCheckins.length > 0) {
                const totalCheckInMinutes = validCheckins.reduce((acc, c) => {
                    const date = new Date(c);
                    return acc + (date.getHours() * 60 + date.getMinutes());
                }, 0);
                const avgMin = totalCheckInMinutes / validCheckins.length;
                const h = Math.floor(avgMin / 60);
                const m = Math.round(avgMin % 60);
                avgCheckIn = new Date();
                avgCheckIn.setHours(h, m, 0, 0);
            }

            const lastCheckIn = s.checkIns.length > 0 ? s.checkIns[s.checkIns.length - 1] : null;
            const lastCheckOut = s.checkOuts.length > 0 ? s.checkOuts[s.checkOuts.length - 1] : null;
            
            // Calculate LIVE duration if checked in but not yet out
            let liveMinutes = s.totalMinutesWorked;
            if (lastCheckIn && !lastCheckOut) {
                const now = new Date();
                const checkInTime = new Date(lastCheckIn);
                // Only if same day to avoid issues with old records
                if (checkInTime.toDateString() === now.toDateString()) {
                    const diff = (now - checkInTime) / (1000 * 60);
                    liveMinutes += diff;
                }
            }

            // Refine status logic for the LIVE MATRIX
            // If they have a check-in, they are physically present
            let currentStatus = 'A'; // Default to Absent
            if (lastCheckIn) {
                // Determine if they were late based on the record's status from DB or recalculate?
                // For now, if they are here, show 'Present' but we can check if it was 'L' or 'A' in DB
                const dbStatus = s.presentCount > 0 ? 'P' : s.lateCount > 0 ? 'L' : 'A';
                currentStatus = dbStatus === 'A' ? 'P' : dbStatus; // If 'A' in DB (due to policy), still show 'P' in UI because they arrived
            }

            return {
                teacherId: t.id,
                teacherName: t.name,
                subject: t.subject,
                presentCount: s.presentCount,
                absentCount: s.absentCount,
                lateCount: s.lateCount,
                totalDays: s.totalDays,
                avgCheckIn: avgCheckIn,
                checkIn: lastCheckIn ? new Date(lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
                checkOut: lastCheckOut ? new Date(lastCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
                status: currentStatus,
                avgCheckInMinutes: validCheckins.length > 0 ? (validCheckins.reduce((acc, c) => {
                    const d = new Date(c);
                    return acc + (d.getHours() * 60 + d.getMinutes());
                }, 0) / validCheckins.length) : 1440,
                avgCheckOutMinutes: validCheckouts.length > 0 ? (validCheckouts.reduce((acc, c) => {
                    const d = new Date(c);
                    return acc + (d.getHours() * 60 + d.getMinutes());
                }, 0) / validCheckouts.length) : 0,
                consistencyColor: s.lateCount > 3 ? 'text-red-600' : 'text-emerald-600',
                hoursWorked: (() => {
                    const totalMinutes = Math.round(liveMinutes); // Use round to avoid 0m for < 30s
                    const h = Math.floor(totalMinutes / 60);
                    const m = totalMinutes % 60;
                    return h > 0 ? `${h}h ${m}m` : `${m}m`;
                })()
            };
        });

        // For the stats displayed in the frontend cards
        const totalPresent = processedStats.reduce((acc, s) => acc + s.presentCount, 0);
        const totalLate = processedStats.reduce((acc, s) => acc + s.lateCount, 0);
        const totalAbsent = processedStats.reduce((acc, s) => acc + s.absentCount, 0);

        const config = await AttendanceConfig.findOne({ type: 'teacher', isActive: true });
        
        const summary = {
            present: totalPresent,
            late: totalLate,
            absent: totalAbsent,
            total: allTeachers.length,
            stats: processedStats,
            attendanceConfig: config || {
                checkInStart: '06:00',
                startTime: '07:30',
                lateTime: '08:00',
                absentTime: '09:00',
                checkOutLimit: '18:00'
            },
            bestTeacher: processedStats.length > 0 ? [...processedStats].sort((a,b) => b.presentCount - a.presentCount)[0] : null,
            mostLateTeacher: processedStats.length > 0 ? [...processedStats].sort((a,b) => b.lateCount - a.lateCount)[0] : null,
            earlyBird: processedStats.length > 0 ? [...processedStats].filter(s => s.totalDays > 0).sort((a,b) => a.avgCheckInMinutes - b.avgCheckInMinutes)[0] : null,
            consistencyKing: processedStats.length > 0 ? [...processedStats].sort((a,b) => b.presentCount - a.presentCount)[0] : null,
            avgAttendance: processedStats.length > 0 
                ? (processedStats.reduce((acc, s) => acc + (s.totalDays > 0 ? ((s.presentCount + s.lateCount) / s.totalDays) : 0), 0) / processedStats.length * 100).toFixed(1) + '%'
                : '0%'
        };

        res.json(summary);
    } catch (error) {
        console.error('Get teacher attendance stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

const handleExcuse = async (req, res) => {
    try {
        const { id, excuseStatus } = req.body;
        const attendance = await TeacherAttendance.findByIdAndUpdate(id, { excuseStatus }, { new: true });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitExcuse = async (req, res) => {
    try {
        const { teacherId, date, reason, image } = req.body;
        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacherId, date },
            { excuseReason: reason, excuseImage: image, excuseStatus: 'Pending' },
            { upsert: true, new: true }
        );
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clock in a teacher
// @route   POST /api/teacher-attendance/clock-in
// @access  Private
const clockInTeacher = async (req, res) => {
    try {
        let { teacherId, teacherName, academicYear } = req.body;
        
        if (!academicYear || academicYear === 'All') {
            // Find the active academic year if not provided or 'All'
            const activeYear = await AcademicYear.findOne({ status: 'active' }) || await AcademicYear.findOne({ status: 'Active' });
            academicYear = activeYear ? activeYear.name : '2024/25'; // Fallback
        }

        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const totalMin = hour * 60 + minute;

        const date = now.toISOString().split('T')[0];

        // Fetch dynamic config
        const config = await AttendanceConfig.findOne({ type: 'teacher', isActive: true });

        let startMin = 7 * 60 + 30; // Default 07:30
        let lateMin = 8 * 60;       // Default 08:00
        let absentMin = 9 * 60;     // Default 09:00
        let checkInStartMin = 6 * 60; // Default 06:00

        if (config) {
            const [sh, sm] = config.startTime.split(':').map(Number);
            const [lh, lm] = config.lateTime.split(':').map(Number);
            const [ah, am] = config.absentTime.split(':').map(Number);

            startMin = sh * 60 + sm;
            lateMin = lh * 60 + lm;
            absentMin = ah * 60 + am;
            
            if (config.checkInStart) {
                const [cish, cism] = config.checkInStart.split(':').map(Number);
                checkInStartMin = cish * 60 + cism;
            }
        }

        if (totalMin < checkInStartMin) {
            return res.status(400).json({ message: `Check-in starts from ${config?.checkInStart || '06:00'}` });
        }

        let status = 'P'; 
        if (totalMin > absentMin) {
            status = 'A'; 
        } else if (totalMin > lateMin) {
            status = 'L';
        }

        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacherId, date },
            {
                teacherName,
                status,
                academicYear,
                $setOnInsert: { checkIn: now }
            },
            { upsert: true, new: true }
        );

        if (!attendance.checkIn) {
            attendance.checkIn = now;
            await attendance.save();
        }

        res.status(200).json(attendance);
    } catch (error) {
        console.error('Clock in error:', error);
        res.status(500).json({ message: 'Server error during clock in' });
    }
};

// @desc    Clock out a teacher
// @route   POST /api/teacher-attendance/clock-out
// @access  Private
const clockOutTeacher = async (req, res) => {
    try {
        const { teacherId, academicYear } = req.body;
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const totalMin = hour * 60 + minute;
        const date = now.toISOString().split('T')[0];

        const config = await AttendanceConfig.findOne({ type: 'teacher', isActive: true });
        if (config && config.checkOutLimit) {
            const [colh, colm] = config.checkOutLimit.split(':').map(Number);
            const checkOutLimitMin = colh * 60 + colm;
            if (totalMin > checkOutLimitMin) {
                return res.status(400).json({ message: `Check-out limit exceeded (${config.checkOutLimit}). Please contact Admin.` });
            }
        }

        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacherId, date },
            { checkOut: new Date() },
            { new: true }
        );

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found for today' });
        }

        res.status(200).json(attendance);
    } catch (error) {
        console.error('Clock out error:', error);
        res.status(500).json({ message: 'Server error during clock out' });
    }
};

const clearAllTeacherAttendance = async (req, res) => {
    try {
        const result = await TeacherAttendance.deleteMany({});
        res.status(200).json({ message: `Successfully cleared ${result.deletedCount} records.` });
    } catch (error) {
        console.error('Clear attendance error:', error);
        res.status(500).json({ message: 'Server error while clearing data' });
    }
};

export {
    saveTeacherAttendance,
    getTeacherAttendanceHistory,
    getTeacherAttendanceStats,
    clockInTeacher,
    clockOutTeacher,
    submitExcuse,
    handleExcuse,
    clearAllTeacherAttendance
};
