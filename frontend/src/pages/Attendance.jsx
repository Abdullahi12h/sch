import { useState, useEffect } from 'react';
import { Users, Clock, Edit2, Eye, Save, Printer, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';
import { classesData } from '../data/mockData';

const Attendance = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(user?.role === 'student' ? 'MY ATTENDANCE' : 'STUDENT ATTENDANCE');
    const [selectedClass, setSelectedClass] = useState('Class 4');
    const [selectedPeriod, setSelectedPeriod] = useState('Period 1');
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [availableClasses, setAvailableClasses] = useState([]);
    const [availablePeriods, setAvailablePeriods] = useState(['Period 1', 'Period 2', 'Period 3']);
    const { selectedYear, academicYears: availableYears, setSelectedYear } = useAcademicYear();
    const [selectedMonth, setSelectedMonth] = useState('All');

    // Bilaha sannad dugsiyeedka (Sep → Jun)
    const academicMonths = [
        { label: 'Dhammaan Billaha', value: 'All' },
        { label: 'September', value: '09' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' },
        { label: 'January', value: '01' },
        { label: 'February', value: '02' },
        { label: 'March', value: '03' },
        { label: 'April', value: '04' },
        { label: 'May', value: '05' },
        { label: 'June', value: '06' },
    ];

    const [students, setStudents] = useState([]);
    const [attendanceStates, setAttendanceStates] = useState({}); // { studentId: { status, reason } }
    const [absentStudents, setAbsentStudents] = useState([]);
    const [notTakenStudents, setNotTakenStudents] = useState([]);
    const [myHistory, setMyHistory] = useState([]);
    const [myStats, setMyStats] = useState({ weekPresent: 0, monthPresent: 0, totalAbsent: 0, totalLate: 0 });

    // Edit tab states
    const [selectedStudentEdit, setSelectedStudentEdit] = useState('');

    const statusConfig = {
        'P': { label: 'Present', color: 'bg-green-100 text-green-700 ring-green-600/20 hover:bg-green-200' },
        'A': { label: 'Absent', color: 'bg-red-100 text-red-700 ring-red-600/20 hover:bg-red-200' },
        'S': { label: 'Sick', color: 'bg-amber-100 text-amber-700 ring-amber-600/20 hover:bg-amber-200' },
        'V': { label: 'Vacation', color: 'bg-blue-100 text-blue-700 ring-blue-600/20 hover:bg-blue-200' },
        'L': { label: 'Late', color: 'bg-amber-100 text-amber-700 ring-amber-600/20 hover:bg-amber-200' },
        'N': { label: 'None', color: 'bg-slate-100 text-slate-700 ring-slate-600/20 hover:bg-slate-200' }
    };

    // ── Soo qaado sannadaha diiwaansan database-ka ───────────────────────────
    useEffect(() => {
        if (!user) return;
        const fetchFilters = async () => {
            try {
                const authConfig = { headers: { Authorization: `Bearer ${user.token}` } };

                // Fetch Academic Years removed as it's now handled by context

                // Fetch Grades
                const { data: grades } = await axios.get('/api/grades', authConfig);
                let finalClasses = grades.map(g => g.name);

                if (user.role === 'teacher') {
                    const { data: teachers } = await axios.get('/api/teachers', authConfig);
                    const teacherProfile = teachers.find(t => t.username === user.username);
                    if (teacherProfile && teacherProfile.assignedClasses) {
                        const assignedNames = teacherProfile.assignedClasses.split(',').map(s => s.trim());
                        finalClasses = finalClasses.filter(name => assignedNames.includes(name));
                    }
                }

                setAvailableClasses(finalClasses);
                if (finalClasses.length > 0 && !finalClasses.includes(selectedClass)) {
                    setSelectedClass(finalClasses[0]);
                }

                // Fetch Periods
                const { data: periods } = await axios.get('/api/periods', authConfig);
                if (periods && periods.length > 0) {
                    const activePeriods = periods.filter(p => p.status === 'Active' && !p.isBreak).map(p => p.name);
                    setAvailablePeriods(activePeriods);
                    if (activePeriods.length > 0 && !activePeriods.includes(selectedPeriod)) {
                        setSelectedPeriod(activePeriods[0]);
                    }
                }

            } catch (err) {
                console.error('Error fetching filters:', err);
                setAvailableClasses([]);
            }
        };
        fetchFilters();
    }, [user]);

    const fetchData = async () => {
        if (!user || !selectedYear) return;
        setLoading(true);
        try {
            const authConfig = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // If student, fetch their history and stop
            if (user.role === 'student') {
                const { data: allStudents } = await axios.get('/api/students', authConfig);
                const me = allStudents.find(s => s.username === user.username);
                if (me) {
                    const { data: history } = await axios.get(`/api/attendance?studentId=${me.id}&academicYear=${selectedYear}`, authConfig);
                    setMyHistory(history);

                    // Calculate stats
                    const now = new Date();
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start

                    const stats = {
                        monthPresent: history.filter(h => new Date(h.date) >= startOfMonth && h.status === 'P').length,
                        weekPresent: history.filter(h => new Date(h.date) >= startOfWeek && h.status === 'P').length,
                        totalAbsent: history.filter(h => h.status === 'A').length,
                        totalLate: history.filter(h => h.status === 'L').length
                    };
                    setMyStats(stats);
                }
                setLoading(false);
                return;
            }

            // For admins/teachers - Fetch students for selected grade with Enrolled status
            const { data: filtered } = await axios.get(`/api/students?grade=${selectedClass}&status=Enrolled`, authConfig);
            setStudents(filtered);

            const { data: existingAttendance } = await axios.get(
                `/api/attendance?grade=${selectedClass}&date=${date}&period=${selectedPeriod}&academicYear=${selectedYear}`,
                authConfig
            );

            const newStates = {};
            filtered.forEach(s => {
                const existing = existingAttendance.find(a => a.studentId === s.id);
                newStates[s.id] = {
                    status: existing ? existing.status : 'P',
                    reason: existing ? existing.reason : ''
                };
            });
            setAttendanceStates(newStates);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAbsents = async () => {
        if (!user) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/attendance/absents/${selectedClass}?academicYear=${selectedYear}`, config);
            setAbsentStudents(data);
        } catch (error) {
            console.error('Error fetching absents:', error);
        }
    };

    const fetchNotTaken = async () => {
        if (!user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(
                `/api/attendance/not-taken/${selectedClass}?date=${date}&period=${selectedPeriod}&academicYear=${selectedYear}`,
                config
            );
            setNotTakenStudents(data);
        } catch (error) {
            console.error('Error fetching not-taken students:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'STUDENT ATTENDANCE' || activeTab === 'MY ATTENDANCE') {
            fetchData();
        } else if (activeTab === 'STUDENT ABSENTS') {
            fetchAbsents();
        } else if (activeTab === 'NOT TAKEN') {
            fetchNotTaken();
        }
    }, [selectedClass, date, selectedPeriod, selectedYear, activeTab, user]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceStates(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleReasonChange = (studentId, reason) => {
        setAttendanceStates(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], reason }
        }));
    };

    const handleSaveAttendance = async () => {
        if (!user) return;
        setLoading(true);
        setMessage('');
        try {
            const attendanceData = students.map(s => ({
                studentId: s.id,
                studentName: s.name,
                grade: selectedClass,
                period: selectedPeriod,
                academicYear: selectedYear,
                date: date,
                status: attendanceStates[s.id]?.status || 'P',
                reason: attendanceStates[s.id]?.reason || ''
            }));

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.post('/api/attendance', { attendanceData }, config);
            setMessage('Waa lagu guulaystay keydinta xaadirinta!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving attendance:', error);
            setMessage('Qalad ayaa dhacay markii xogta la keydinayay.');
        } finally {
            setLoading(false);
        }
    };

    const renderStudentAttendance = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-200 no-print">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Sannad Dugsiyeedfa</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                        >
                            {availableYears.map(y => <option key={y._id || y.name} value={y.name}>{y.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Fasalka</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                        >
                            {availableClasses.length > 0 ? availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>) : <option value="">No Classes Assigned</option>}
                        </select>
                    </div>

                    <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Xilliga (Period)</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                        >
                            {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Taariikhda</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={user?.role === 'teacher'}
                            className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm ${user?.role === 'teacher' ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'}`}
                        />
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium tracking-tight">Calaamadi Ardayda</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-semibold text-slate-700">{students.length} Arday</span>
                        </div>
                    </div>
                    {message && (
                        <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold animate-in fade-in slide-in-from-left-2 items-center flex gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            {message}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 no-print">
                    <button
                        onClick={() => window.print()}
                        className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 uppercase shadow-sm"
                    >
                        <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                    <button onClick={fetchData} className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 uppercase">
                        <Eye className="h-3.5 w-3.5" /> Soo Bandhig
                    </button>
                    <button
                        onClick={handleSaveAttendance}
                        disabled={loading}
                        className="px-6 py-2.5 text-xs font-bold text-white bg-[#2563EB] rounded-xl hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 uppercase tracking-wide"
                    >
                        <Save className="h-3.5 w-3.5" /> {loading ? 'Keydinaya...' : 'Keydi Xaadirinta'}
                    </button>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left first:pl-8">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ardayga</span>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sababta</span>
                            </th>
                            <th className="px-6 py-4 text-center last:pr-8">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Xaaladda</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.length > 0 ? students.map((s) => (
                            <tr key={s.id} className="group hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 first:pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold group-hover:bg-white transition-colors border border-transparent group-hover:border-blue-100 uppercase text-xs">
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 leading-none mb-1">{s.name}</p>
                                            <p className="text-[11px] text-slate-400 font-medium">{s.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        placeholder="Ku dar sabab hadiiloo baahdo..."
                                        value={attendanceStates[s.id]?.reason || ''}
                                        onChange={(e) => handleReasonChange(s.id, e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none text-slate-600 text-xs py-1 transition-all placeholder:text-slate-300"
                                    />
                                </td>
                                <td className="px-6 py-4 last:pr-8">
                                    <div className="flex items-center justify-center gap-1.5 overflow-hidden">
                                        {Object.entries(statusConfig).map(([key, config]) => {
                                            const isActive = attendanceStates[s.id]?.status === key;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => handleStatusChange(s.id, key)}
                                                    title={config.label}
                                                    className={`
                                                        w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center
                                                        ${isActive
                                                            ? `${config.color.split(' ')[0]} ${config.color.split(' ')[1]} ring-2 ring-blue-500 scale-110 shadow-sm z-10`
                                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                        }
                                                    `}
                                                >
                                                    {key}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                            <Users className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-400 tracking-tight">Fasalkan weli wax arday ah kuma jiraan.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderStudentAbsents = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 space-y-1.5 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sannad Dugsiyeedfa</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                    >
                        {availableYears.map(y => <option key={y._id || y.name} value={y.name}>{y.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dooro Fasalka</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all shadow-sm"
                    >
                        {availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto no-print">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 uppercase shadow-sm"
                    >
                        <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                    <button
                        onClick={fetchAbsents}
                        className="flex-1 md:flex-none px-8 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 uppercase tracking-wide"
                    >
                        HUBI MAQNAANSHAHA
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="w-full overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Magaca Ardayga</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefoonka</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fasalka</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Maqnaanshaha</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {absentStudents.length > 0 ? absentStudents.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 font-medium">#{s.id}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700">{s.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{s.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px] uppercase">
                                            {s.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`w-8 h-8 inline-flex items-center justify-center rounded-lg font-black text-xs ${s.absences > 10 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {s.absences}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all active:scale-90 inline-flex items-center justify-center">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <p className="text-sm font-semibold text-slate-400">Ma jiraan macluumaad maqnaansho ah oola helay.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const filteredHistory = selectedMonth === 'All'
        ? myHistory
        : myHistory.filter(item => {
            if (!item.date) return false;
            const month = item.date.slice(5, 7);
            return month === selectedMonth;
        });

    const renderMyAttendance = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase">My Attendance History</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                        <p className="text-xs text-slate-500 font-medium whitespace-nowrap">View your daily records for</p>
                        <select
                            value={selectedYear}
                            onChange={(e) => { setSelectedYear(e.target.value); setSelectedMonth('All'); }}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-emerald-600 outline-none hover:border-emerald-300"
                        >
                            {availableYears.map(y => <option key={y._id || y.name} value={y.name}>{y.name}</option>)}
                        </select>
                        <span className="text-slate-300 text-xs">|</span>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-emerald-600 outline-none hover:border-emerald-300"
                        >
                            {academicMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 no-print"><Printer className="h-4 w-4" /> Print</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white no-print">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Week-kan</span>
                    <span className="text-2xl font-black text-blue-700 leading-none">{myStats.weekPresent}</span>
                    <span className="text-[10px] font-bold text-blue-500 mt-1 uppercase">Joogay</span>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Bishaan</span>
                    <span className="text-2xl font-black text-blue-700 leading-none">{myStats.monthPresent}</span>
                    <span className="text-[10px] font-bold text-blue-500 mt-1 uppercase">Joogay</span>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Maqnaansho</span>
                    <span className="text-2xl font-black text-red-700 leading-none">{myStats.totalAbsent}</span>
                    <span className="text-[10px] font-bold text-red-500 mt-1 uppercase">Maalmo</span>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Soo Daahay</span>
                    <span className="text-2xl font-black text-blue-700 leading-none">{myStats.totalLate}</span>
                    <span className="text-[10px] font-bold text-blue-500 mt-1 uppercase">Jeer</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Period</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Note / Reason</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredHistory.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-700">{item.date}</td>
                                <td className="px-6 py-4 text-slate-500 font-medium">{item.period}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${statusConfig[item.status]?.color || ''}`}>
                                        {statusConfig[item.status]?.label || item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs italic">{item.reason || '—'}</td>
                            </tr>
                        ))}
                        {filteredHistory.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                                {myHistory.length === 0 ? 'No history found.' : `Xog kuma jirto ${academicMonths.find(m => m.value === selectedMonth)?.label || ''}.`}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAttendanceEdit = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
                    <Edit2 className="h-10 w-10 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Wax ka bedelka Xaadirinta</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto font-medium">Qaybtan waxaad kaga bedeli kartaa xogta horey loo geliyey ee arday gaar ah.</p>
                </div>

                <div className="max-w-md mx-auto pt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        >
                            {availableYears.map(y => <option key={y._id || y.name} value={y.name}>{y.name}</option>)}
                        </select>
                        <select
                            value={selectedStudentEdit}
                            onChange={(e) => setSelectedStudentEdit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        >
                            <option value="">Dooro Ardayga...</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <button className="w-full py-4 text-xs font-black text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-all active:scale-95 uppercase tracking-widest">
                        Soo saar xogta
                    </button>
                </div>
            </div>
        </div>
    );

    const renderNotTaken = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Filters */}
            <div className="p-6 bg-slate-50/50 border-b border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sannad Dugsiyeedfa</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                        >
                            {availableYears.map(y => <option key={y._id || y.name} value={y.name}>{y.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fasalka</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                        >
                            {availableClasses.length > 0 ? availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>) : <option value="">No Classes Assigned</option>}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Xilliga (Period)</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                        >
                            {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Taariikhda</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Stats banner */}
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Xaadirinta La Gelinwaa</p>
                        <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                            {notTakenStudents.length === 0
                                ? `Dhammaan ardayda ${selectedClass} xaadirinta waa la geliyey ✓`
                                : `${notTakenStudents.length} arday xaadirinta kuma jiraan – ${selectedClass} – ${selectedPeriod} – ${date}`
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchNotTaken}
                        className="px-5 py-2 text-xs font-bold text-amber-700 bg-amber-100 rounded-xl hover:bg-amber-200 transition-all active:scale-95 uppercase tracking-wide flex items-center gap-2"
                    >
                        <Eye className="h-3.5 w-3.5" /> Cusboonaysii
                    </button>
                    {notTakenStudents.length > 0 && (
                        <button
                            onClick={() => setActiveTab('STUDENT ATTENDANCE')}
                            className="px-5 py-2 text-xs font-bold text-white bg-[#2563EB] rounded-xl hover:bg-[#1d4ed8] transition-all active:scale-95 uppercase tracking-wide flex items-center gap-2"
                        >
                            <CheckCircle className="h-3.5 w-3.5" /> Geli Xaadirinta
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left first:pl-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ardayga</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefoon</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fasalka</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Xaalad</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {notTakenStudents.length > 0 ? notTakenStudents.map((s, idx) => (
                            <tr key={s.id} className="group hover:bg-amber-50/40 transition-colors">
                                <td className="px-6 py-4 first:pl-8 text-slate-400 font-bold text-xs">{idx + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 font-black text-xs border border-amber-100 uppercase">
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 leading-none mb-0.5">{s.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">ID: #{s.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-medium text-xs">{s.phone || '—'}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px] uppercase">{s.grade}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full font-black text-[10px] uppercase">
                                        <AlertCircle className="h-3 w-3" /> Lama Gelin
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-400 tracking-tight">Dhammaan ardayda xaadirinta waa la geliyey! ✓</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1500px] mx-auto pb-10 px-4 lg:px-6">
            <style>
                {`
                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { 
                        background: white !important; 
                        font-size: 10pt !important; 
                        color: black !important; 
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                    .p-6, .px-6, .px-8, .pt-10, .pb-10 { padding: 0 !important; }
                    .mx-auto { margin: 0 !important; max-width: 100% !important; }
                    .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; border: none !important; }
                    .rounded-2xl, .rounded-xl, .rounded-t-2xl { border-radius: 0 !important; }
                    
                    /* Table Styling for Print */
                    .overflow-x-auto { overflow: visible !important; }
                    table { width: 100% !important; border-collapse: collapse !important; margin-top: 5mm; }
                    th, td { 
                        border: 0.5pt solid #000 !important; 
                        padding: 6px 4px !important; 
                        text-align: left !important; 
                        font-size: 9pt !important;
                        color: black !important;
                    }
                    th { background-color: #f2f2f2 !important; font-weight: bold !important; text-transform: uppercase !important; }
                    
                    .print-header { 
                        display: block !important; 
                        margin-bottom: 15px; 
                        border-bottom: 2pt solid #000; 
                        padding-bottom: 10px; 
                    }
                    .bg-slate-50, .bg-slate-50\/50, .bg-white, .bg-indigo-50\/30 { background: transparent !important; }
                    
                    /* Maintain colors for status indicators in print */
                    .bg-emerald-100 { background-color: #ecfdf5 !important; }
                    .bg-rose-100 { background-color: #fff1f2 !important; }
                    .bg-amber-100 { background-color: #fffbeb !important; }
                    .bg-blue-100 { background-color: #eff6ff !important; }
                }
                .print-header { display: none; }
                .print-only { display: none; }
                `}
            </style>

            {/* Print Header */}
            <div className="print-header">
                <h1 className="text-2xl font-black text-gray-900 uppercase">Xaadirinta Ardayda</h1>
                <div className="flex gap-6 mt-2 text-sm font-bold text-gray-600">
                    <p>Fasalka: {selectedClass}</p>
                    <p>Xilliga: {selectedPeriod}</p>
                    <p>Taariikhda: {date}</p>
                </div>
            </div>
            {/* Header / Tabs - Improved for mobile with horizontal scrolling */}
            <div className="flex bg-slate-900 text-white text-[10px] md:text-[11px] font-black rounded-t-2xl shadow-lg border-b border-slate-800 overflow-x-auto no-scrollbar no-print">
                <div className="flex min-w-max">
                    {user?.role !== 'student' && (
                        <button
                            onClick={() => setActiveTab('STUDENT ATTENDANCE')}
                            className={`flex items-center gap-2 px-6 md:px-8 py-4 transition-all tracking-widest whitespace-nowrap ${activeTab === 'STUDENT ATTENDANCE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                            <Users className="h-4 w-4" /> XAADIRINTA ARDAYDA
                        </button>
                    )}

                    {user?.role === 'student' && (
                        <button
                            onClick={() => setActiveTab('MY ATTENDANCE')}
                            className={`flex items-center gap-2 px-6 md:px-8 py-4 transition-all tracking-widest whitespace-nowrap ${activeTab === 'MY ATTENDANCE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                            <Clock className="h-4 w-4" /> MY ATTENDANCE
                        </button>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <button
                                onClick={() => setActiveTab('STUDENT ABSENTS')}
                                className={`flex items-center gap-2 px-6 md:px-8 py-4 transition-all tracking-widest whitespace-nowrap ${activeTab === 'STUDENT ABSENTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                                <Clock className="h-4 w-4" /> MAQNAANSHAHA
                            </button>
                            <button
                                onClick={() => setActiveTab('NOT TAKEN')}
                                className={`flex items-center gap-2 px-6 md:px-8 py-4 transition-all tracking-widest whitespace-nowrap ${activeTab === 'NOT TAKEN' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                                <AlertCircle className="h-4 w-4" /> LAMA GELIN
                            </button>
                            <button
                                onClick={() => setActiveTab('ATTENDANCE EDIT')}
                                className={`flex items-center gap-2 px-6 md:px-8 py-4 transition-all tracking-widest whitespace-nowrap ${activeTab === 'ATTENDANCE EDIT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                                <Edit2 className="h-4 w-4" /> WAX KA BEDEL
                            </button>
                        </>
                    )}

                    {user?.role === 'teacher' && (
                        <button
                            onClick={() => setActiveTab('NOT TAKEN')}
                            className={`flex items-center gap-2 px-6 md:px-8 py-4 transition-all tracking-widest whitespace-nowrap ${activeTab === 'NOT TAKEN' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                            <AlertCircle className="h-4 w-4" /> LAMA GELIN
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="mt-0">
                {activeTab === 'STUDENT ATTENDANCE' && renderStudentAttendance()}
                {activeTab === 'MY ATTENDANCE' && renderMyAttendance()}
                {activeTab === 'STUDENT ABSENTS' && renderStudentAbsents()}
                {activeTab === 'NOT TAKEN' && renderNotTaken()}
                {activeTab === 'ATTENDANCE EDIT' && renderAttendanceEdit()}
            </div>
        </div>
    );
};

export default Attendance;
