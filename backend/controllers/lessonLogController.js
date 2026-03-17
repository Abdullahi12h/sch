import LessonLog from '../models/LessonLog.js';
import Teacher from '../models/Teacher.js';

// @desc    Create a new lesson log
// @route   POST /api/lesson-logs
// @access  Private (Teacher)
export const createLessonLog = async (req, res) => {
    try {
        const { subject, grade, title, chapter, page, academicYear } = req.body;

        const teacherDoc = await Teacher.findOne({ username: req.user.username });
        if (!teacherDoc) {
            return res.status(404).json({ success: false, message: 'Teacher profile not found' });
        }

        const newLog = await LessonLog.create({
            teacher: teacherDoc._id,
            subject,
            grade,
            title,
            chapter,
            page,
            academicYear,
            date: new Date()
        });

        res.status(201).json({ success: true, data: newLog });
    } catch (error) {
        console.error('Error creating lesson log:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get lesson logs for a specific teacher
// @route   GET /api/lesson-logs/my-logs
// @access  Private (Teacher)
export const getMyLessonLogs = async (req, res) => {
    try {
        const teacherDoc = await Teacher.findOne({ username: req.user.username });
        if (!teacherDoc) {
            return res.status(404).json({ success: false, message: 'Teacher profile not found' });
        }

        const logs = await LessonLog.find({ teacher: teacherDoc._id })
            .populate('grade', 'name')
            .populate('subject', 'name')
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching teacher logs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all active lesson logs for Admin Feed
// @route   GET /api/lesson-logs/feed
// @access  Private (Admin)
export const getAdminFeed = async (req, res) => {
    try {
        const { teacherId } = req.query;
        let query = {};
        if (teacherId && teacherId !== 'null' && teacherId !== 'undefined') {
            query.teacher = teacherId;
        }

        console.log('[API] Admin Feed Query:', JSON.stringify(query));

        const logs = await LessonLog.find(query)
            .populate('teacher', 'name username')
            .populate('grade', 'name')
            .populate('subject', 'name')
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching admin feed:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a lesson log
// @route   PUT /api/lesson-logs/:id
// @access  Private (Admin)
export const updateLessonLog = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedLog = await LessonLog.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!updatedLog) {
            return res.status(404).json({ success: false, message: 'Lesson log not found' });
        }

        res.status(200).json({ success: true, data: updatedLog });
    } catch (error) {
        console.error('Error updating lesson log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a lesson log
// @route   DELETE /api/lesson-logs/:id
// @access  Private (Admin)
export const deleteLessonLog = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLog = await LessonLog.findByIdAndDelete(id);

        if (!deletedLog) {
            return res.status(404).json({ success: false, message: 'Lesson log not found' });
        }

        res.status(200).json({ success: true, message: 'Lesson log deleted successfully' });
    } catch (error) {
        console.error('Error deleting lesson log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
