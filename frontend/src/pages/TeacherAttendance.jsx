import { useState, useEffect } from 'react';
import { UserCheck, AlertCircle, Calendar, Clock, Search, Check, X, FileText, TrendingUp, TrendingDown, Star, AlertTriangle, Printer } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';

const statusStyle = {
    P: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    A: 'bg-red-100 text-red-700 hover:bg-red-200',
    L: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
};

const TeacherAttendance = () => {
    const { user } = useAuth();
    const { selectedYear, academicYears, setSelectedYear } = useAcademicYear();
    const [teachers, setTeachers] = useState([]);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [search, setSearch] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const fetchTeachers = async () => {
        try {
            const { data } = await axios.get('/api/teachers?status=Active', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setTeachers(data);
            return data;
        } catch (error) {
            console.error('Error fetching teachers:', error);
            return [];
        }
    };

    const fetchAttendance = async (currentDate) => {
        try {
            const { data } = await axios.get(`/api/teacher-attendance?date=${currentDate}&academicYear=${selectedYear}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return data;
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return [];
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`/api/teacher-attendance/stats?academicYear=${selectedYear}&period=${period}&date=${date}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const teacherList = await fetchTeachers();
            const attendanceList = await fetchAttendance(date);

            // Merge attendance with teacher list
            const initialRows = teacherList.map(teacher => {
                const record = attendanceList.find(a => a.teacherId === teacher.id);
                return {
                    teacherId: teacher.id,
                    teacherName: teacher.name,
                    department: teacher.subject || 'Staff',
                    status: record ? record.status : 'A', // Default to Absent until clocked in or marked
                    reason: record ? record.reason : '',
                    checkIn: record ? record.checkIn : null,
                    checkOut: record ? record.checkOut : null,
                };
            });
            setAttendanceRows(initialRows);
            await fetchStats();
            setLoading(false);
        };
        loadData();
    }, [date, selectedYear, period]);

    const filtered = attendanceRows.filter(item =>
        item.teacherName.toLowerCase().includes(search.toLowerCase())
    );

    const handleStatusUpdate = (teacherId, newStatus) => {
        setAttendanceRows(attendanceRows.map(row =>
            row.teacherId === teacherId ? { ...row, status: newStatus } : row
        ));
    };

    const handleClockIn = async (teacherId, teacherName) => {
        if (!selectedYear || selectedYear === 'All') {
            alert('Fadlan dooro sanad dugsiyeedka (Please select an academic year)');
            return;
        }

        try {
            const { data } = await axios.post('/api/teacher-attendance/clock-in', 
                { teacherId, teacherName, academicYear: selectedYear },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAttendanceRows(attendanceRows.map(row =>
                row.teacherId === teacherId ? { ...row, checkIn: data.checkIn, status: data.status } : row
            ));
            alert(`${teacherName} clocked in successfully! Status: ${data.status === 'P' ? 'Present' : 'Late'}`);
        } catch (error) {
            console.error('Error clocking in:', error);
            alert(error.response?.data?.message || 'Failed to clock in');
        }
    };

    const handleClockOut = async (teacherId, teacherName) => {
        if (!selectedYear || selectedYear === 'All') {
            alert('Fadlan dooro sanad dugsiyeedka (Please select an academic year)');
            return;
        }

        try {
            const { data } = await axios.post('/api/teacher-attendance/clock-out', 
                { teacherId, academicYear: selectedYear },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAttendanceRows(attendanceRows.map(row =>
                row.teacherId === teacherId ? { ...row, checkOut: data.checkOut } : row
            ));
            alert(`${teacherName} clocked out successfully!`);
        } catch (error) {
            console.error('Error clocking out:', error);
            alert(error.response?.data?.message || 'Failed to clock out');
        }
    };

    const handleSave = async () => {
        if (!selectedYear || selectedYear === 'All') {
            alert('Fadlan dooro sanad dugsiyeedka (Please select an academic year)');
            return;
        }

        try {
            const attendanceData = attendanceRows.map(row => ({
                ...row,
                date,
                academicYear: selectedYear
            }));
            await axios.post('/api/teacher-attendance', 
                { attendanceData },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            alert('Attendance saved successfully!');
            fetchStats();
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance');
        }
    };

    const markAllPresent = () => {
        setAttendanceRows(attendanceRows.map(row => ({ ...row, status: 'P' })));
    };

    return (
        <div className="max-w-[1500px] mx-auto pb-10 px-4 lg:px-6">
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
                    .p-6, .px-6, .pb-10, .max-w-7xl { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
                    .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; border: none !important; }
                    .rounded-2xl, .rounded-xl, .rounded-3xl { border-radius: 0 !important; }
                    
                    /* Table Styling */
                    .overflow-x-auto { overflow: visible !important; }
                    table { width: 100% !important; border-collapse: collapse !important; border: 0.5pt solid black !important; }
                    th, td { border: 0.5pt solid black !important; padding: 4px !important; text-align: left !important; font-size: 7.5pt !important; }
                    th { background-color: #f2f2f2 !important; font-weight: bold !important; text-transform: uppercase !important; }
                    
                    .print-header { 
                        display: block !important; 
                        margin-bottom: 20px; 
                        border-bottom: 2pt solid #000; 
                        padding-bottom: 10px; 
                    }
                    .bg-emerald-100 { background-color: #ecfdf5 !important; }
                    .bg-red-100 { background-color: #fef2f2 !important; }
                    .bg-amber-100 { background-color: #fffbeb !important; }
                }
                .print-header { display: none; }
                .print-only { display: none; }
                `}
            </style>

            {/* Print Header */}
            <div className="print-header">
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase">Warbixinta Xaadirinta Shaqaalaha</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Employee Attendance Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-gray-900">{selectedYear}</p>
                        <p className="text-xs font-bold text-gray-600 uppercase">Xilliga: {period === 'daily' ? 'Maalinle' : period === 'weekly' ? 'Isbuucle' : period === 'monthly' ? 'Bishle' : 'Sanadle'}</p>
                    </div>
                </div>
                <div className="flex gap-8 mb-4 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                    <p>Taariikhda: {date}</p>
                    <p>Wadarta Shaqaalaha: {teachers.length}</p>
                    <p>Xaadir: {stats?.present || 0}</p>
                    <p>Maqan: {stats?.absent || 0}</p>
                    <p>Soo Daahay: {stats?.late || 0}</p>
                </div>
            </div>
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-2 sm:px-0">
                <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Employee Attendance History</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 uppercase font-black tracking-widest">Employee tracking and statistics</p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                    <button
                        onClick={() => window.print()}
                        className="no-print flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <select
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-purple-600 font-black outline-none cursor-pointer hover:border-purple-600 no-print shadow-sm"
                    >
                        <option value="daily">Maalin (Daily)</option>
                        <option value="weekly">Isbuuc (Weekly)</option>
                        <option value="monthly">Bil (Monthly)</option>
                        <option value="yearly">Sannad (Yearly)</option>
                    </select>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-blue-600 font-black outline-none cursor-pointer hover:border-[#2563EB] no-print shadow-sm"
                    >
                        {academicYears.map(y => <option key={y._id || y.name} value={y.name}>{y.name}</option>)}
                    </select>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 bg-white font-bold outline-none cursor-pointer hover:border-[#2563EB] no-print shadow-sm"
                    />
                    <button
                        onClick={handleSave}
                        className="no-print flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase hover:bg-[#1d4ed8] transition-all shadow-sm active:scale-95"
                    >
                        <Check className="h-4 w-4" /> Save
                    </button>
                </div>
            </div>



            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between bg-gray-50/50 no-print">
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-full lg:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all">
                            <Search className="h-4 w-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search employee by name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Quick Actions:</span>
                            <button
                                onClick={markAllPresent}
                                className="px-4 py-2 text-xs font-bold bg-white text-[#2563EB] rounded-xl border border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                            >
                                Dhammaan Jooga (Mark All Present)
                            </button>
                        </div>
                    </div>

                    {/* Printable Report Table */}
                    <div className="print-only mt-8 pb-8">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left border">Magaca Shaqaalaha</th>
                                    <th className="p-2 text-left border">Saacada Bilaabay (Avg)</th>
                                    <th className="p-2 text-left border">Saacada Dhameeyey (Avg)</th>
                                    <th className="p-2 text-left border">Saacado Shaqeeyey</th>
                                    <th className="p-2 text-center border">Ku Imaaday Xilliga (P)</th>
                                    <th className="p-2 text-center border">Soo Daahay (L)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.stats?.map((s) => (
                                    <tr key={s.teacherId}>
                                        <td className="p-2 border font-bold">{s.teacherName}</td>
                                        <td className="p-2 border">{s.avgCheckInMinutes < 1440 ? new Date(s.avgCheckInMinutes * 60 * 1000).toISOString().substring(11, 16) : '--:--'}</td>
                                        <td className="p-2 border">{s.avgCheckOutMinutes > 0 ? new Date(s.avgCheckOutMinutes * 60 * 1000).toISOString().substring(11, 16) : '--:--'}</td>
                                        <td className="p-2 border">{s.hoursWorked} Saacadood</td>
                                        <td className="p-2 border text-center">{s.presentCount}</td>
                                        <td className="p-2 border text-center">{s.lateCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="overflow-x-auto no-print">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 text-left">Teacher Name</th>
                                    <th className="px-6 py-4 text-left">Department</th>
                                    <th className="px-6 py-4 text-left no-print">Internal Actions</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-left">Reason / Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">Loading attendance data...</td></tr>
                                ) : filtered.map((s) => (
                                    <tr key={s.teacherId} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{s.teacherName}</td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{s.department}</td>
                                        <td className="px-6 py-4 no-print">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    {!s.checkIn ? (
                                                        <button
                                                            onClick={() => handleClockIn(s.teacherId, s.teacherName)}
                                                            className="px-4 py-2 bg-linear-to-b from-red-500 via-red-600 to-red-800 text-white rounded-full border border-red-900 shadow-[0_4px_10px_rgba(220,38,38,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] hover:brightness-110 active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"
                                                        >
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                                            In School
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                                                            <Check className="h-3 w-3" /> {new Date(s.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}

                                                    {!s.checkOut && s.checkIn && (
                                                        <button
                                                            onClick={() => handleClockOut(s.teacherId, s.teacherName)}
                                                            className="px-4 py-2 bg-linear-to-b from-amber-400 via-amber-600 to-amber-700 text-white rounded-full border border-amber-800 shadow-[0_4px_10px_rgba(217,119,6,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] hover:brightness-110 active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"
                                                        >
                                                            Out School
                                                        </button>
                                                    )}
                                                    {s.checkOut && (
                                                        <span className="text-xs text-amber-600 font-bold flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                                            <Clock className="h-3 w-3" /> {new Date(s.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 min-w-[280px]">
                                            <div className="flex gap-1.5">
                                                {[
                                                    { label: 'Jooga (Present)', val: 'P' },
                                                    { label: 'Maqan (Absent)', val: 'A' },
                                                    { label: 'Daahay (Late)', val: 'L' }
                                                ].map(st => (
                                                    <button
                                                        key={st.val}
                                                        onClick={() => handleStatusUpdate(s.teacherId, st.val)}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${s.status === st.val ? statusStyle[st.val] + ' border-transparent shadow-sm scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                                                    >
                                                        {s.status === st.val && <Check className="h-3 w-3 inline mr-1" />}
                                                        {st.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                placeholder="Add a note..."
                                                value={s.reason}
                                                onChange={(e) => {
                                                    const newRows = [...attendanceRows];
                                                    const index = newRows.findIndex(r => r.teacherId === s.teacherId);
                                                    newRows[index].reason = e.target.value;
                                                    setAttendanceRows(newRows);
                                                }}
                                                className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-green-500 outline-none py-1 text-xs text-gray-500 transition-all"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filtered.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-gray-200" />
                                            <p>No teachers matching "{search}" found.</p>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
            </div>


            </div>
    );
};

export default TeacherAttendance;
