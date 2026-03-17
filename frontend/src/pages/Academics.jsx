import { useState } from 'react';
import { BookOpen, GraduationCap, AlertCircle, BarChart2, Search, Plus, Eye, Edit2, ChevronDown, Printer } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const subjects = [
    { id: 1, name: 'Mathematics', teacher: 'Mr. Abdi Warsame', grade: 'Grade 9', students: 87, avg: 74, exams: 4, nextExam: 'Mar 10, 2025' },
    { id: 2, name: 'English Language', teacher: 'Ms. Hodan Jama', grade: 'Grade 8', students: 98, avg: 72, exams: 3, nextExam: 'Mar 12, 2025' },
    { id: 3, name: 'Biology', teacher: 'Mr. Khalid Hassan', grade: 'Grade 11', students: 60, avg: 68, exams: 5, nextExam: 'Mar 14, 2025' },
    { id: 4, name: 'History', teacher: 'Ms. Faadumo Ali', grade: 'Grade 10', students: 73, avg: 71, exams: 3, nextExam: 'Mar 17, 2025' },
    { id: 5, name: 'Physics', teacher: 'Mr. Yusuf Farah', grade: 'Grade 11', students: 60, avg: 65, exams: 4, nextExam: 'Mar 20, 2025' },
    { id: 6, name: 'Somali Language', teacher: 'Ms. Amina Hassan', grade: 'Grade 7', students: 120, avg: 79, exams: 3, nextExam: 'Mar 22, 2025' },
    { id: 7, name: 'Islamic Studies', teacher: 'Sheikh Mohamed Omar', grade: 'Grade 8', students: 98, avg: 83, exams: 2, nextExam: 'Mar 25, 2025' },
    { id: 8, name: 'Chemistry', teacher: 'Ms. Sahra Dahir', grade: 'Grade 12', students: 45, avg: 70, exams: 4, nextExam: 'Mar 27, 2025' },
];

const performanceData = [
    { grade: 'Gr 7', avg: 79 }, { grade: 'Gr 8', avg: 74 },
    { grade: 'Gr 9', avg: 74 }, { grade: 'Gr 10', avg: 71 },
    { grade: 'Gr 11', avg: 65 }, { grade: 'Gr 12', avg: 70 },
];

const trendData = [
    { month: 'Oct', Math: 68, English: 72, Science: 70 },
    { month: 'Nov', Math: 71, English: 69, Science: 73 },
    { month: 'Dec', Math: 67, English: 74, Science: 71 },
    { month: 'Jan', Math: 73, English: 76, Science: 75 },
    { month: 'Feb', Math: 75, English: 74, Science: 78 },
    { month: 'Mar', Math: 78, English: 77, Science: 80 },
];

const avgColor = (avg) => {
    if (avg >= 80) return 'text-emerald-600 bg-emerald-50';
    if (avg >= 70) return 'text-blue-600 bg-blue-50';
    if (avg >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
};

const Academics = () => {
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');

    const grades = ['All', ...Array.from(new Set(subjects.map(s => s.grade)))];

    const filtered = subjects.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.teacher.toLowerCase().includes(search.toLowerCase());
        const matchGrade = gradeFilter === 'All' || s.grade === gradeFilter;
        return matchSearch && matchGrade;
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
                    .p-5, .p-6, .px-6, .py-4, .pb-10 { padding: 4px !important; }
                    .mx-auto { margin: 0 !important; max-width: 100% !important; }
                    .shadow-sm { box-shadow: none !important; border: 0.5pt solid #eee !important; }
                    .rounded-xl { border-radius: 4px !important; }
                    
                    /* Charts Styling */
                    .recharts-responsive-container { height: 180px !important; }
                    
                    /* Table Styling */
                    .overflow-x-auto { overflow: visible !important; }
                    table { width: 100% !important; border-collapse: collapse !important; margin-top: 5mm; }
                    th, td { 
                        border: 0.5pt solid #000 !important; 
                        padding: 4px !important; 
                        text-align: left !important; 
                        font-size: 7.5pt !important;
                    }
                    th { background-color: #f2f2f2 !important; font-weight: bold !important; text-transform: uppercase !important; }
                    
                    .print-header { 
                        display: block !important; 
                        margin-bottom: 15px; 
                        border-bottom: 2pt solid #000; 
                        padding-bottom: 10px; 
                        text-align: center;
                    }
                }
                .print-header { display: none; }
                `}
            </style>

            <div className="print-header">
                <h1 className="text-2xl font-black uppercase">Academic Performance Report</h1>
                <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">School Year 2024/25 - Curriculum Overview</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academics</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage curriculum, grades, and academic performance — 2024/25</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="h-3.5 w-3.5" /> Print Overview
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> Add Subject
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'School Average', value: '71.2%', sub: '+2.1% from last term', icon: <BarChart2 className="h-5 w-5 text-blue-600" />, color: 'bg-blue-50' },
                    { label: 'Total Subjects', value: '8', sub: 'Across all grades', icon: <BookOpen className="h-5 w-5 text-purple-600" />, color: 'bg-purple-50' },
                    { label: 'Top Performers', value: '48', sub: 'Score above 90%', icon: <GraduationCap className="h-5 w-5 text-emerald-600" />, color: 'bg-emerald-50' },
                    { label: 'At Risk', value: '22', sub: 'Below 50% average', icon: <AlertCircle className="h-5 w-5 text-red-500" />, color: 'bg-red-50' },
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Average Score by Grade</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} domain={[50, 100]} />
                            <Tooltip />
                            <Bar dataKey="avg" name="Avg Score %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Subject Performance Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} domain={[55, 90]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Math" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="English" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="Science" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subjects Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-64">
                        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search subjects or teachers..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white cursor-pointer hover:border-blue-500 select-none">
                        <span>Grade: </span>
                        <select className="bg-transparent outline-none cursor-pointer text-sm font-medium" value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                            {grades.map(g => <option key={g}>{g}</option>)}
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                            <tr>
                                {['#', 'Subject', 'Teacher', 'Grade', 'Students', 'Avg Score', 'Exams Done', 'Next Exam', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{String(s.id).padStart(2, '0')}</td>
                                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{s.name}</td>
                                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{s.teacher}</td>
                                    <td className="px-5 py-3 text-gray-500">{s.grade}</td>
                                    <td className="px-5 py-3 text-gray-500">{s.students}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${avgColor(s.avg)}`}>{s.avg}%</span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">{s.exams}</td>
                                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{s.nextExam}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-1.5">
                                            <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="h-4 w-4" /></button>
                                            <button className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Academics;
