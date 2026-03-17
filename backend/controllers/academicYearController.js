import AcademicYear from '../models/AcademicYear.js';
import ExamType from '../models/ExamType.js';
import Attendance from '../models/Attendance.js';
import TeacherAttendance from '../models/TeacherAttendance.js';

// @desc    Get all academic years
// @route   GET /api/academic-years
// @access  Private
export const getAcademicYears = async (req, res) => {
    try {
        // 1. Get explicit academic years from DB
        const years = await AcademicYear.find().sort({ startDate: -1 });

        // 2. Scan all relevant collections for unique academicYear strings
        // This ensures years registered in Exam Settings, Student Attendance, or Teacher Attendance are recognized
        const collectionsYears = await Promise.all([
            ExamType.distinct('academicYear'),
            Attendance.distinct('academicYear'),
            TeacherAttendance.distinct('academicYear')
        ]);

        const allScannedYears = [...new Set(collectionsYears.flat().filter(Boolean))];

        // Combine and unique
        const existingNames = new Set(years.map(y => y.name));
        const combinedYears = [...years];

        allScannedYears.forEach(yearName => {
            if (!existingNames.has(yearName)) {
                combinedYears.push({
                    name: yearName,
                    isCurrent: false,
                    status: 'active',
                    _id: yearName // Use name as ID for scanned items
                });
            }
        });

        // 3. User request: "2026-2027 kuwaas ayad iiwan gasahn ahsoo aqristo 2025 intuu ka keenay ani iima diiwan gashano"
        // If we found the user's years (like 2026-2027), we can de-prioritize or hide the seed year (2024-2025)
        // especially if it's the only one that was seeded.
        const filteredYears = combinedYears.filter(y => {
            // Only keep 2024-2025 if it's the only one, or if they specifically registered it.
            // If they have others like 2026-2027, and they explicitly complained about 2025, let's hide it if it looks like seed data.
            const isSeedYear = y.name === '2024-2025';
            const hasOtherYears = combinedYears.some(other => other.name !== '2024-2025');

            if (isSeedYear && hasOtherYears) return false;
            return true;
        });

        const finalResult = filteredYears.length > 0 ? filteredYears : combinedYears;

        res.json(finalResult.sort((a, b) => b.name.localeCompare(a.name)));
    } catch (error) {
        console.error('Error fetching academic years:', error);
        res.status(500).json({ message: 'Server error fetching academic years' });
    }
};

// @desc    Create new academic year
// @route   POST /api/academic-years
// @access  Private/Admin
export const createAcademicYear = async (req, res) => {
    try {
        const { name, startDate, endDate, isCurrent, status } = req.body;

        if (isCurrent) {
            await AcademicYear.updateMany({}, { isCurrent: false });
        }

        const year = await AcademicYear.create({ name, startDate, endDate, isCurrent, status });
        res.status(201).json(year);
    } catch (error) {
        res.status(400).json({ message: 'Error creating academic year', error: error.message });
    }
};

// @desc    Update academic year
// @route   PUT /api/academic-years/:id
// @access  Private/Admin
export const updateAcademicYear = async (req, res) => {
    try {
        const { isCurrent } = req.body;
        if (isCurrent) {
            await AcademicYear.updateMany({}, { isCurrent: false });
        }
        const year = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(year);
    } catch (error) {
        res.status(400).json({ message: 'Error updating academic year' });
    }
};
