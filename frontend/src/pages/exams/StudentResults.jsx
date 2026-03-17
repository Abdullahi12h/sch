import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, GraduationCap, CheckCircle, XCircle, Filter, Trophy, BarChart3, Target, ChevronDown, Lock, Unlock, ShieldAlert, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';




const FilterBar = ({ filters, activeFilters = {}, onFilterChange }) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    return (
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 relative z-30 no-print">
            {filters.map((f) => {
                const label = typeof f === 'string' ? f : f.label;
                const id = typeof f === 'string' ? f : f.id;
                const options = typeof f === 'string' ? [] : f.options;

                let currentValue = activeFilters[id] || label;
                if (f.getDisplayValue) {
                    currentValue = f.getDisplayValue(activeFilters[id]) || label;
                }

                return (
                    <div key={id} className="relative">
                        <div
                            onClick={() => options.length > 0 && setOpenDropdown(openDropdown === id ? null : id)}
                            className={`flex items-center gap-1.5 border ${openDropdown === id ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-200'} rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white hover:border-blue-400 cursor-pointer transition-colors select-none`}
                        >
                            {currentValue} <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />
                        </div>

                        {openDropdown === id && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                                <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1">
                                    {options.map(opt => {
                                        const optValue = typeof opt === 'object' ? opt.value : opt;
                                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                                        const isSelected = activeFilters[id] === optValue;
                                        return (
                                            <div
                                                key={optValue || optLabel}
                                                onClick={() => {
                                                    onFilterChange?.(id, optValue);
                                                    setOpenDropdown(null);
                                                }}
                                                className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${isSelected ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700'}`}
                                            >
                                                {optLabel}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white hover:border-blue-400 cursor-pointer transition-colors">
                <Filter className="h-3.5 w-3.5" /> More Filters
            </div>
        </div>
    );
};

const StudentResults = () => {
    const { user } = useAuth();
    const [results, setResults] = useState({ marks: [], rankInfo: null, rankMap: {}, rankByNameMap: {} });
    const [examTypes, setExamTypes] = useState([]);
    const [grades, setGrades] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({
        academicYear: '',
        examType: '',
        grade: ''
    });


    const isStudent = user?.role === 'student';
    const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filter.academicYear) params.append('academicYear', filter.academicYear);
            if (filter.examType) params.append('examTypeId', filter.examType);
            if (filter.grade) params.append('grade', filter.grade);

            const rRes = await axios.get(`/api/exam-marks${params.toString() ? `?${params.toString()}` : ''}`, config);

            if (rRes.data.isLocked) {
                setError({ isLocked: true, message: rRes.data.message });
            } else {
                setResults(rRes.data);
            }

            const [tRes, gRes, yRes] = await Promise.all([
                axios.get('/api/exam-types', config),
                axios.get('/api/grades', config),
                axios.get('/api/academic-years', config)
            ]);
            setExamTypes(tRes.data);
            setGrades(gRes.data);
            setAcademicYears(yRes.data);
        } catch (err) {
            console.error('Error fetching results:', err);
            setError({ message: err.response?.data?.message || 'Server error' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLock = async (studentId, currentStatus) => {
        try {
            await axios.put(`/api/students/${studentId}/toggle-lock`, {}, config);
            fetchData();
        } catch (err) {
            console.error('Error toggling lock:', err);
            alert('An error occurred while locking the result.');
        }
    };

    const handleToggleGlobalLock = async (examTypeId) => {
        if (!examTypeId) return;
        try {
            await axios.put(`/api/exam-types/${examTypeId}/toggle-lock`, {}, config);
            fetchData();
        } catch (err) {
            console.error('Error toggling global lock:', err);
            alert('An error occurred while performing global lock.');
        }
    };

    const handleBulkStudentLock = async (isLocked) => {
        const confirmMsg = isLocked
            ? `Are you sure you want to LOCK results for all students ${filter.grade ? `in ${filter.grade}` : ''}?`
            : `Are you sure you want to UNLOCK results for all students ${filter.grade ? `in ${filter.grade}` : ''}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await axios.post('/api/lock-all', { grade: filter.grade, isLocked }, config);
            alert(response.data.message);
            fetchData();
        } catch (err) {
            console.error('Bulk student lock error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
            const errorDetail = err.response?.data?.error || '';
            alert(`${errorMsg}${errorDetail ? `\n\nDetail: ${errorDetail}` : ''}`);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.academicYear, filter.examType, filter.grade]);

    // Set current year as default once academicYears are loaded
    useEffect(() => {
        if (academicYears.length > 0 && !filter.academicYear) {
            const currentYear = academicYears.find(y => y.isCurrent);
            if (currentYear) {
                setFilter(prev => ({ ...prev, academicYear: currentYear.name }));
            } else if (examTypes.length > 0) {
                const years = [...new Set(examTypes.map(t => t.academicYear))].sort().reverse();
                if (years.length > 0) {
                    setFilter(prev => ({ ...prev, academicYear: years[0] }));
                }
            }
        }
    }, [academicYears, examTypes]);

    const uniqueYears = [...new Set(examTypes.map(t => t.academicYear))];
    const availableExamTypes = filter.academicYear
        ? examTypes.filter(t => t.academicYear === filter.academicYear)
        : examTypes;


    const getGrade = (score) => {
        if (score >= 90) return { label: 'A', color: 'text-emerald-600', bg: 'bg-emerald-50' };
        if (score >= 80) return { label: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (score >= 70) return { label: 'C', color: 'text-amber-600', bg: 'bg-amber-50' };
        if (score >= 60) return { label: 'D', color: 'text-orange-600', bg: 'bg-orange-50' };
        if (score >= 50) return { label: 'E', color: 'text-gray-600', bg: 'bg-gray-50' };
        return { label: 'F', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const marksList = results.marks || [];

    // Grouping Logic - defined here to be used for both summary cards and table
    const groupedResults = marksList.reduce((acc, curr) => {
        const sid = curr.studentId?._id?.toString() || curr.studentId?.toString() || '';
        const subId = curr.subjectId?._id?.toString() || curr.subjectId?.toString() || curr.subjectName;
        const year = curr.examTypeId?.academicYear || 'Any';
        const key = `${subId}-${year}-${isStudent ? '' : sid}`;
        
        if (!acc[key]) {
            acc[key] = {
                subjectName: curr.subjectName,
                studentName: curr.studentName,
                studentId: sid,
                academicYear: year,
                marks: { b1: 0, b2: 0, term: 0, final: 0 },
                hasEntry: { b1: false, b2: false, term: false, final: false },
                subjectTotal: 0
            };
        }
        
        const name = curr.examTypeId?.name?.toLowerCase() || '';
        let col = '';
        if (name.includes('one') || name.includes('1') || name.includes('bileed1') || name.includes('bileed 1')) col = 'b1';
        else if (name.includes('two') || name.includes('2') || name.includes('bileed2') || name.includes('bileed 2')) col = 'b2';
        else if (name.includes('term') || name.includes('mid') || name.includes('nus')) col = 'term';
        else if (name.includes('final') || name.includes('dhamaad')) col = 'final';

        if (col && !acc[key].hasEntry[col]) {
            // Calculate weighted score: (Score / MaxPossible) * Weightage
            const maxPossible = curr.examTypeId?.totalMarks || 100;
            const weightage = curr.examTypeId?.weight || 25;
            const weightedScore = (curr.totalScore / maxPossible) * weightage;

            acc[key].marks[col] = weightedScore;
            acc[key].hasEntry[col] = true;
            acc[key].subjectTotal += weightedScore;
        }
        return acc;
    }, {});

    const sortedGrouped = Object.values(groupedResults);

    // [New] Broadsheet Styling: All unique subjects become columns
    const uniqueSubjects = !isStudent ? [...new Set(marksList.map(m => m.subjectName))].sort() : [];

    const adminGrouped = !isStudent ? Object.values(marksList.reduce((acc, curr) => {
        const studentObj = curr.studentId;
        const sid = studentObj?._id?.toString() || curr.studentId;
        const sname = curr.studentName;
        const year = curr.examTypeId?.academicYear || 'Any';
        const groupKey = `${sid}-${year}`;

        if (!acc[groupKey]) {
            acc[groupKey] = {
                studentId: sid,
                schoolId: studentObj?.id,
                studentName: sname,
                academicYear: year,
                isLocked: studentObj?.isResultsLocked,
                totalPoints: 0,
                subjectMarks: {},
                recordedCategories: {}, // { subject: { category: true } }
                subjects: new Set(),
                marks: []
            };
        }

        const name = curr.examTypeId?.name?.toLowerCase() || '';
        let cat = 'other';
        if (name.includes('one') || name.includes('1')) cat = 'b1';
        else if (name.includes('two') || name.includes('2')) cat = 'b2';
        else if (name.includes('term') || name.includes('mid')) cat = 'term';
        else if (name.includes('final')) cat = 'final';

        if (!acc[groupKey].subjectMarks[curr.subjectName]) acc[groupKey].subjectMarks[curr.subjectName] = 0;
        if (!acc[groupKey].recordedCategories[curr.subjectName]) acc[groupKey].recordedCategories[curr.subjectName] = {};

        // Only add if this category hasn't been added for this subject/student/year combo
        if (!acc[groupKey].recordedCategories[curr.subjectName][cat]) {
            const maxPossible = curr.examTypeId?.totalMarks || 100;
            const weightage = curr.examTypeId?.weight || 25;
            const weightedScore = (curr.totalScore / maxPossible) * weightage;

            acc[groupKey].totalPoints += weightedScore;
            acc[groupKey].subjectMarks[curr.subjectName] += weightedScore;
            acc[groupKey].recordedCategories[curr.subjectName][cat] = true;
        }

        acc[groupKey].subjects.add(curr.subjectName);
        acc[groupKey].marks.push(curr);
        return acc;
    }, {})).map(student => ({
        ...student,
        avgScore: student.subjects.size > 0 ? (student.totalPoints / student.subjects.size) : 0,
        passedSubCount: Object.values(student.subjectMarks).filter(score => score >= 50).length,
        isOverallPassed: (student.subjects.size > 0 ? (student.totalPoints / student.subjects.size) : 0) >= 50
    })).sort((a, b) => b.totalPoints - a.totalPoints) : [];

    const displayData = isStudent ? sortedGrouped : adminGrouped;

    const averageScore = sortedGrouped.length
        ? (sortedGrouped.reduce((acc, s) => acc + s.subjectTotal, 0) / sortedGrouped.length).toFixed(1)
        : 0;

    const totalScoreFromMarks = isStudent 
        ? sortedGrouped.reduce((acc, s) => acc + s.subjectTotal, 0)
        : (adminGrouped.reduce((acc, s) => acc + s.totalPoints, 0) / (adminGrouped.length || 1));

    const passedCount = isStudent
        ? sortedGrouped.filter(s => s.subjectTotal >= 50).length
        : adminGrouped.filter(s => s.isOverallPassed).length;

    return (
        <div className="p-6 max-w-[1500px] mx-auto">
            <style>
                {`
                @media print {
                    @page { 
                        size: A4 landscape; 
                        margin: 5mm; 
                    }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    
                    body { 
                        background: white !important; 
                        font-size: 7pt !important; 
                        color: black !important; 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .p-6 { padding: 0 !important; }
                    .max-w-7xl { max-width: 100% !important; margin: 0 !important; width: 100% !important; }
                    .shadow-sm, .shadow-lg, .shadow-2xl { box-shadow: none !important; border: none !important; }
                    .rounded-2xl, .rounded-3xl, .rounded-xl { border-radius: 0 !important; }

                    /* Tighten up the table for A4 Landscape */
                    .overflow-x-auto { overflow: visible !important; }
                    table { 
                        width: 100% !important; 
                        border-collapse: collapse !important; 
                        table-layout: fixed !important; /* Force fit */
                    }
                    
                    th, td { 
                        border: 0.5pt solid black !important; 
                        padding: 3px 1px !important; 
                        font-size: 6.5pt !important; 
                        text-align: center !important; 
                        color: black !important;
                        word-wrap: break-word !important;
                        letter-spacing: -0.2px !important;
                    }

                    th { 
                        background-color: #f2f2f2 !important; 
                        font-weight: 900 !important; 
                        text-transform: uppercase !important; 
                    }

                    /* Column Width Tweeks */
                    th:first-child, td:first-child { width: 25px !important; text-align: left !important; padding-left: 3px !important; }
                    th:nth-child(2), td:nth-child(2) { width: 140px !important; text-align: left !important; padding-left: 5px !important; }
                    
                    /* Pass/Fail Status formatting for Print */
                    .text-emerald-600 { color: #000 !important; font-weight: 900 !important; }
                    .text-rose-600 { color: #000 !important; font-weight: 900 !important; }
                    .bg-emerald-50, .bg-rose-50 { background: transparent !important; border: 0.5pt solid black !important; }

                    /* Highlight Total & Rank */
                    .bg-blue-50, .bg-blue-50\/30, .bg-indigo-50 { 
                        background-color: #e5e5e5 !important; 
                        font-weight: 900 !important; 
                    }

                    .print-header { 
                        display: block !important; 
                        margin-bottom: 10px; 
                        border-bottom: 1.5pt solid black; 
                        padding-bottom: 5px; 
                    }
                    
                    .print-header h1 { font-size: 14pt !important; margin: 0 !important; }
                }
                .print-header { display: none; }
                .print-only { display: none; }
                `}
            </style>

            <div className="print-header">
                <h1 className="text-xl font-black text-gray-900 uppercase">
                    {isStudent ? 'Student Result Report' : 'Results Report (Broadsheet)'}
                </h1>
                <div className="flex gap-6 mt-1 text-[10px] font-bold text-gray-600">
                    {isStudent ? (
                        <>
                            <p>Student: {results?.studentData?.name || user?.studentData?.name || user?.name || ''}</p>
                            <p>Class: {results?.studentData?.grade || user?.studentData?.grade || ''}</p>
                            <p>Year: {filter.academicYear}</p>
                        </>
                    ) : (
                        <>
                            <p>Class: {filter.grade || 'All'}</p>
                            <p>Exam: {availableExamTypes.find(t => t._id === filter.examType)?.name || 'All'}</p>
                            <p>Year: {filter.academicYear}</p>
                        </>
                    )}
                </div>
            </div>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isStudent ? 'Natiijada Imtixaanka' : 'Maamulka Natiijoyinka'}
                        <span className="hidden print:inline ml-2 text-gray-600">
                            {filter.grade && ` — ${filter.grade}`}
                            {filter.examType && ` — ${availableExamTypes.find(t => t._id === filter.examType)?.name}`}
                            {filter.academicYear && ` (${filter.academicYear})`}
                        </span>
                    </h1>
                    {isStudent && (
                        <div className="mt-2 flex items-center flex-wrap gap-4 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl no-print">
                            <span>🎓 <span className="text-gray-400 text-xs uppercase tracking-widest">Student:</span> {results?.studentData?.name || user?.studentData?.name || user?.name}</span>
                            <span>📚 <span className="text-gray-400 text-xs uppercase tracking-widest">Class:</span> {results?.studentData?.grade || user?.studentData?.grade || '-'}</span>
                            <span>📅 <span className="text-gray-400 text-xs uppercase tracking-widest">Year:</span> {filter.academicYear || '-'}</span>
                        </div>
                    )}
                    {!isStudent && <p className="text-sm text-gray-500 mt-1 no-print">Manage student scores for each subject.</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                    <button
                        onClick={() => window.print()}
                        className="no-print flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    {!isStudent && filter.examType && (
                        <div className="flex items-center gap-2 sm:gap-3 no-print flex-1 sm:flex-none">
                            <div className="text-right hidden lg:block">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Lock Status</p>
                                <p className="text-xs font-bold text-gray-600">
                                    {examTypes.find(t => t._id === filter.examType)?.isResultsLocked ? 'Locked' : 'Open'}
                                </p>
                            </div>
                            <button
                                onClick={() => handleToggleGlobalLock(filter.examType)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm ${examTypes.find(t => t._id === filter.examType)?.isResultsLocked
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                                    }`}
                            >
                                {examTypes.find(t => t._id === filter.examType)?.isResultsLocked ? (
                                    <><Unlock className="w-3.5 h-3.5" /> Open</>
                                ) : (
                                    <><Lock className="w-3.5 h-3.5" /> Lock</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters - matching dashboard style */}
            <div className="no-print">
                <FilterBar
                    filters={[
                        {
                            id: 'academicYear',
                            label: 'Academic Year',
                            options: [
                                { value: '', label: 'All Years' },
                                ...[...new Set([...academicYears.map(y => y.name), ...uniqueYears])].sort().reverse().map(y => ({ value: y, label: y }))
                            ],
                            getDisplayValue: (val) => val || 'Academic Year'
                        },
                        ...(!isStudent ? [{
                            id: 'grade',
                            label: 'All Classes',
                            options: [
                                { value: '', label: 'All Classes' },
                                ...grades.map(g => ({ value: g.name, label: g.name }))
                            ],
                            getDisplayValue: (val) => val || 'All Classes'
                        }] : []),
                        {
                            id: 'examType',
                            label: 'All Exams',
                            options: [
                                { value: '', label: 'All Exams' },
                                ...availableExamTypes.map(t => ({ value: t._id, label: t.name }))
                            ],
                            getDisplayValue: (val) => {
                                if (!val) return 'All Exams';
                                const exam = availableExamTypes.find(t => t._id === val);
                                return exam ? exam.name : 'All Exams';
                            }
                        }
                    ]}
                    activeFilters={filter}
                    onFilterChange={(id, value) => setFilter(prev => ({ ...prev, [id]: value, ...(id === 'academicYear' ? { examType: '' } : {}) }))}
                />
            </div>

            {
                loading ? (
                    <div className="bg-white p-20 rounded-3xl border border-gray-100 text-center shadow-sm">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-semibold">Loading results...</p>
                    </div>
                ) : marksList.length > 0 ? (
                    <>
                        {/* Top Statistics Cards - Responsive Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-8 no-print">
                            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Wadarta (Total)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tighter">
                                        {Number(results.rankInfo?.totalScore || totalScoreFromMarks).toFixed(1)}
                                    </span>
                                    <Trophy className="w-4 h-4 text-amber-500 mb-1.5" />
                                </div>
                            </div>

                            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Celceliska (Avg)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tighter">
                                        {Number(results.rankInfo?.average || averageScore).toFixed(1)}%
                                    </span>
                                    <BarChart3 className="w-4 h-4 text-emerald-500 mb-1.5" />
                                </div>
                            </div>

                            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Gudubka (Pass)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tighter">{passedCount}</span>
                                    <span className="text-gray-400 text-[10px] mb-1 font-bold">
                                        /{isStudent ? sortedGrouped.length : adminGrouped.length}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Grade-ka (Rank)</p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl sm:text-3xl font-black ${getGrade(Number(results.rankInfo?.average || averageScore)).color}`}>
                                        {getGrade(Number(results.rankInfo?.average || averageScore)).label}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-indigo-500 col-span-1 md:col-span-1 lg:col-span-1">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Kaalinta</p>
                                {results.rankInfo?.rank && results.rankInfo.rank !== '-' ? (
                                    <div className="flex items-end gap-0.5">
                                        <span className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tighter">{results.rankInfo.rank}</span>
                                        <span className="text-[10px] text-gray-500 mb-1 font-black uppercase tracking-tighter">
                                            {results.rankInfo.rank === 1 ? 'st' : results.rankInfo.rank === 2 ? 'nd' : results.rankInfo.rank === 3 ? 'rd' : 'th'}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm font-bold italic">N/A</span>
                                )}
                            </div>
                        </div>

                        {/* Results Table - Responsive Wrapper */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm table-responsive-container no-scrollbar">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                                    <tr>
                                        {isStudent ? (
                                            <>
                                                <th className="px-6 py-4 text-left">Subject</th>
                                                <th className="px-6 py-4 text-center">Month 1 (15)</th>
                                                <th className="px-6 py-4 text-center">Month 2 (15)</th>
                                                <th className="px-6 py-4 text-center">Term (30)</th>
                                                <th className="px-6 py-4 text-center">Final (40)</th>
                                                <th className="px-6 py-4 text-center bg-blue-50/50 text-blue-600">Total (100)</th>
                                                <th className="px-6 py-4 text-right">Result</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-4 py-4 text-left w-12 border-r border-gray-100 italic">No</th>
                                                <th className="px-6 py-4 text-left min-w-[200px] border-r border-gray-100">Student Names</th>
                                                {uniqueSubjects.map(sub => (
                                                    <th key={sub} className="px-2 py-4 text-center border-r border-gray-100 group">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-[8px] opacity-70 mb-1">Marks</span>
                                                            <span className="truncate max-w-[80px] font-black text-gray-700">{sub}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="px-6 py-4 text-center border-r border-gray-100 bg-blue-50/30">Total</th>
                                                <th className="px-6 py-4 text-center border-r border-gray-100">Average</th>
                                                <th className="px-6 py-4 text-center border-r border-gray-100 min-w-[120px]">Result</th>
                                                <th className="px-4 py-4 text-center w-24 border-r border-gray-100 font-bold text-gray-400 font-mono">KAALINTA</th>
                                                <th className="px-4 py-4 text-center w-12 border-r border-gray-100 no-print">Lock</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {displayData.map((item, idx) => {
                                        if (isStudent) {
                                            const b1 = (item.marks.b1 || 0).toFixed(1);
                                            const b2 = (item.marks.b2 || 0).toFixed(1);
                                            const term = (item.marks.term || 0).toFixed(1);
                                            const final = (item.marks.final || 0).toFixed(1);
                                            const total = (Number(b1) + Number(b2) + Number(term) + Number(final)).toFixed(1);
                                            const isPassed = Number(total) >= 50;

                                            return (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                                                <BookOpen className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                            <p className="font-bold text-gray-900">{item.subjectName}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-600">{b1 || '-'}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-600">{b2 || '-'}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-600">{term || '-'}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-600">{final || '-'}</td>
                                                    <td className="px-6 py-4 text-center font-black text-blue-600 bg-blue-50/30">{total}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {isPassed ? (
                                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase">
                                                                    <CheckCircle className="w-3.5 h-3.5" /> Passed
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-black uppercase">
                                                                    <XCircle className="w-3.5 h-3.5" /> Failed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        } else {
                                            // Management View (Summarized Students with Subject Columns)
                                            const avg = item.avgScore.toFixed(1);
                                            const rankData = results.rankMap && item.studentId && results.rankMap[item.studentId];
                                            const passStatus = item.isOverallPassed;

                                            return (
                                                <tr key={idx} className="hover:bg-indigo-50/10 transition-colors border-b border-gray-100 group">
                                                    <td className="px-4 py-4 text-left border-r border-gray-50 text-[10px] text-gray-400 font-bold">{idx + 1}</td>
                                                    <td className="px-6 py-4 border-r border-gray-100">
                                                        <p className="font-black text-gray-800 text-[11px] truncate uppercase">{item.studentName}</p>
                                                    </td>
                                                    {uniqueSubjects.map(sub => {
                                                        const score = item.subjectMarks[sub];
                                                        return (
                                                            <td key={sub} className={`px-2 py-4 text-center border-r border-gray-50 font-bold text-[11px] ${score < 50 ? 'text-rose-500' : 'text-gray-600'}`}>
                                                                {score !== undefined ? score.toFixed(1) : <span className="text-gray-200">-</span>}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-6 py-4 text-center border-r border-gray-100 bg-blue-50/10 font-black text-gray-900">{item.totalPoints.toFixed(1)}</td>
                                                    <td className="px-6 py-4 text-center border-r border-gray-100 font-black text-blue-600">{avg}%</td>
                                                    <td className="px-6 py-4 text-center border-r border-gray-100 min-w-[120px]">
                                                        {passStatus ? (
                                                            <span className="flex items-center justify-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase">
                                                                <CheckCircle className="w-3.5 h-3.5" /> Passed
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center justify-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-black uppercase">
                                                                <XCircle className="w-3.5 h-3.5" /> Failed
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center border-r border-gray-100 w-24">
                                                        {rankData?.rank ? (
                                                            <div className="inline-flex items-center justify-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 shadow-sm">
                                                                <span className="text-[12px] font-black text-indigo-700">{rankData.rank}</span>
                                                                <span className="text-[10px] text-indigo-400 font-bold uppercase">{rankData.rank === 1 ? 'st' : rankData.rank === 2 ? 'nd' : rankData.rank === 3 ? 'rd' : 'th'}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-200">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center border-r border-gray-100 no-print w-12">
                                                        <button
                                                            onClick={() => handleToggleLock(item.schoolId, item.isLocked)}
                                                            className={`p-1.5 rounded-lg transition-colors ${item.isLocked
                                                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                }`}
                                                            title={item.isLocked ? 'Furo Natiijooyinka' : 'Xiro Natiijooyinka'}
                                                        >
                                                            {item.isLocked ? (
                                                                <Lock className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <Unlock className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </>
                ) : error?.isLocked ? (
                    <div className="bg-white p-20 rounded-3xl border border-amber-100 text-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400" />
                        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <Lock className="w-12 h-12 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">Results Are Locked</h2>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
                            {error.message}
                        </p>
                        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <ShieldAlert className="w-3 h-3" /> System Security Notification
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white p-20 rounded-3xl border border-red-50 text-center shadow-sm">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-red-800 mb-2">An Error Occurred</h2>
                        <p className="text-red-500 max-w-sm mx-auto font-medium">
                            {error.message}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-3xl border border-gray-100 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Exam results are not available for the selected class,
                            period, or term.
                        </p>
                    </div>
                )
            }

            {/* General Lock Buttons at the bottom */}
            {!isStudent && (
                <div className="mt-12 pt-8 border-t border-gray-100 no-print">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        {/* Exam Type Global Lock */}
                        {filter.examType && (
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Exam Status (Module Lock)</p>
                                <button
                                    onClick={() => handleToggleGlobalLock(filter.examType)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase transition-all shadow-md ${examTypes.find(t => t._id === filter.examType)?.isResultsLocked
                                        ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
                                        : 'bg-[#2563EB] text-white border border-blue-700 hover:bg-[#1d4ed8]'
                                        }`}
                                >
                                    {examTypes.find(t => t._id === filter.examType)?.isResultsLocked ? (
                                        <><Unlock className="w-4 h-4" /> Open Exam (Global)</>
                                    ) : (
                                        <><Lock className="w-4 h-4" /> Lock Exam (Global)</>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Bulk Students Lock */}
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Student Results (Bulk Student Lock)</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleBulkStudentLock(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-sm font-black uppercase hover:bg-red-100 transition-all shadow-sm"
                                >
                                    <Lock className="w-4 h-4" /> Lock All
                                </button>
                                <button
                                    onClick={() => handleBulkStudentLock(false)}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-black uppercase hover:bg-emerald-100 transition-all shadow-sm"
                                >
                                    <Unlock className="w-4 h-4" /> Unlock All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentResults;
