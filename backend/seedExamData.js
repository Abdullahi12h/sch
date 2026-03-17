/**
 * Seed Script: Sample Exam Data
 * Creates 20 students (Form 1, Form 2, Form 4) + Final exam marks
 * Run: node seedExamData.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import ExamType from './models/ExamType.js';
import Subject from './models/Subject.js';
import ExamMark from './models/ExamMark.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_portal';

// ── Sample Students (20 total: 7 form one, 7 form two, 6 form four) ──────────────
const sampleStudents = [
    // form one  (7 students)
    { id: 10001, name: 'Caasha Maxamed Cali', grade: 'form one', gender: 'Female', shift: 'Morning', parent: 'Maxamed Cali', phone: '0611000001', dob: '2013-04-10', status: 'Active' },
    { id: 10002, name: 'Axmed Cumar Yare', grade: 'form one', gender: 'Male', shift: 'Morning', parent: 'Cumar Yare', phone: '0611000002', dob: '2013-07-22', status: 'Active' },
    { id: 10003, name: 'Faadumo Xasan Qorane', grade: 'form one', gender: 'Female', shift: 'Afternoon', parent: 'Xasan Qorane', phone: '0611000003', dob: '2013-02-15', status: 'Active' },
    { id: 10004, name: 'Cabdi Warsame Jirde', grade: 'form one', gender: 'Male', shift: 'Morning', parent: 'Warsame Jirde', phone: '0611000004', dob: '2013-11-08', status: 'Active' },
    { id: 10005, name: 'Hodan Abukar Farah', grade: 'form one', gender: 'Female', shift: 'Afternoon', parent: 'Abukar Farah', phone: '0611000005', dob: '2014-01-30', status: 'Active' },
    { id: 10006, name: 'Guuleed Nuur Samatar', grade: 'form one', gender: 'Male', shift: 'Morning', parent: 'Nuur Samatar', phone: '0611000006', dob: '2013-09-05', status: 'Active' },
    { id: 10007, name: 'Shamso Ibraahim Dhegey', grade: 'form one', gender: 'Female', shift: 'Afternoon', parent: 'Ibraahim Dhegey', phone: '0611000007', dob: '2013-06-18', status: 'Active' },

    // form two  (7 students)
    { id: 10008, name: 'Saciid Farax Duale', grade: 'form two', gender: 'Male', shift: 'Morning', parent: 'Farax Duale', phone: '0612000001', dob: '2012-03-14', status: 'Active' },
    { id: 10009, name: 'Ladan Cali Warsame', grade: 'form two', gender: 'Female', shift: 'Morning', parent: 'Cali Warsame', phone: '0612000002', dob: '2012-08-26', status: 'Active' },
    { id: 10010, name: 'Bashir Maxamed Sheekh', grade: 'form two', gender: 'Male', shift: 'Afternoon', parent: 'Maxamed Sheekh', phone: '0612000003', dob: '2012-05-11', status: 'Active' },
    { id: 10011, name: 'Fareeyo Axmed Jama', grade: 'form two', gender: 'Female', shift: 'Morning', parent: 'Axmed Jama', phone: '0612000004', dob: '2012-12-01', status: 'Active' },
    { id: 10012, name: 'Mustafe Xuseen Bare', grade: 'form two', gender: 'Male', shift: 'Afternoon', parent: 'Xuseen Bare', phone: '0612000005', dob: '2012-10-19', status: 'Active' },
    { id: 10013, name: 'Nadifo Cusmaan Gedi', grade: 'form two', gender: 'Female', shift: 'Morning', parent: 'Cusmaan Gedi', phone: '0612000006', dob: '2012-04-07', status: 'Active' },
    { id: 10014, name: 'Liibaan Cabdullaahi Nuur', grade: 'form two', gender: 'Male', shift: 'Afternoon', parent: 'Cabdullaahi Nuur', phone: '0612000007', dob: '2012-07-23', status: 'Active' },

    // form four  (6 students)
    { id: 10015, name: 'Warsan Siciid Muuse', grade: 'form four', gender: 'Female', shift: 'Morning', parent: 'Siciid Muuse', phone: '0614000001', dob: '2010-02-28', status: 'Active' },
    { id: 10016, name: 'Deeqa Ibraahim Cole', grade: 'form four', gender: 'Female', shift: 'Morning', parent: 'Ibraahim Cole', phone: '0614000002', dob: '2010-06-14', status: 'Active' },
    { id: 10017, name: 'Cabdirashiid Maxamed Idle', grade: 'form four', gender: 'Male', shift: 'Afternoon', parent: 'Maxamed Idle', phone: '0614000003', dob: '2010-09-30', status: 'Active' },
    { id: 10018, name: 'Hindiyo Omar Hassan', grade: 'form four', gender: 'Female', shift: 'Afternoon', parent: 'Omar Hassan', phone: '0614000004', dob: '2010-11-05', status: 'Active' },
    { id: 10019, name: 'Faysal Nuur Gaas', grade: 'form four', gender: 'Male', shift: 'Morning', parent: 'Nuur Gaas', phone: '0614000005', dob: '2010-03-17', status: 'Active' },
    { id: 10020, name: 'Subayr Cumar Dirie', grade: 'form four', gender: 'Male', shift: 'Afternoon', parent: 'Cumar Dirie', phone: '0614000006', dob: '2010-08-09', status: 'Active' },
];

// Subjects (will be created if they don't exist)
const subjectNames = ['Xisaab', 'Af-Soomaali', 'Sayniska', 'Taariikhda', 'Juqraafiyada', 'Af-Ingiriis'];

// Helper: random int between min and max
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    // ── 1. Upsert a "Final" ExamType ──────────────────────────────────────────
    let examType = await ExamType.findOne({ name: 'Final' });
    if (!examType) {
        examType = await ExamType.create({
            name: 'Final',
            academicYear: '2024-2025',
            passPercentage: 50,
            isActive: true
        });
        console.log('✅ Created ExamType: Final');
    } else {
        console.log('ℹ️  ExamType "Final" already exists, reusing it.');
    }

    // ── 2. Upsert Subjects ────────────────────────────────────────────────────
    const subjectDocs = [];
    for (const subName of subjectNames) {
        let sub = await Subject.findOne({ name: subName });
        if (!sub) {
            sub = await Subject.create({ name: subName, status: 'Active' });
            console.log(`✅ Created Subject: ${subName}`);
        }
        subjectDocs.push(sub);
    }

    // ── 3. Upsert Students ────────────────────────────────────────────────────
    const studentDocs = [];
    for (const s of sampleStudents) {
        let student = await Student.findOne({ id: s.id });
        if (!student) {
            student = await Student.create(s);
            console.log(`✅ Created Student: ${s.name} (${s.grade})`);
        } else {
            console.log(`ℹ️  Student ${s.name} already exists, reusing.`);
        }
        studentDocs.push(student);
    }

    // ── 4. Generate ExamMarks ─────────────────────────────────────────────────
    let created = 0;
    let updated = 0;

    // Each student gets marks for all subjects under "Final"
    for (const student of studentDocs) {
        // Pick 3 subjects per student (to keep data varied and readable)
        const shuffled = [...subjectDocs].sort(() => 0.5 - Math.random()).slice(0, 3);

        for (const subject of shuffled) {
            // Generate realistic scores (some fail so data is interesting)
            const examScore = rand(30, 80);   // out of 80
            const activityScore = rand(5, 20);    // out of 20
            const totalScore = examScore + activityScore;
            const isPassed = totalScore >= examType.passPercentage;

            // Determine period based on grade
            const period =
                student.grade === 'form one' ? 'Period 1' :
                    student.grade === 'form two' ? 'Period 2' : 'Period 3';

            const existing = await ExamMark.findOne({
                studentId: student._id,
                subjectId: subject._id,
                examTypeId: examType._id
            });

            if (existing) {
                existing.examScore = examScore;
                existing.activityScore = activityScore;
                existing.totalScore = totalScore;
                existing.isPassed = isPassed;
                existing.grade = student.grade;
                existing.period = period;
                await existing.save();
                updated++;
            } else {
                await ExamMark.create({
                    studentId: student._id,
                    studentName: student.name,
                    subjectId: subject._id,
                    subjectName: subject.name,
                    examTypeId: examType._id,
                    examScore,
                    activityScore,
                    totalScore,
                    isPassed,
                    grade: student.grade,
                    period
                });
                created++;
            }
        }
    }

    console.log(`\n🎉 DONE!`);
    console.log(`   📚 Students   : ${studentDocs.length}`);
    console.log(`   📝 Marks New  : ${created}`);
    console.log(`   🔄 Marks Updated: ${updated}`);
    console.log(`   📋 ExamType   : Final (2024-2025)`);
    console.log(`   🏫 Grades     : Form 1, Form 2, Form 4`);
    console.log(`   📖 Subjects   : ${subjectNames.join(', ')}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB.');
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
