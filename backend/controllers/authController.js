import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

export const authUser = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection lost or pending. Please check if your IP is whitelisted in MongoDB Atlas and if your internet is working.' 
            });
        }
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide both username and password' });
        }

        // Support lookup by either username or email (some old records use email field)
        const user = await User.findOne({ 
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (user && user.password && (await user.matchPassword(password))) {
            let userData = {
                _id: user._id,
                name: user.name,
                username: user.username || user.email,
                role: user.role,
                token: generateToken(user._id),
            };

            // Enhanced logic to find linked records (using either username or email)
            const searchIdentifier = user.username || user.email;

            if (searchIdentifier) {
                // If student, find student record
                if (user.role === 'student' || user.role === 'parent') {
                    const student = await Student.findOne({
                        $or: [
                            { email: { $regex: new RegExp(`^${searchIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
                            { username: searchIdentifier }
                        ]
                    });
                    if (student) {
                        userData.studentData = student;
                    }
                }

                // If teacher, find teacher record
                if (user.role === 'teacher') {
                    const teacher = await Teacher.findOne({
                        $or: [
                            { username: searchIdentifier },
                            { email: searchIdentifier }
                        ]
                    });
                    if (teacher) {
                        userData.teacherData = teacher;
                    }
                }
            }

            res.json(userData);
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login', 
            error: error.message,
            stack: error.stack
        });
    }
};

export const registerUser = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection lost or pending. Please check if your IP is whitelisted in MongoDB Atlas and if your internet is working.' 
            });
        }
        const { name, username, password, role } = req.body;

        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            username,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            let profileData = {
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
            };

            // If student, find student record
            if (user.role === 'student') {
                const student = await Student.findOne({
                    email: { $regex: new RegExp(`^${user.username}$`, 'i') }
                });
                if (student) {
                    profileData.studentData = student;
                }
            }

            // If teacher, find teacher record
            if (user.role === 'teacher') {
                const teacher = await Teacher.findOne({ username: user.username });
                if (teacher) {
                    profileData.teacherData = teacher;
                }
            }

            res.json(profileData);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

export const updateUserCredentials = async (req, res) => {
    try {
        const { username, newPassword, newUsername, name } = req.body;
        const user = await User.findOne({ username });

        if (user) {
            if (name) user.name = name;
            if (newUsername) user.username = newUsername;
            if (newPassword) user.password = newPassword;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error updating user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

export const bulkDeleteUsers = async (req, res) => {
    try {
        const { usernames } = req.body;
        if (!usernames || !Array.isArray(usernames)) {
            return res.status(400).json({ message: 'Invalid usernames provided' });
        }
        await User.deleteMany({ username: { $in: usernames } });
        res.json({ message: 'Users removed' });
    } catch (error) {
        console.error('Bulk delete users error:', error);
        res.status(500).json({ message: 'Server error deleting users' });
    }
};
