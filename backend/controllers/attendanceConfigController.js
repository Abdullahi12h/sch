import AttendanceConfig from '../models/AttendanceConfig.js';

// @desc    Get attendance config
// @route   GET /api/attendance-config
// @access  Private
export const getConfig = async (req, res) => {
    try {
        const config = await AttendanceConfig.findOne({ type: 'teacher', isActive: true });
        if (!config) {
            return res.json({
                startTime: '07:30',
                lateTime: '08:00',
                absentTime: '09:00',
                checkInStart: '06:00',
                checkOutLimit: '18:00',
                cleaningIn: '07:30',
                cleaningOut: '16:00'
            });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update attendance config
// @route   POST /api/attendance-config
// @access  Private/Admin
export const updateConfig = async (req, res) => {
    try {
        const { startTime, lateTime, absentTime, checkInStart, checkOutLimit, cleaningIn, cleaningOut } = req.body;

        let config = await AttendanceConfig.findOne({ type: 'teacher' });

        if (config) {
            if (startTime) config.startTime = startTime;
            if (lateTime) config.lateTime = lateTime;
            if (absentTime) config.absentTime = absentTime;
            if (checkInStart) config.checkInStart = checkInStart;
            if (checkOutLimit) config.checkOutLimit = checkOutLimit;
            if (cleaningIn) config.cleaningIn = cleaningIn;
            if (cleaningOut) config.cleaningOut = cleaningOut;
            await config.save();
        } else {
            config = await AttendanceConfig.create({
                type: 'teacher',
                startTime: startTime || '07:30',
                lateTime: lateTime || '08:00',
                absentTime: absentTime || '09:00',
                checkInStart: checkInStart || '06:00',
                checkOutLimit: checkOutLimit || '18:00',
                cleaningIn: cleaningIn || '07:30',
                cleaningOut: cleaningOut || '16:00'
            });
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
