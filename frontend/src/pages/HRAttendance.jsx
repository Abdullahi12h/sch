import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';
import { 
    Clock, 
    Calendar, 
    Power, 
    CheckCircle2, 
    XCircle, 
    TrendingUp, 
    List, 
    History,
    AlertCircle,
    MapPin,
    ShieldCheck,
    ArrowRightLeft,
    Timer,
    ClipboardList
} from 'lucide-react';

const HRAttendance = () => {
    const { user } = useAuth();
    const { selectedYear, academicYears } = useAcademicYear();
    const [loading, setLoading] = useState(false);
    const [attendanceList, setAttendanceList] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [todayRecord, setTodayRecord] = useState(null);
    const [attendanceConfig, setAttendanceConfig] = useState(null);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchMyAttendance = async () => {
        try {
            setLoading(true);
            const academicYear = selectedYear === 'All' ? (academicYears.find(y => y.status === 'Active')?.name || '') : selectedYear;
            
            const [attRes, configRes] = await Promise.all([
                axios.get(`/api/teacher-attendance/my-attendance?academicYear=${academicYear}`, config),
                axios.get('/api/attendance-config', config)
            ]);
            
            setAttendanceList(attRes.data);
            setAttendanceConfig(configRes.data);
            
            // Check for today's record
            const today = new Date().toISOString().split('T')[0];
            const record = attRes.data.find(r => r.date === today);
            setTodayRecord(record);
        } catch (error) {
            console.error('Error fetching attendance info:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyAttendance();
    }, [selectedYear]);

    const handleClockIn = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const academicYear = selectedYear === 'All' ? (academicYears.find(y => y.status === 'Active')?.name || '') : selectedYear;
            await axios.post('/api/teacher-attendance/clock-in', { 
                teacherId: user.teacherData?.id || user.id || user._id, 
                teacherName: user.name, 
                academicYear 
            }, config);
            alert('Clock-In Successful!');
            fetchMyAttendance();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Error occurred during clock-in';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const academicYear = selectedYear === 'All' ? (academicYears.find(y => y.status === 'Active')?.name || '') : selectedYear;
            await axios.post('/api/teacher-attendance/clock-out', { 
                teacherId: user.teacherData?.id || user.id || user._id, 
                academicYear 
            }, config);
            alert('Clock-Out Successful!');
            fetchMyAttendance();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Error occurred during clock-out';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
            {/* Header Section */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        <ShieldCheck className="h-8 w-8 sm:h-9 sm:h-9 text-blue-600" /> HR Attendance Portal
                    </h1>
                    <p className="text-gray-500 mt-2 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] ml-1">Staff Time Tracking & Activity Log</p>
                </div>
                
                <div className="relative z-10 bg-gray-50/50 px-5 sm:px-8 py-4 rounded-[1.5rem] border border-gray-100 flex items-center justify-between sm:justify-end gap-5 sm:gap-8 backdrop-blur-sm">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                        <p className="text-[12px] sm:text-sm font-black text-gray-900 uppercase">{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tighter tabular-nums">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* Role-Specific Shift Overview */}
            {attendanceConfig && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 no-print">
                    {/* If HR, show Cleaning Shift */}
                    {user.role === 'hr' || user.role === 'admin' ? (
                        <>
                            <div className="bg-emerald-600 rounded-3xl p-6 flex items-center gap-6 shadow-xl shadow-emerald-100 text-white group hover:scale-[1.02] transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                    <Clock className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest leading-none mb-1.5">Cleaning In (Shift)</p>
                                    <p className="text-3xl font-black tracking-tight">{attendanceConfig.cleaningIn || '07:30'}</p>
                                </div>
                            </div>
                            <div className="bg-rose-600 rounded-3xl p-6 flex items-center gap-6 shadow-xl shadow-rose-100 text-white group hover:scale-[1.02] transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                    <Clock className="h-7 w-7 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] text-rose-100 font-bold uppercase tracking-widest leading-none mb-1.5">Cleaning Out (Shift)</p>
                                    <p className="text-3xl font-black tracking-tight">{attendanceConfig.cleaningOut || '16:00'}</p>
                                </div>
                            </div>
                        </>
                    ) : null}

                    {/* If Teacher, show Academic Shift */}
                    {user.role === 'teacher' || user.role === 'admin' ? (
                        <>
                            <div className="bg-blue-600 rounded-3xl p-6 flex items-center gap-6 shadow-xl shadow-blue-100 text-white group hover:scale-[1.02] transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                    <Clock className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest leading-none mb-1.5">Teacher Start</p>
                                    <p className="text-3xl font-black tracking-tight">{attendanceConfig.startTime}</p>
                                </div>
                            </div>
                            <div className="bg-indigo-600 rounded-3xl p-6 flex items-center gap-6 shadow-xl shadow-indigo-100 text-white group hover:scale-[1.02] transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                    <Clock className="h-7 w-7 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest leading-none mb-1.5">End of Day</p>
                                    <p className="text-3xl font-black tracking-tight">{attendanceConfig.checkOutLimit}</p>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            )}

            {/* Attendance Action Cards - Only for Non-Admins */}
            {user.role !== 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Clock In Card */}
                    <div className={`p-10 rounded-[3rem] border transition-all duration-500 relative overflow-hidden group ${todayRecord?.checkIn && !todayRecord?.checkOut ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl'}`}>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 transition-all duration-500 ${todayRecord?.checkIn ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600 group-hover:scale-110 shadow-xl shadow-blue-100/50'}`}>
                                <Power className="h-10 w-10 rotate-90" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Check In</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Start your work session</p>
                            
                            {todayRecord?.checkIn ? (
                                <div className="flex flex-col items-center">
                                    <span className="px-6 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-lg font-black tracking-tight mb-2">
                                        {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Logged In Successfully</p>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleClockIn}
                                    disabled={loading}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                                >
                                    {loading ? 'Processing...' : 'Punch In Now'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Clock Out Card */}
                    <div className={`p-10 rounded-[3rem] border transition-all duration-500 relative overflow-hidden group ${todayRecord?.checkOut ? 'bg-amber-50/30 border-amber-100' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl'}`}>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 transition-all duration-500 ${todayRecord?.checkOut ? 'bg-amber-100 text-amber-600' : 'bg-rose-50 text-rose-500 group-hover:scale-110 shadow-xl shadow-rose-100/50'}`}>
                                <Power className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Check Out</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">End your daily schedule</p>
                            
                            {todayRecord?.checkOut ? (
                                <div className="flex flex-col items-center">
                                    <span className="px-6 py-2 bg-amber-100 text-amber-700 rounded-xl text-lg font-black tracking-tight mb-2">
                                        {new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Logged Out Successfully</p>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleClockOut}
                                    disabled={loading || !todayRecord?.checkIn}
                                    className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-2xl shadow-rose-200 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
                                >
                                    {loading ? 'Processing...' : 'Punch Out Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance History */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <History className="h-5 w-5 text-blue-600" /> Recent Activity Log
                    </h3>
                    <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        Academic Year: {selectedYear}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-10 py-5">Date</th>
                                <th className="px-10 py-5">Check In</th>
                                <th className="px-10 py-5">Check Out</th>
                                <th className="px-10 py-5">Work Duration</th>
                                <th className="px-10 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {attendanceList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Calendar className="h-10 w-10 text-gray-100" />
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">No records found for this period</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : attendanceList.map((record, i) => (
                                <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="px-10 py-5">
                                        <p className="text-sm font-black text-gray-900">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{record.date}</p>
                                    </td>
                                    <td className="px-10 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                            <span className="text-sm font-black text-slate-700 tabular-nums">
                                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-5">
                                        {record.checkOut ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                                <span className="text-sm font-black text-slate-700 tabular-nums">
                                                    {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ) : <span className="text-[10px] font-bold text-gray-300 italic">No checkout</span>}
                                    </td>
                                    <td className="px-10 py-5">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl w-max border border-gray-100">
                                            <Timer className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs font-black text-gray-600 tabular-nums">{record.totalWork || '0h 0m'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-5 text-right">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${record.status === 'P' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                            {record.status === 'P' ? 'Present' : 'Absent'}
                                        </span>
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

export default HRAttendance;
