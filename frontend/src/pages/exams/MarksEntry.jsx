import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Search, User, BookOpen, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MarksEntry = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({}); // { studentId: { examScore, activityScore } }
    const [loading, setLoading] = useState(false);
    const [selection, setSelection] = useState({ grade: '', subject: '', examType: '' });
    const [availableGrades, setAvailableGrades] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [gRes, sRes, tRes] = await Promise.all([
                    axios.get('/api/grades', config),
                    axios.get('/api/subjects', config),
                    axios.get('/api/exam-types', config)
                ]);

                let currentGrades = gRes.data;
                let currentSubjects = sRes.data;
                if (user?.role === 'teacher') {
                    const teacherProfile = user.teacherData;
                    if (teacherProfile) {
                        if (teacherProfile.assignedClasses) {
                            const assignedNames = teacherProfile.assignedClasses.split(',').map(s => s.trim().toLowerCase());
                            currentGrades = gRes.data.filter(g => assignedNames.includes(g.name.trim().toLowerCase()));
                        }
                        if (teacherProfile.subject) {
                            const assignedSubjectNames = teacherProfile.subject.split(',').map(s => s.trim().toLowerCase());
                            currentSubjects = sRes.data.filter(sub => assignedSubjectNames.includes(sub.name.trim().toLowerCase()));
                        }
                    } else {
                        // Fallback to fetch if data not in session
                        const { data: teachers } = await axios.get('/api/teachers', config);
                        const foundTeacher = teachers.find(t => t.username === user.username);
                        if (foundTeacher) {
                            if (foundTeacher.assignedClasses) {
                                const assignedNames = foundTeacher.assignedClasses.split(',').map(s => s.trim().toLowerCase());
                                currentGrades = gRes.data.filter(g => assignedNames.includes(g.name.trim().toLowerCase()));
                            }
                            if (foundTeacher.subject) {
                                const assignedSubjectNames = foundTeacher.subject.split(',').map(s => s.trim().toLowerCase());
                                currentSubjects = sRes.data.filter(sub => assignedSubjectNames.includes(sub.name.trim().toLowerCase()));
                            }
                        }
                    }
                }

                setGrades(gRes.data);
                setAvailableGrades(currentGrades);
                setSubjects(sRes.data);
                setAvailableSubjects(currentSubjects);
                setExamTypes(tRes.data.filter(t => t.isActive));
            } catch (err) {
                console.error('Error fetching metadata:', err);
            }
        };
        fetchMetadata();
    }, []);

    const fetchStudents = async () => {
        if (!selection.grade || !selection.subject || !selection.examType) {
            alert('Please select Class, Subject, and Academic Year first.');
            return;
        }

        setLoading(true);
        try {
            // Fetch students for the grade with Enrolled/Active status via params
            const { data: studentList } = await axios.get('/api/students', {
                ...config,
                params: {
                    grade: selection.grade,
                    status: 'Enrolled'
                }
            });
            setStudents(studentList);

            // Fetch existing marks for this combo
            const { data: response } = await axios.get(`/api/exam-marks?examTypeId=${selection.examType}&subjectId=${selection.subject}`, config);
            const marksList = response.marks || (Array.isArray(response) ? response : []);

            const marksMap = {};
            marksList.forEach(m => {
                marksMap[m.studentId] = {
                    examScore: m.examScore,
                    activityScore: m.activityScore,
                    isSaved: true
                };
            });
            setMarks(marksMap);
        } catch (err) {
            console.error('Error fetching students/marks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        const currentExamType = examTypes.find(t => t._id === selection.examType);
        const maxLimit = currentExamType?.totalMarks || 100;
        const entry = marks[studentId] || { examScore: '', activityScore: '' };

        if (field === 'activityScore' && Number(value) > 5) {
            alert('Activity marks cannot exceed 5!');
            return;
        }

        const newExamScore = (field === 'examScore') ? Number(value) : Number(entry.examScore || 0);
        const newActivityScore = (field === 'activityScore') ? Number(value) : Number(entry.activityScore || 0);

        if (newExamScore + newActivityScore > maxLimit) {
            alert(`Total marks (Exam + Activity) cannot exceed ${maxLimit}!`);
            return;
        }

        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
                isSaved: false
            }
        }));
    };

    const saveMark = async (student) => {
        const entry = marks[student._id];

        if (!entry || entry.examScore === '' || entry.activityScore === '') {
            alert(`Please fill in both marks for student: ${student.name}`);
            return;
        }

        try {
            const payload = {
                studentId: student._id,
                studentName: student.name,
                subjectId: selection.subject,
                subjectName: subjects.find(s => s._id === selection.subject)?.name,
                examTypeId: selection.examType,
                examScore: Number(entry.examScore) || 0,
                activityScore: Number(entry.activityScore) || 0,
                grade: selection.grade
            };
            await axios.post('/api/exam-marks', payload, config);
            setMarks(prev => ({
                ...prev,
                [student._id]: { ...prev[student._id], isSaved: true }
            }));
        } catch (err) {
            alert('An error occurred: ' + (err.response?.data?.message || err.message));
        }
    };

    const saveAll = async () => {
        // Simple sequential save for now
        const toSave = students.filter(s => marks[s._id] && !marks[s._id].isSaved);
        if (toSave.length === 0) {
            alert('No pending changes to save.');
            return;
        }

        for (const student of toSave) {
            await saveMark(student);
        }
        alert('All marks saved successfully!');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1>
                <p className="text-sm text-gray-500 mt-1">Input and calculate student results (Teacher/Admin)</p>
            </div>

            {/* Selection Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Class</label>
                    <select
                        value={selection.grade}
                        onChange={e => setSelection({ ...selection, grade: e.target.value })}
                        className="w-full border-gray-200 border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                        <option value="">Select Class</option>
                        {availableGrades.map(g => <option key={g._id} value={g.name}>{g.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject</label>
                    <select
                        value={selection.subject}
                        onChange={e => setSelection({ ...selection, subject: e.target.value })}
                        className="w-full border-gray-200 border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Subject</option>
                        {availableSubjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Academic Year & Term</label>
                    <select
                        value={selection.examType}
                        onChange={e => setSelection({ ...selection, examType: e.target.value })}
                        className="w-full border-gray-200 border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                        <option value="">Select Academic Year</option>
                        {examTypes.map(t => <option key={t._id} value={t._id}>{t.name} ({t.academicYear})</option>)}
                    </select>
                </div>
                <button
                    onClick={fetchStudents}
                    disabled={loading}
                    className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-bold text-sm hover:bg-[#1d4ed8] transition shadow-lg flex items-center gap-2"
                >
                    <Search className="w-4 h-4" /> {loading ? 'Loading...' : 'Fetch Students'}
                </button>
            </div>

            {students.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4 text-[#2563EB]" /> Student List - {selection.grade}
                        </h3>
                        <button
                            onClick={saveAll}
                            className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 transition"
                        >
                            <Save className="w-3.5 h-3.5" /> Save All Pending
                        </button>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Student Name</th>
                                <th className="px-6 py-4 text-center">Exam Mark (Max: { (examTypes.find(t => t._id === selection.examType)?.totalMarks || 100) - 5 })</th>
                                <th className="px-6 py-4 text-center">Activity (Max: 5)</th>
                                <th className="px-6 py-4 text-center text-blue-600">Total (Max: {examTypes.find(t => t._id === selection.examType)?.totalMarks || 100})</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map(student => {
                                const entry = marks[student._id] || { examScore: '', activityScore: '' };
                                const total = (Number(entry.examScore) || 0) + (Number(entry.activityScore) || 0);
                                const currentExamType = examTypes.find(t => t._id === selection.examType);
                                const maxPossible = currentExamType?.totalMarks || 100;
                                const passPercentageThreshold = currentExamType?.passPercentage || 50;
                                const passMarkValue = (passPercentageThreshold / 100) * maxPossible;

                                return (
                                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-gray-900">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                value={entry.examScore}
                                                onChange={e => handleMarkChange(student._id, 'examScore', e.target.value)}
                                                className="w-20 border-gray-200 border rounded-lg p-2 text-center text-sm focus:ring-2 focus:ring-[#2563EB]"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                value={entry.activityScore}
                                                onChange={e => handleMarkChange(student._id, 'activityScore', e.target.value)}
                                                className="w-20 border-gray-200 border rounded-lg p-2 text-center text-sm focus:ring-2 focus:ring-[#2563EB]"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900 text-lg">{total}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {total > 0 ? (
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${total >= passMarkValue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {total >= passMarkValue ? 'Passed' : 'Failed'}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => saveMark(student)}
                                                className={`p-2 rounded-lg transition-all ${entry.isSaved ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 hover:bg-blue-50'}`}
                                                title={entry.isSaved ? "Saved" : "Save changes"}
                                            >
                                                {entry.isSaved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {students.length === 0 && !loading && selection.grade && (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">No Students Found</h3>
                    <p className="text-sm text-gray-500">There are no students enrolled in {selection.grade} yet.</p>
                </div>
            )}
        </div>
    );
};

export default MarksEntry;
