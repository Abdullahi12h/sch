import mongoose from 'mongoose';
import ExamMark from '../models/ExamMark.js';
import ExamType from '../models/ExamType.js';
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';

// @desc    Submit marks (Teacher/Admin)
// @route   POST /api/exam-marks
// @access  Private
export const submitMarks = async (req, res) => {
    try {
        const { studentId, studentName, subjectId, subjectName, examTypeId, examScore, activityScore, grade, period } = req.body;

        // Fetch ExamType to get Pass Percentage
        const examType = await ExamType.findById(examTypeId);
        if (!examType) {
            return res.status(404).json({ message: 'Exam type not found' });
        }

        const maxMarks = examType.totalMarks || 100;

        if (Number(activityScore) > 5) {
            return res.status(400).json({ message: 'Dhibcaha Activity-ga ma dhaafi karaan 5!' });
        }

        const totalScore = Number(examScore) + Number(activityScore);
        if (totalScore > maxMarks) {
            return res.status(400).json({ message: `Wadarta guud (Imtixaan + Activity) ma dhaafi karto ${maxMarks}!` });
        }

        const passThreshold = (examType.passPercentage / 100) * maxMarks;
        const isPassed = totalScore >= passThreshold;

        // Fetch Student to ensure current grade is used
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Ardayga lama helin!' });
        }

        // Use student's current grade if not explicitly provided or if we want to enforce it
        const currentGrade = student.grade;

        // Check if mark already exists for this student, subject, and exam type
        let mark = await ExamMark.findOne({ studentId, subjectId, examTypeId });

        if (mark) {
            mark.studentName = studentName || student.name;
            mark.subjectName = subjectName;
            mark.examScore = examScore;
            mark.activityScore = activityScore;
            mark.totalScore = totalScore;
            mark.isPassed = isPassed;
            mark.teacherId = req.user._id;
            mark.grade = currentGrade; // Enforce current grade
            if (period) mark.period = period;

            const updatedMark = await mark.save();
            res.json(updatedMark);
        } else {
            const newMark = await ExamMark.create({
                studentId,
                studentName: studentName || student.name,
                subjectId,
                subjectName,
                examTypeId,
                examScore,
                activityScore,
                totalScore,
                isPassed,
                teacherId: req.user._id,
                grade: currentGrade, // Enforce current grade
                period: period || ''
            });
            res.status(201).json(newMark);
        }
    } catch (error) {
        console.error('Error submitting marks:', error.stack || error);
        res.status(500).json({ message: error.message || 'Server error submitting marks' });
    }
};

// @desc    Get marks (Role-based)
// @route   GET /api/exam-marks
// @access  Private
export const getMarks = async (req, res) => {
    try {
        let query = {};
        const { studentId, subjectId, examTypeId, grade, period, academicYear } = req.query;

        // If student, only show their own marks
        let studentObj = null;
        if (req.user.role === 'student') {
            // Case-insensitive username lookup
            studentObj = await Student.findOne({
                username: { $regex: new RegExp(`^${req.user.username}$`, 'i') }
            });

            if (!studentObj) {
                return res.status(404).json({
                    message: `Lama helin profile-ka ardayga ee ku xiran username-ka: ${req.user.username}. Fadlan la xiriir maamulka.`
                });
            }

            // [NEW] Check if individual student's results are locked
            if (studentObj.isResultsLocked) {
                return res.status(200).json({
                    marks: [],
                    isLocked: true,
                    message: "Natiijooyinkaaga waa la xiray. Fadlan la xiriir xafiiska maaliyadda ama maamulka."
                });
            }

            query.studentId = studentObj._id;
        } else if (studentId) { // For other roles, or if studentId is explicitly queried
            query.studentId = studentId;
        }

        // Use student's own grade or provided grade for ranking
        let effectiveGrade = grade;
        if (!effectiveGrade && studentObj?.grade) {
            // First try to find a Grade document with this name to see if we should use its ID instead
            const matchingGrade = await Grade.findOne({ name: studentObj.grade });
            effectiveGrade = matchingGrade ? matchingGrade._id : studentObj.grade;
        }

        // If grade is provided, filter by students *currently* in that grade
        if (grade) {
            const matchingGradeDoc = await Grade.findOne({
                $or: [
                    { _id: mongoose.Types.ObjectId.isValid(grade) ? grade : null },
                    { name: { $regex: new RegExp(`^${grade}$`, 'i') } }
                ]
            });

            const gradeCriteria = matchingGradeDoc
                ? { $in: [matchingGradeDoc._id, matchingGradeDoc.name] }
                : { $regex: new RegExp(`^${grade}$`, 'i') };

            const studentsInGrade = await Student.find({ grade: gradeCriteria }).select('_id');
            const studentIdsInGrade = studentsInGrade.map(s => s._id);

            query.studentId = { $in: studentIdsInGrade };
            // Also filter by grade field in ExamMark for extra safety/indexing
            query.grade = grade;
        }

        if (subjectId) query.subjectId = subjectId;
        if (examTypeId) query.examTypeId = examTypeId;
        if (period) query.period = period;

        if (academicYear) {
            const typesForYear = await ExamType.find({ academicYear });
            const typeIds = typesForYear.map(t => t._id);

            if (query.examTypeId) {
                // Intersect or validate that selected exam belongs to the selected year
                if (!typeIds.some(id => id.toString() === query.examTypeId)) {
                    return res.json([]); // Mismatch, zero results
                }
            } else {
                query.examTypeId = { $in: typeIds };
            }
        }

        const marks = await ExamMark.find(query)
            .populate('examTypeId', 'name academicYear passPercentage totalMarks weight isResultsLocked')
            .populate('studentId', 'isResultsLocked name email id')
            .populate('subjectId', 'name')
            .sort({ createdAt: -1 });

        // [NEW] Global Lock Filter: If roles is student, filter out any mark whose ExamType is globally locked
        let filteredMarks = marks;
        if (req.user.role === 'student') {
            filteredMarks = marks.filter(m => {
                const examType = m.examTypeId;
                // If populated, check the field. Some marks may not have examTypeId populated if query was specific.
                return !examType || !examType.isResultsLocked;
            });
        }

        // 131: Calculate Ranking - Robustly follows user algorithm: Collect -> Sort (by Total) -> Assign Rank
        let rankInfo = null;
        let rankMap = {};
        let rankByNameMap = {};

        // Detect correct context for ranking (Grade and Year)
        let rankingYear = academicYear;
        if (!rankingYear && filteredMarks.length > 0) {
            rankingYear = filteredMarks[0].examTypeId?.academicYear || filteredMarks[0].examTypeId;
        }

        if (effectiveGrade && rankingYear) {
            try {
                const allYearTypes = await ExamType.find({ academicYear: rankingYear });
                const yearTypes = req.user.role === 'student' ? allYearTypes.filter(t => !t.isResultsLocked) : allYearTypes;
                const yearTypeIds = yearTypes.map(t => t._id);

                // Step 1: Soo hel ardayda fasalka iyo sanadlkan (Find students in the class)
                const gradeStr = effectiveGrade.toString();
                const matchingGradeDoc = await Grade.findOne({
                    $or: [
                        { _id: mongoose.Types.ObjectId.isValid(gradeStr) ? gradeStr : null },
                        { name: { $regex: new RegExp(`^${gradeStr}$`, 'i') } }
                    ]
                });

                const gradeCriteria = matchingGradeDoc
                    ? { $in: [matchingGradeDoc._id, matchingGradeDoc.name] }
                    : { $regex: new RegExp(`^${gradeStr}$`, 'i') };

                const peersInGrade = await Student.find({ grade: gradeCriteria }).select('_id name');
                const peerIds = peersInGrade.map(p => p._id);

                // Soo ururi xogta (Collect marks for these students)
                const allClassMarks = await ExamMark.find({
                    studentId: { $in: peerIds },
                    examTypeId: { $in: yearTypeIds }
                }).populate('examTypeId');

                // Group by student and calculate WADARTA (Total Points)
                const studentStats = allClassMarks.reduce((acc, m) => {
                    const sid = m.studentId.toString();
                    const sname = m.studentName?.toLowerCase().trim() || 'unknown';
                    const subId = m.subjectId?.toString();

                    if (!acc[sid]) {
                        acc[sid] = { total: 0, subjects: new Set(), name: sname };
                    }
                    
                    // Calculate weighted score: (Score / MaxPossible) * Weightage
                    const maxPossible = m.examTypeId?.totalMarks || 100;
                    const weightage = m.examTypeId?.weight || 25;
                    const weightedScore = (m.totalScore / maxPossible) * weightage;
                    
                    acc[sid].total += weightedScore;
                    if (subId) acc[sid].subjects.add(subId);

                    return acc;
                }, {});

                // Step 2 & 3: Kala saar (Sort) by TOTAL and Sii kaalin (Assign Rank)
                const sortedStudents = Object.entries(studentStats)
                    .map(([id, data]) => ({
                        id,
                        total: data.total,
                        average: data.subjects.size > 0 ? data.total / data.subjects.size : 0,
                        name: data.name
                    }))
                    .sort((a, b) => b.total - a.total); // Sorted by TOTAL as requested

                const totalStudentsInGradeCount = peersInGrade.length;

                let currentRank = 0;
                let lastTotal = -1;
                sortedStudents.forEach((s, index) => {
                    // Tie-handling based on Total Score
                    if (s.total !== lastTotal) {
                        currentRank = index + 1;
                    }
                    lastTotal = s.total;

                    const info = {
                        rank: currentRank,
                        totalScore: s.total,
                        average: s.average,
                        totalStudents: Math.max(totalStudentsInGradeCount, sortedStudents.length)
                    };
                    rankMap[s.id] = info;
                    if (s.name && s.name !== 'unknown') {
                        rankByNameMap[s.name] = info;
                    }
                });

                // Find rankInfo for the targeted student/context
                let currentSid = (studentObj ? studentObj._id : (query.studentId || '')).toString();
                if (!currentSid && filteredMarks.length > 0) currentSid = filteredMarks[0].studentId.toString();

                if (currentSid && rankMap[currentSid]) {
                    rankInfo = rankMap[currentSid];
                } else if (filteredMarks.length > 0) {
                    // Fallback to name if ID mapping fails
                    const nameKey = filteredMarks[0].studentName?.toLowerCase().trim();
                    if (nameKey && rankByNameMap[nameKey]) {
                        rankInfo = rankByNameMap[nameKey];
                    }
                }
            } catch (err) {
                console.error('Ranking algorithm error:', err);
            }
        }

        // Final fallback for header stats if no class ranking was possible
        if (!rankInfo && filteredMarks.length > 0) {
            const tempTotal = filteredMarks.reduce((acc, m) => acc + m.totalScore, 0);
            rankInfo = {
                rank: '-',
                totalScore: tempTotal,
                totalStudents: '-'
            };
        }

        res.json({
            marks: filteredMarks,
            rankInfo,
            rankMap,
            rankByNameMap,
            studentData: req.user.role === 'student' ? studentObj : null
        });
    } catch (error) {
        console.error('Error fetching marks:', error.stack || error);
        res.status(500).json({ message: error.message || 'Server error fetching marks' });
    }
};

// @desc    Delete a mark
// @route   DELETE /api/exam-marks/:id
// @access  Private/Admin
export const deleteMark = async (req, res) => {
    try {
        const mark = await ExamMark.findById(req.params.id);
        if (mark) {
            await mark.deleteOne();
            res.json({ message: 'Mark removed' });
        } else {
            res.status(404).json({ message: 'Mark not found' });
        }
    } catch (error) {
        console.error('Error deleting mark:', error.stack || error);
        res.status(500).json({ message: error.message || 'Server error deleting mark' });
    }
};
