import mongoose from 'mongoose';
import Grade from './models/Grade.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const updateGradesFee = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal');
        
        // Update all grades to have a default fee if it's 0 or missing
        // For testing, let's set them to different amounts based on name
        const grades = await Grade.find({});
        for (const grade of grades) {
            if (!grade.feeAmount || grade.feeAmount === 0) {
                // Set a default fee like 500
                grade.feeAmount = 500;
                await grade.save();
                console.log(`Updated grade ${grade.name} with fee $500`);
            }
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateGradesFee();
