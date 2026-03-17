import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Toggle results lock for a student
// @route   PUT /api/students/:id/toggle-lock
// @access  Private/Admin
export const toggleStudentResultsLock = async (req, res) => {
    try {
        const student = await Student.findOne({ id: req.params.id });
        if (!student) {
            return res.status(404).json({ message: 'Ardayga lama helin' });
        }

        student.isResultsLocked = !student.isResultsLocked;
        await student.save();

        res.json({
            message: `Natiijooyinka ardayga ${student.name} waa la ${student.isResultsLocked ? 'xiray' : 'furay'}.`,
            isResultsLocked: student.isResultsLocked
        });
    } catch (error) {
        console.error('Toggle student lock error:', error);
        res.status(500).json({ message: 'Khalad ayaa dhacay intii lagu guda jiray xirista natiijada.' });
    }
};

// @desc    Bulk toggle results lock for students
// @route   PUT /api/students/bulk/toggle-lock
// @access  Private/Admin
export const bulkToggleStudentResultsLock = async (req, res) => {
    try {
        const { grade, isLocked } = req.body;

        console.log('Bulk toggle lock request:', { grade, isLocked });

        const filter = grade ? { grade } : {};
        const update = { $set: { isResultsLocked: isLocked } };

        const result = await Student.updateMany(filter, update);

        const count = result.modifiedCount !== undefined ? result.modifiedCount : (result.nModified || 0);

        res.json({
            message: `Guul! Waxaa la ${isLocked ? 'xiray' : 'furay'} natiijooyinka ${count} arday${grade ? ` ee dhigta ${grade}` : ''}.`,
            modifiedCount: count
        });
    } catch (error) {
        console.error('Bulk toggle student lock error:', error);
        res.status(500).json({
            message: 'Khalad ayaa dhacay intii lagu guda jiray bulk lock-ga.',
            error: error.message
        });
    }
};



// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
export const getStudents = async (req, res) => {
    try {
        let { grade, status } = req.query;
        const filter = {};
        
        console.log('--- STUDENT FETCH START ---');
        console.log('Query:', req.query);

        // Grade Filter: Must be explicit. 'All' means no grade filter.
        if (grade && typeof grade === 'string' && grade.toLowerCase() !== 'all') {
            const cleanGrade = grade.trim();
            if (cleanGrade) {
                // Exact case-insensitive match for grade name
                filter.grade = { $regex: new RegExp(`^${cleanGrade.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
            }
        }
        
        // Status Filter: Default to official students if not specified
        if (status === 'Enrolled' || !status) {
            filter.status = { $in: ['Enrolled', 'Active'] };
        } else if (status && status !== 'All') {
            filter.status = status;
        }

        console.log('Final Filter Object:', filter);
        const students = await Student.find(filter).sort({ name: 1 });
        console.log(`Found ${students.length} students`);
        
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error fetching students' });
    }
};

// @desc    Add a student
// @route   POST /api/students
// @access  Private/Admin
export const addStudent = async (req, res) => {
    try {
        const { username, password, ...studentData } = req.body;

        // Create the student record
        const student = await Student.create({ ...studentData, username });

        // If password is provided, create a user account
        if (username && password) {
            await User.create({
                name: studentData.name,
                username,
                password,
                role: 'student'
            });
        }

        res.status(201).json(student);
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ message: error.message || 'Server error adding student' });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private/Admin
export const updateStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            message: 'Server error updating student',
            error: error.message
        });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ id: req.params.id });
        if (student) {
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ message: 'Server error deleting student' });
    }
};
// @desc    Generate credentials for all students without a login
// @route   POST /api/students/generate-credentials
// @access  Private/Admin
export const generateStudentCredentials = async (req, res) => {
    try {
        // Attempt to drop old email index if it exists (one-time fix for many-to-one migration issues)
        try {
            await User.collection.dropIndex('email_1');
        } catch (e) { /* ignore if doesn't exist */ }

        const students = await Student.find({});
        let createdCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const student of students) {
            try {
                let targetUsername = student.username;

                // Generate username if missing
                if (!targetUsername) {
                    // Combine ID with @gmail.com to create a readable email-like username
                    const studentId = student.id || Math.floor(Math.random() * 100000);
                    targetUsername = `student${studentId}@gmail.com`.toLowerCase();

                    // Update student record
                    await Student.findByIdAndUpdate(student._id, { username: targetUsername, email: targetUsername }, { runValidators: false });
                }

                // check if user login already exists
                const userExists = await User.findOne({ username: targetUsername });

                if (!userExists) {
                    const password = 'student123';
                    await User.create({
                        name: student.name,
                        username: targetUsername,
                        password: password,
                        rawPassword: password,
                        role: 'student'
                    });
                    createdCount++;
                } else {
                    skipCount++;
                }
            } catch (innerError) {
                console.error(`Error for student ${student.name}:`, innerError);
                errorCount++;
            }
        }

        res.json({
            message: `Guul! Waxaan u abuuray ${createdCount} arday Login-kooda. (Booday: ${skipCount}, Khalad: ${errorCount})`,
            count: createdCount
        });
    } catch (error) {
        console.error('Generate credentials error:', error);
        res.status(500).json({ message: 'Khalad ayaa dhacay intii lagu guda jiray diyaarinta Login-ka.' });
    }
};

// @desc    Clear all student credentials
// @route   POST /api/students/clear-credentials
// @access  Private/Admin
export const clearStudentCredentials = async (req, res) => {
    try {
        const result = await User.deleteMany({ role: 'student' });

        // Also clear usernames from Students to allow fresh generation
        await Student.updateMany({}, { $unset: { username: "" } });

        res.json({ message: `Guul! Waxaa la tirtiray ${result.deletedCount} login-ka ardayda.` });
    } catch (error) {
        console.error('Clear credentials error:', error);
        res.status(500).json({ message: 'Khalad ayaa dhacay intii la tirtirayay login-ka ardayda.' });
    }
};

// @desc    Import multiple students
// @route   POST /api/students/import
// @access  Private/Admin
export const importStudents = async (req, res) => {
    try {
        const students = req.body;
        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ message: 'No valid data provided for import.' });
        }

        let importedCount = 0;
        let errors = [];

        for (const [index, studentData] of students.entries()) {
            try {
                // Ensure unique ID if not provided, fallback to timestamp + index
                const newId = studentData.id || Date.now() + index;

                // Set default dates if missing
                const dob = studentData.dob || '2010-01-01';

                // Mapping typical CSV fields to Model
                const payload = {
                    id: newId,
                    name: studentData['Applicant Name'] || studentData.name,
                    grade: studentData['Grade'] || studentData.grade || 'Grade 7',
                    gender: studentData['Gender'] || studentData.gender || 'Male',
                    shift: studentData['Shift'] || studentData.shift || 'Morning',
                    parent: studentData['Parent/Guardian'] || studentData.parent || 'Unknown',
                    phone: studentData['Phone'] || studentData.phone || '',
                    status: studentData['Status'] || studentData.status || 'Enrolled',
                    dob: dob,
                    username: studentData.username || studentData.email || `student${newId}@gmail.com`,
                    email: studentData.email || studentData.username || `student${newId}@gmail.com`,
                    tuitionFee: studentData['Tuition Fee'] || studentData.tuitionFee || 0
                };

                // Validate required
                if (!payload.name) {
                    errors.push(`Row ${index + 1}: Name is required`);
                    continue;
                }

                const student = await Student.create(payload);

                // Generate User Account if Username/Email and Password exists in CSV
                if (payload.username && studentData.password) {
                    await User.create({
                        name: payload.name,
                        username: payload.username,
                        password: studentData.password,
                        role: 'student'
                    });
                }

                importedCount++;
            } catch (err) {
                errors.push(`Row ${index + 1} (${studentData.name || 'Unknown'}): ${err.message}`);
            }
        }

        res.status(200).json({
            message: `Guul! Waxaa la soo dhoofiyay ${importedCount} arday.`,
            importedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import students error:', error);
        res.status(500).json({ message: 'Server error during import.' });
    }
};
