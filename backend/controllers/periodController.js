import Period from '../models/Period.js';

// @desc    Get all periods
// @route   GET /api/periods
// @access  Private
export const getPeriods = async (req, res) => {
    try {
        const periods = await Period.find({}).sort({ startTime: 1 });
        res.json(periods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a period
// @route   POST /api/periods
// @access  Private/Admin
export const addPeriod = async (req, res) => {
    try {
        const { name, startTime, endTime, type, isBreak, status } = req.body;
        const period = await Period.create({ name, startTime, endTime, type, isBreak, status });
        res.status(201).json(period);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a period
// @route   PUT /api/periods/:id
// @access  Private/Admin
export const updatePeriod = async (req, res) => {
    try {
        const period = await Period.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (period) {
            res.json(period);
        } else {
            res.status(404).json({ message: 'Period not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a period
// @route   DELETE /api/periods/:id
// @access  Private/Admin
export const deletePeriod = async (req, res) => {
    try {
        const period = await Period.findByIdAndDelete(req.params.id);
        if (period) {
            res.json({ message: 'Period removed' });
        } else {
            res.status(404).json({ message: 'Period not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
