import ExamType from '../models/ExamType.js';

// @desc    Get all exam types
// @route   GET /api/exam-types
// @access  Private
export const getExamTypes = async (req, res) => {
    try {
        const types = await ExamType.find({});
        res.json(types);
    } catch (error) {
        console.error('Error fetching exam types:', error.stack || error);
        res.status(500).json({ message: error.message || 'Server error fetching exam types' });
    }
};

// @desc    Create an exam type
// @route   POST /api/exam-types
// @access  Private/Admin
export const createExamType = async (req, res) => {
    try {
        const { name, academicYear, passPercentage, weight, totalMarks, isActive } = req.body;
        const examType = await ExamType.create({ name, academicYear, passPercentage, weight, totalMarks, isActive });
        res.status(201).json(examType);
    } catch (error) {
        console.error('Error creating exam type:', error.stack || error);
        res.status(500).json({ message: error.message || 'Server error creating exam type' });
    }
};

export const updateExamType = async (req, res) => {
    try {
        const { name, academicYear, passPercentage, weight, totalMarks, isActive } = req.body;
        const examType = await ExamType.findById(req.params.id);

        if (examType) {
            examType.name = name || examType.name;
            examType.academicYear = academicYear || examType.academicYear;
            examType.passPercentage = passPercentage !== undefined ? passPercentage : examType.passPercentage;
            examType.weight = weight !== undefined ? weight : examType.weight;
            examType.totalMarks = totalMarks !== undefined ? totalMarks : examType.totalMarks;
            examType.isActive = isActive !== undefined ? isActive : examType.isActive;

            const updatedType = await examType.save();
            res.json(updatedType);
        } else {
            res.status(404).json({ message: 'Exam type not found' });
        }
    } catch (error) {
        console.error('Error updating exam type:', error.stack || error);
        res.status(500).json({ message: error.message || 'Server error updating exam type' });
    }
};

// @desc    Delete an exam type
// @route   DELETE /api/exam-types/:id
// @access  Private/Admin
export const deleteExamType = async (req, res) => {
    try {
        const examType = await ExamType.findById(req.params.id);
        if (examType) {
            await ExamType.deleteOne({ _id: req.params.id });
            res.json({ message: 'Exam type removed' });
        } else {
            res.status(404).json({ message: 'Exam type not found' });
        }
    } catch (error) {
        console.error('Error deleting exam type:', error.stack || error);
        res.status(500).json({ message: error.message || 'Server error deleting exam type' });
    }
};

// @desc    Toggle results lock for an exam type (Global Lock)
// @route   PUT /api/exam-types/:id/toggle-lock
// @access  Private/Admin
export const toggleExamTypeResultsLock = async (req, res) => {
    try {
        const examType = await ExamType.findById(req.params.id);
        if (!examType) {
            return res.status(404).json({ message: 'Nooga-dhigidda (Exam Type) lama helin' });
        }

        examType.isResultsLocked = !examType.isResultsLocked;
        await examType.save();

        res.json({
            message: `Natiijooyinka ${examType.name} waa la ${examType.isResultsLocked ? 'xiray' : 'furay'} guud ahaan.`,
            isResultsLocked: examType.isResultsLocked
        });
    } catch (error) {
        console.error('Toggle exam type lock error:', error);
        res.status(500).json({ message: 'Khalad ayaa dhacay intii lagu guda jiray xirista natiijada.' });
    }
};
