import Salary from '../models/Salary.js';
import AcademicYear from '../models/AcademicYear.js';

// @desc    Get all salary records
// @route   GET /api/salaries
// @access  Private/Admin
export const getSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find({}).sort({ createdAt: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new salary record
// @route   POST /api/salaries
// @access  Private/Admin
export const createSalary = async (req, res) => {
    try {
        const {
            employeeId,
            employeeName,
            employeeType,
            month,
            year,
            salaryAmount,
            bonus,
            deductions,
            paidAmount,
            paymentDate,
            status,
            academicYear
        } = req.body;

        const salary = await Salary.create({
            employeeId,
            employeeName,
            employeeType,
            month,
            year,
            salaryAmount,
            bonus,
            deductions,
            paidAmount,
            paymentDate,
            status,
            academicYear
        });

        res.status(201).json(salary);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mushaar hore ayaa loo siiyay bishaan' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update salary record
// @route   PUT /api/salaries/:id
// @access  Private/Admin
export const updateSalary = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id);
        if (salary) {
            Object.assign(salary, req.body);
            const updatedSalary = await salary.save();
            res.json(updatedSalary);
        } else {
            res.status(404).json({ message: 'Salary record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete salary record
// @route   DELETE /api/salaries/:id
// @access  Private/Admin
export const deleteSalary = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id);
        if (salary) {
            await salary.deleteOne();
            res.json({ message: 'Salary record removed' });
        } else {
            res.status(404).json({ message: 'Salary record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
