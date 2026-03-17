import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, BookOpen, ChevronLeft, ChevronRight, Printer, Plus, X, Save, Edit2, Trash2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [
    { time: '07:30 - 08:15', label: 'Period 1' },
    { time: '08:15 - 09:00', label: 'Period 2' },
    { time: '09:00 - 09:45', label: 'Period 3' },
    { time: '09:45 - 10:00', label: 'Break' },
    { time: '10:00 - 10:45', label: 'Period 4' },
    { time: '10:45 - 11:30', label: 'Period 5' },
    { time: '11:30 - 12:15', label: 'Period 6' },
    { time: '12:15 - 13:00', label: 'Lunch' },
    { time: '13:00 - 13:45', label: 'Period 7' },
    { time: '13:45 - 14:30', label: 'Period 8' },
];

const timetableData = {
    Monday: ['Mathematics', 'English', 'Biology', '', 'Physics', 'Somali', 'Islamic Studies', '', 'History', 'Chemistry'],
    Tuesday: ['English', 'Mathematics', 'Somali', '', 'Biology', 'Physics', 'Chemistry', '', 'Islamic Studies', 'History'],
    Wednesday: ['Biology', 'Somali', 'Mathematics', '', 'History', 'English', 'Physics', '', 'Chemistry', 'Islamic Studies'],
    Thursday: ['Physics', 'Chemistry', 'English', '', 'Mathematics', 'Biology', 'Somali', '', 'History', 'Islamic Studies'],
    Friday: ['Islamic Studies', 'History', 'Physics', '', 'Somali', 'Chemistry', 'Mathematics', '', 'Biology', 'English'],
};

const subjectColors = {
    'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
    'English': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Biology': 'bg-green-100 text-green-800 border-green-200',
    'Physics': 'bg-purple-100 text-purple-800 border-purple-200',
    'Somali': 'bg-amber-100 text-amber-800 border-amber-200',
    'Islamic Studies': 'bg-teal-100 text-teal-800 border-teal-200',
    'History': 'bg-rose-100 text-rose-800 border-rose-200',
    'Chemistry': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Fasax': 'bg-gray-100 text-gray-600 border-gray-300 italic',
    '': 'bg-gray-50 text-gray-400 border-gray-100',
};

const upcomingEvents = [
    { date: 'Mar 10', event: 'Mathematics Exam - Grade 9', type: 'exam' },
    { date: 'Mar 12', event: 'English Language Exam - Grade 8', type: 'exam' },
    { date: 'Mar 14', event: 'Biology Exam - Grade 11', type: 'exam' },
    { date: 'Mar 15', event: 'Parent-Teacher Meeting', type: 'meeting' },
    { date: 'Mar 17', event: 'History Exam - Grade 10', type: 'exam' },
    { date: 'Mar 20', event: 'Sports Day', type: 'event' },
    { date: 'Mar 22', event: 'Somali Language Exam - Grade 7', type: 'exam' },
];

const eventColor = { exam: 'bg-red-100 text-red-700', meeting: 'bg-blue-100 text-blue-700', event: 'bg-emerald-100 text-emerald-700' };

const Timetable = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentEntry, setCurrentEntry] = useState({ grade: '', day: 'Monday', period: 'Period 1', subject: '' });
    const [dynamicTimetable, setDynamicTimetable] = useState({});
    const [profileInfo, setProfileInfo] = useState(null);

    const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gradesRes, subjectsRes] = await Promise.all([
                    axios.get('/api/grades', config),
                    axios.get('/api/subjects', config)
                ]);

                let filteredGrades = gradesRes.data;
                let initialGrade = '';

                if (user?.role === 'student') {
                    const { data: students } = await axios.get('/api/students', config);
                    const me = students.find(s => (s.username || s.email) === (user.username || user.email));
                    if (me) {
                        filteredGrades = gradesRes.data.filter(g => g.name === me.grade);
                        initialGrade = me.grade;
                        setProfileInfo({ grade: me.grade });
                    }
                } else if (user?.role === 'teacher') {
                    const { data: teachers } = await axios.get('/api/teachers', config);
                    const me = teachers.find(t => (t.username || t.email) === (user.username || user.email));
                    if (me) {
                        setProfileInfo({ subject: me.subject, assignedClasses: me.assignedClasses });
                        if (me.assignedClasses) {
                            const assignedList = me.assignedClasses.split(',').map(c => c.trim());
                            filteredGrades = gradesRes.data.filter(g => assignedList.includes(g.name));
                            initialGrade = filteredGrades.length > 0 ? filteredGrades[0].name : '';
                        }
                    }
                } else {
                    initialGrade = gradesRes.data.length > 0 ? gradesRes.data[0].name : '';
                }

                setGrades(filteredGrades);
                setSubjects(subjectsRes.data);
                setSelectedGrade(initialGrade);
                setCurrentEntry(prev => ({
                    ...prev,
                    grade: initialGrade,
                    subject: subjectsRes.data.length > 0 ? subjectsRes.data[0].name : ''
                }));
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const handleSaveEntry = () => {
        if (!currentEntry.subject || !currentEntry.grade) return;
        const periodIndex = periods.findIndex(p => p.label === currentEntry.period);
        if (periodIndex === -1) return;

        setDynamicTimetable(prev => {
            const gradeData = prev[currentEntry.grade] || {};
            const dayData = [...(gradeData[currentEntry.day] || [])];

            // Ensure array is long enough
            while (dayData.length <= periodIndex) dayData.push('');

            dayData[periodIndex] = currentEntry.subject;

            return {
                ...prev,
                [currentEntry.grade]: {
                    ...gradeData,
                    [currentEntry.day]: dayData
                }
            };
        });
        setShowModal(false);
    };

    const handleDeleteEntry = (grade, day, periodLabel) => {
        const periodIndex = periods.findIndex(p => p.label === periodLabel);
        if (periodIndex === -1) return;

        setDynamicTimetable(prev => {
            const gradeData = prev[grade] || {};
            const dayData = [...(gradeData[day] || [])];
            dayData[periodIndex] = '';

            return {
                ...prev,
                [grade]: {
                    ...gradeData,
                    [day]: dayData
                }
            };
        });
    };

    const handleEditEntry = (grade, day, periodLabel, subject) => {
        setCurrentEntry({ grade, day, period: periodLabel, subject });
        setShowModal(true);
    };

    // Flatten timetable for the list view
    const allEntries = [];
    Object.entries(dynamicTimetable).forEach(([grade, daysData]) => {
        Object.entries(daysData).forEach(([day, subjects]) => {
            subjects.forEach((subject, idx) => {
                if (subject && subject !== '') {
                    allEntries.push({
                        grade,
                        day,
                        period: periods[idx]?.label || `Period ${idx + 1}`,
                        subject
                    });
                }
            });
        });
    });

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <style>
                {`
                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { 
                        background: white !important; 
                        font-size: 8pt !important; 
                        color: black !important; 
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                    .mx-auto { margin: 0 !important; max-width: 100% !important; }
                    .p-5, .p-6, .px-6, .py-4, .pb-10 { padding: 4px !important; }
                    .shadow-sm, .border { box-shadow: none !important; border: 0.5pt solid black !important; }
                    .rounded-xl, .rounded-lg { border-radius: 0 !important; }
                    
                    /* Timetable Styling */
                    .overflow-x-auto { overflow: visible !important; }
                    table { width: 100% !important; border-collapse: collapse !important; border: 0.5pt solid black !important; }
                    th, td { 
                        border: 0.5pt solid black !important; 
                        padding: 6px !important; 
                        text-align: center !important; 
                        font-size: 8pt !important;
                    }
                    th { background-color: #f2f2f2 !important; font-weight: bold !important; text-transform: uppercase !important; }
                    td:first-child { text-align: left !important; font-weight: bold !important; width: 100px !important; }
                    
                    .print-header { 
                        display: block !important; 
                        margin-bottom: 20px; 
                        border-bottom: 2pt solid #000; 
                        padding-bottom: 10px; 
                        text-align: center;
                    }
                    .bg-gray-50 { background-color: #f9fafb !important; }
                    
                    /* Subject Colors in Print */
                    ${Object.entries(subjectColors).map(([sub, cls]) => `
                        .${cls.split(' ')[0]} { background-color: transparent !important; border: 0.5pt solid #ccc !important; color: black !important; font-weight: bold !important; }
                    `).join('')}
                }
                .print-header { display: none; }
                `}
            </style>

            <div className="print-header">
                <h1 className="text-2xl font-black uppercase">Weekly Class Schedule — {selectedGrade}</h1>
                <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">Academic Year 2024/25 - Smart Teacher Management System</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage class schedules — Academic Year 2024/25</p>
                </div>
                <div className="flex items-center gap-2">
                    {user?.role === 'admin' ? (
                        <>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-50 hover:text-[#2563EB] transition-all shadow-sm no-print"
                            >
                                <Printer className="h-3.5 w-3.5" /> Print
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentEntry(prev => ({ ...prev, grade: selectedGrade }));
                                    setShowModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm no-print"
                            >
                                <Plus className="h-4 w-4" /> Create/Edit Entry
                            </button>
                            <select
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white outline-none cursor-pointer hover:border-[#2563EB] no-print"
                                value={selectedGrade}
                                onChange={e => setSelectedGrade(e.target.value)}
                            >
                                {grades.length > 0 ? grades.map(g => (
                                    <option key={g._id} value={g.name}>{g.name}</option>
                                )) : <option>No Classes Available</option>}
                            </select>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            {grades.length > 1 && (
                                <select
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white outline-none cursor-pointer hover:border-[#2563EB] no-print"
                                    value={selectedGrade}
                                    onChange={e => setSelectedGrade(e.target.value)}
                                >
                                    {grades.map(g => (
                                        <option key={g._id} value={g.name}>{g.name}</option>
                                    ))}
                                </select>
                            )}
                            <div className="bg-blue-50 text-[#2563EB] px-4 py-2 rounded-xl border border-blue-100 font-bold uppercase text-xs tracking-widest no-print">
                                {selectedGrade} Schedule
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Add/Edit Schedule Entry</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Grade (Fasalka)</label>
                                <select
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#2563EB] outline-none"
                                    value={currentEntry.grade}
                                    onChange={e => setCurrentEntry({ ...currentEntry, grade: e.target.value })}
                                >
                                    <option value="">Choose Class</option>
                                    {grades.map(g => <option key={g._id} value={g.name}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Day</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#2563EB] outline-none"
                                        value={currentEntry.day}
                                        onChange={e => setCurrentEntry({ ...currentEntry, day: e.target.value })}
                                    >
                                        {days.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Period</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#2563EB] outline-none"
                                        value={currentEntry.period}
                                        onChange={e => setCurrentEntry({ ...currentEntry, period: e.target.value })}
                                    >
                                        {periods.map(p => <option key={p.label}>{p.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                                <select
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-[#2563EB] outline-none"
                                    value={currentEntry.subject}
                                    onChange={e => setCurrentEntry({ ...currentEntry, subject: e.target.value })}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                    <option value="Fasax">Fasax (Break/Holiday)</option>
                                </select>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                            <button onClick={handleSaveEntry} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1d4ed8] transition-colors">
                                <Save className="h-4 w-4" /> Apply to Grid
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            {user?.role === 'admin' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 no-print">
                    {[
                        { label: 'Total Periods/Day', value: '8', sub: 'Excluding breaks', icon: <Clock className="h-5 w-5 text-[#2563EB]" />, color: 'bg-blue-50' },
                        { label: 'Active Classes', value: '18', sub: 'This week', icon: <BookOpen className="h-5 w-5 text-purple-600" />, color: 'bg-purple-50' },
                        { label: 'Teachers', value: '24', sub: 'On schedule', icon: <Users className="h-5 w-5 text-emerald-600" />, color: 'bg-emerald-50' },
                        { label: 'Upcoming Events', value: '7', sub: 'This month', icon: <Calendar className="h-5 w-5 text-amber-600" />, color: 'bg-amber-50' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`p-3 rounded-xl ${s.color}`}>{s.icon}</div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between no-print">
                    <h3 className="text-sm font-semibold text-gray-700">Weekly Schedule — {selectedGrade}</h3>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                        <span className="text-xs font-medium text-gray-600 px-2">Week of Mar 10–14, 2025</span>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-gray-50 text-print-black">
                                <th className="px-4 py-3 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap w-28">Time</th>
                                {days.map(d => (
                                    <th key={d} className="px-3 py-3 text-center text-gray-500 font-semibold uppercase tracking-wide">{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {periods.map((p, i) => {
                                const isBreak = p.label === 'Break' || p.label === 'Lunch';
                                return (
                                    <tr key={i} className={isBreak ? 'bg-gray-50' : 'hover:bg-gray-50 transition-colors'}>
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                            <p className="font-medium text-gray-700">{p.label}</p>
                                            <p className="text-gray-400">{p.time}</p>
                                        </td>
                                        {days.map(day => {
                                            const subject = dynamicTimetable[selectedGrade]?.[day]?.[i] || '';
                                            const isTeacherSubject = user?.role === 'teacher' && profileInfo?.subject === subject;

                                            if (isBreak) {
                                                return <td key={day} className="px-3 py-2 text-center text-gray-400 italic">{p.label}</td>;
                                            }
                                            return (
                                                <td key={day} className="px-3 py-2">
                                                    {subject && subject !== 'None' ? (
                                                        <div className={`rounded-lg px-2 py-1.5 border text-center font-medium transition-all ${isTeacherSubject
                                                            ? 'ring-2 ring-blue-400 ring-offset-1 shadow-sm border-blue-300'
                                                            : ''
                                                            } ${subjectColors[subject] || 'bg-gray-100 text-gray-800'}`}>
                                                            {subject}
                                                            {isTeacherSubject && <div className="text-[8px] mt-0.5 text-blue-600 font-bold uppercase tracking-tighter">(Your Class)</div>}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-lg px-2 py-1.5 text-center text-gray-300 italic">
                                                            {subject === 'None' ? 'Fasax' : '—'}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Management List - Only for Admin */}
            {user?.role === 'admin' && allEntries.length > 0 && (
                <div className="mt-10 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden no-print">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Manage Timetable Entries</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Edit or delete specific assignments from the grid</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search entries..."
                                className="pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#2563EB] w-48"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                                    <th className="px-6 py-3">Grade</th>
                                    <th className="px-6 py-3">Day</th>
                                    <th className="px-6 py-3">Period</th>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {allEntries.map((entry, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-bold text-[#2563EB]">{entry.grade}</td>
                                        <td className="px-6 py-3 text-gray-700">{entry.day}</td>
                                        <td className="px-6 py-3 text-gray-600 font-medium">{entry.period}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${subjectColors[entry.subject] || 'bg-gray-100 text-gray-600'}`}>
                                                {entry.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditEntry(entry.grade, entry.day, entry.period, entry.subject)}
                                                    className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Entry"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEntry(entry.grade, entry.day, entry.period)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Entry"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Timetable;
