import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
export const getTeachers = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        
        const teachers = await Teacher.find(query).sort({ name: 1 });
        res.json(teachers);
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ message: 'Server error fetching teachers' });
    }
};

// @desc    Add a teacher
// @route   POST /api/teachers
// @access  Private/Admin
export const addTeacher = async (req, res) => {
    try {
        const { name, username, password, role, ...rest } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this username' });
        }

        // Create Teacher record
        const teacher = await Teacher.create({ name, username, ...rest });

        // Create User account if password is provided
        if (password) {
            await User.create({
                name,
                username,
                password,
                role: 'teacher'
            });
        }

        res.status(201).json(teacher);
    } catch (error) {
        console.error('Add teacher error:', error);
        res.status(500).json({ message: 'Server error adding teacher' });
    }
};

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (teacher) {
            res.json(teacher);
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({ message: 'Server error updating teacher' });
    }
};

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findOneAndDelete({ id: req.params.id });
        if (teacher) {
            res.json({ message: 'Teacher removed' });
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ message: 'Server error deleting teacher' });
    }
};

// @desc    Generate credentials for all teachers without a login
// @route   POST /api/teachers/generate-credentials
// @access  Private/Admin
export const generateTeacherCredentials = async (req, res) => {
    try {
        // Attempt to drop old email index if it exists
        try {
            await User.collection.dropIndex('email_1');
        } catch (e) { /* ignore */ }

        const teachers = await Teacher.find({});
        let createdCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const teacher of teachers) {
            try {
                let targetUsername = teacher.username;

                // Generate username if missing
                if (!targetUsername) {
                    const teacherId = teacher.id || Math.floor(Math.random() * 1000);
                    const suffix = teacher._id.toString().slice(-4);
                    targetUsername = `tch${teacherId}${suffix}`.toLowerCase();
                    await Teacher.findByIdAndUpdate(teacher._id, { username: targetUsername });
                }

                // check if user login already exists
                const userExists = await User.findOne({ username: targetUsername });

                if (!userExists) {
                    const password = 'teacher123';
                    await User.create({
                        name: teacher.name,
                        username: targetUsername,
                        password: password,
                        rawPassword: password,
                        role: 'teacher'
                    });
                    createdCount++;
                } else {
                    skipCount++;
                }
            } catch (innerError) {
                console.error(`Error for teacher ${teacher.name}:`, innerError);
                errorCount++;
            }
        }

        res.json({
            message: `Guul! Waxaan u abuuray ${createdCount} macallin Login-kooda. (Booday: ${skipCount}, Khalad: ${errorCount})`,
            count: createdCount
        });
    } catch (error) {
        console.error('Generate teacher credentials error:', error);
        res.status(500).json({ message: 'Khalad ayaa dhacay xiligii diyaarinta Login-ka macallimiinta.' });
    }
};

// @desc    Clear all teacher credentials
// @route   POST /api/teachers/clear-credentials
// @access  Private/Admin
export const clearTeacherCredentials = async (req, res) => {
    try {
        const result = await User.deleteMany({ role: 'teacher' });

        // Also clear usernames from Teachers to allow fresh generation
        await Teacher.updateMany({}, { $unset: { username: "" } });

        res.json({ message: `Guul! Waxaa la tirtiray ${result.deletedCount} login-ka macallimiinta.` });
    } catch (error) {
        console.error('Clear teacher credentials error:', error);
        res.status(500).json({ message: 'Khalad ayaa dhacay intii la tirtirayay login-ka macallimiinta.' });
    }
};
