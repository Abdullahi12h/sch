import Grade from '../models/Grade.js';

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private/Admin
export const getGrades = async (req, res) => {
    try {
        const grades = await Grade.find({});
        res.json(grades);
    } catch (error) {
        console.error('Get grades error:', error);
        res.status(500).json({ message: 'Server error fetching grades' });
    }
};

// @desc    Get a single grade by ID
// @route   GET /api/grades/:id
// @access  Private/Admin
export const getGradeById = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (grade) {
            res.json(grade);
        } else {
            res.status(404).json({ message: 'Grade not found' });
        }
    } catch (error) {
        console.error('Get grade by ID error:', error);
        res.status(500).json({ message: 'Server error fetching grade' });
    }
};

// @desc    Add a grade
// @route   POST /api/grades
// @access  Private/Admin
export const addGrade = async (req, res) => {
    try {
        const { name, code, capacity, status, subjects, feeAmount, examFeeAmount } = req.body;
        const grade = await Grade.create({ name, code, capacity, status, subjects, feeAmount, examFeeAmount });
        res.status(201).json(grade);
    } catch (error) {
        console.error('Add grade error:', error);
        res.status(500).json({ message: 'Server error adding grade' });
    }
};

// @desc    Update a grade
// @route   PUT /api/grades/:id
// @access  Private/Admin
export const updateGrade = async (req, res) => {
    try {
        const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (grade) {
            res.json(grade);
        } else {
            res.status(404).json({ message: 'Grade not found' });
        }
    } catch (error) {
        console.error('Update grade error:', error);
        res.status(500).json({ message: 'Server error updating grade' });
    }
};

// @desc    Delete a grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin
export const deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findByIdAndDelete(req.params.id);
        if (grade) {
            res.json({ message: 'Grade removed' });
        } else {
            res.status(404).json({ message: 'Grade not found' });
        }
    } catch (error) {
        console.error('Delete grade error:', error);
        res.status(500).json({ message: 'Server error deleting grade' });
    }
};
