import Expense from '../models/Expense.js';

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (Admin, Cashier)
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({}).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error fetching expenses' });
    }
};

// @desc    Create an expense record
// @route   POST /api/expenses
// @access  Private (Admin, Cashier)
export const createExpense = async (req, res) => {
    try {
        const { title, amount, category, icon, color, date, academicYear } = req.body;

        const expense = await Expense.create({
            title,
            amount: Number(amount),
            category,
            icon: icon || 'Coffee',
            color: color || 'bg-emerald-500',
            date: date || new Date(),
            academicYear
        });

        if (expense) {
            res.status(201).json(expense);
        } else {
            res.status(400).json({ message: 'Invalid expense data' });
        }
    } catch (error) {
        console.error('Error creating expense record:', error);
        res.status(500).json({ message: 'Server error creating expense record' });
    }
};

// @desc    Delete an expense record
// @route   DELETE /api/expenses/:id
// @access  Private (Admin, Cashier)
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (expense) {
            await expense.deleteOne();
            res.json({ message: 'Expense record removed' });
        } else {
            res.status(404).json({ message: 'Expense record not found' });
        }
    } catch (error) {
        console.error('Error deleting expense record:', error);
        res.status(500).json({ message: 'Server error deleting expense record' });
    }
};
