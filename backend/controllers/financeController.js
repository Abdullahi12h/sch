import Finance from '../models/Finance.js';
import Student from '../models/Student.js';

// @desc    Get all finance records
// @route   GET /api/finance
// @access  Private (Admin, Cashier)
export const getFinanceRecords = async (req, res) => {
    try {
        const records = await Finance.find({}).sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        console.error('Error fetching finance records:', error);
        res.status(500).json({ message: 'Server error fetching finance records' });
    }
};

// @desc    Create a finance record
// @route   POST /api/finance
// @access  Private (Admin, Cashier)
export const createFinanceRecord = async (req, res) => {
    try {
        const { student, grade, term, amount, paid, status, date, academicYear } = req.body;

        const record = await Finance.create({
            student,
            grade,
            term,
            amount,
            paid,
            status,
            date,
            academicYear
        });

        if (record) {
            res.status(201).json(record);
        } else {
            res.status(400).json({ message: 'Invalid finance data' });
        }
    } catch (error) {
        console.error('Error creating finance record:', error);
        res.status(500).json({ message: 'Server error creating finance record' });
    }
};

// @desc    Update a finance record
// @route   PUT /api/finance/:id
// @access  Private (Admin, Cashier)
export const updateFinanceRecord = async (req, res) => {
    try {
        const { student, grade, term, amount, paid, status, date, academicYear } = req.body;
        const record = await Finance.findById(req.params.id);

        if (record) {
            record.student = student || record.student;
            record.grade = grade || record.grade;
            record.term = term || record.term;
            record.amount = amount !== undefined ? amount : record.amount;
            record.paid = paid !== undefined ? paid : record.paid;
            record.status = status || record.status;
            record.date = date || record.date;
            record.academicYear = academicYear || record.academicYear;

            const updatedRecord = await record.save();
            res.json(updatedRecord);
        } else {
            res.status(404).json({ message: 'Finance record not found' });
        }
    } catch (error) {
        console.error('Error updating finance record:', error);
        res.status(500).json({ message: 'Server error updating finance record' });
    }
};

// @desc    Delete a finance record
// @route   DELETE /api/finance/:id
// @access  Private (Admin, Cashier)
export const deleteFinanceRecord = async (req, res) => {
    try {
        const record = await Finance.findById(req.params.id);

        if (record) {
            await record.deleteOne();
            res.json({ message: 'Finance record removed' });
        } else {
            res.status(404).json({ message: 'Finance record not found' });
        }
    } catch (error) {
        console.error('Error deleting finance record:', error);
        res.status(500).json({ message: 'Server error deleting finance record' });
    }
};

// @desc    Get finance records for a specific student (by username/email)
// @route   GET /api/finance/student/me
// @access  Private (Student)
export const getMyFinanceRecords = async (req, res) => {
    try {
        console.log('Fetching finance records for user:', req.user.username);
        
        // Find student record matching the logged-in user
        const student = await Student.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${req.user.username}$`, 'i') } },
                { name: { $regex: new RegExp(`^${req.user.name}$`, 'i') } }
            ]
        });

        if (!student) {
            console.warn('Student profile not found for:', req.user.username);
            return res.status(404).json({ message: 'Student profile not found' });
        }

        console.log('Found student profile:', student.name);

        // Fetch all finance records matching the student name (case-insensitive)
        const records = await Finance.find({ 
            student: { $regex: new RegExp(`^${student.name.trim()}$`, 'i') } 
        }).sort({ date: -1 });

        console.log(`Found ${records.length} finance records for ${student.name}`);

        // Calculate summary
        const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0);
        const totalPaid   = records.reduce((sum, r) => sum + (r.paid   || 0), 0);
        const balance     = totalAmount - totalPaid;

        let overallStatus = 'Unpaid';
        if (totalAmount > 0 && totalPaid >= totalAmount) overallStatus = 'Paid';
        else if (totalPaid > 0) overallStatus = 'Partial';

        res.json({
            student: student.name,
            grade:   student.grade,
            records,
            summary: {
                totalAmount,
                totalPaid,
                balance,
                status: overallStatus
            }
        });
    } catch (error) {
        console.error('Error fetching student finance records:', error);
        res.status(500).json({ message: 'Server error fetching student finance records' });
    }
};
