import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: false,
            unique: true,
            sparse: true
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true
        },
        password: {
            type: String,
            required: true,
        },
        rawPassword: {
            type: String,
            default: ''
        },
        role: {
            type: String,
            enum: ['admin', 'teacher', 'student', 'parent', 'cashier'],
            default: 'student'
        },
        salary: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
