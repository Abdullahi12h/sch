import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { loadCardConfig, SIZE_OPTIONS } from './DashboardSettings';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';
import { 
    Users, UserCheck, Calendar, DollarSign, TrendingUp, BookOpen, Clock, Award,
    ChevronDown, Printer, Download, Search, Filter, UserMinus, Clock4,
    CheckCircle2, XCircle, TrendingDown, GraduationCap, Wallet,
    PieChart as PieChartIcon, FileText, Check, X, AlertCircle, Settings,
    Info, Save, AlertTriangle, Edit3, Power
} from 'lucide-react';

import TeacherDailyLog from '../components/lesson/TeacherDailyLog';
import AdminLessonFeed from '../components/lesson/AdminLessonFeed';

const SIZE_MAP = Object.fromEntries(SIZE_OPTIONS.map(s => [s.key, s]));

const StatCard = ({ label, value, sub, icon, color, iconSize, compact }) => {
    const sz = SIZE_MAP?.[iconSize] || (compact ? { px: 18, boxW: 'w-10', boxH: 'h-10', boxR: 'rounded-xl' } : { px: 24, boxW: 'w-16', boxH: 'h-16', boxR: 'rounded-2xl' });
    return (
        <div className={`bg-white ${compact ? 'w-full h-[140px] p-3 sm:p-4 rounded-3xl' : 'p-4 sm:p-5 rounded-4xl'} border border-gray-100 shadow-sm flex items-center gap-2 sm:gap-4 hover:shadow-md transition-all duration-300 group`}>
            <div className={`${sz.boxW} ${sz.boxH} ${sz.boxR} ${color} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
                {React.isValidElement(icon) ? React.cloneElement(icon, { size: sz.px, strokeWidth: 2.5 }) : icon}
            </div>
            <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest leading-tight mb-0.5 truncate group-hover:whitespace-normal group-hover:overflow-visible">{label}</p>
                <h3 className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 leading-none truncate`}>{value}</h3>
                {sub && <p className="text-[6px] sm:text-[7px] font-black text-gray-400 uppercase tracking-tighter mt-1 truncate group-hover:whitespace-normal group-hover:overflow-visible">{sub}</p>}
            </div>
        </div>
    );
};

const TopStudentCard = ({ student, rank, color }) => {
    const themes = {
        gold: { caps: 'from-amber-600 via-amber-400 to-amber-600', border: 'from-amber-200 via-amber-500 to-amber-200', fill: 'from-amber-500 via-amber-700 to-amber-900', glow: 'rgba(245,158,11,0.4)', stroke: 'border-amber-400/40', badge: 'from-amber-100 via-amber-400 to-amber-600' },
        silver: { caps: 'from-slate-400 via-slate-200 to-slate-400', border: 'from-slate-100 via-slate-400 to-slate-100', fill: 'from-slate-400 via-slate-600 to-slate-800', glow: 'rgba(148,163,184,0.4)', stroke: 'border-slate-300/40', badge: 'from-slate-50 via-slate-200 to-slate-400' },
        bronze: { caps: 'from-orange-700 via-orange-500 to-orange-700', border: 'from-orange-300 via-orange-600 to-orange-300', fill: 'from-orange-600 via-orange-800 to-orange-950', glow: 'rgba(194,65,12,0.4)', stroke: 'border-orange-400/40', badge: 'from-orange-100 via-orange-400 to-orange-600' },
        emerald: { caps: 'from-emerald-600 via-emerald-400 to-emerald-600', border: 'from-emerald-200 via-emerald-500 to-emerald-200', fill: 'from-emerald-500 via-emerald-700 to-emerald-900', glow: 'rgba(16,185,129,0.4)', stroke: 'border-emerald-400/40', badge: 'from-emerald-100 via-emerald-400 to-emerald-600' },
        blue: { caps: 'from-blue-600 via-blue-400 to-blue-600', border: 'from-blue-200 via-blue-500 to-blue-200', fill: 'from-blue-500 via-blue-700 to-blue-900', glow: 'rgba(37,99,235,0.4)', stroke: 'border-blue-400/40', badge: 'from-blue-100 via-blue-400 to-blue-600' },
        indigo: { caps: 'from-indigo-600 via-indigo-400 to-indigo-600', border: 'from-indigo-200 via-indigo-500 to-indigo-200', fill: 'from-indigo-500 via-indigo-700 to-indigo-900', glow: 'rgba(79,70,229,0.4)', stroke: 'border-indigo-400/40', badge: 'from-indigo-100 via-indigo-400 to-indigo-600' },
        rose: { caps: 'from-rose-600 via-rose-400 to-rose-600', border: 'from-rose-200 via-rose-500 to-rose-200', fill: 'from-rose-500 via-rose-700 to-rose-900', glow: 'rgba(225,29,72,0.4)', stroke: 'border-rose-400/40', badge: 'from-rose-100 via-rose-400 to-rose-600' },
        purple: { caps: 'from-purple-600 via-purple-400 to-purple-600', border: 'from-purple-200 via-purple-500 to-purple-200', fill: 'from-purple-500 via-purple-700 to-purple-900', glow: 'rgba(147,51,234,0.4)', stroke: 'border-purple-400/40', badge: 'from-purple-100 via-purple-400 to-purple-600' }
    };
    const theme = themes[color] || themes.blue;
    return (
        <div className="flex-none py-2 px-1 relative group">
            <div className="relative w-[300px] h-20 flex items-center justify-center">
                <div className={`absolute inset-y-0 left-0 w-8 bg-linear-to-r ${theme.caps} rounded-l-2xl shadow-lg z-0 opacity-80`} />
                <div className={`absolute inset-y-0 right-0 w-8 bg-linear-to-l ${theme.caps} rounded-r-2xl shadow-lg z-0 opacity-80`} />
                <div className={`relative w-[280px] h-[64px] rounded-full p-[1.5px] bg-linear-to-r ${theme.border} z-10`} style={{ boxShadow: `0 0 15px ${theme.glow}` }}>
                    <div className={`w-full h-full rounded-full bg-linear-to-b ${theme.fill} flex items-center px-5 relative overflow-hidden text-white`}>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-white/10 to-transparent rounded-full pointer-events-none" />
                        <div className={`absolute inset-[3px] rounded-full border ${theme.stroke} pointer-events-none shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]`} />
                        <div className={`w-10 h-10 rounded-full bg-linear-to-br ${theme.badge} flex items-center justify-center shrink-0 shadow-lg z-20 border border-white/20`}>
                            {rank <= 3 ? <Award className="h-6 w-6 text-white drop-shadow-md" /> : <span className="font-black text-sm text-white drop-shadow-md">#{rank}</span>}
                        </div>
                        <div className="ml-4 flex-1 min-w-0 text-white">
                            <h4 className="font-black text-[11px] uppercase tracking-wider truncate drop-shadow-sm">{student.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold text-white/70 uppercase tracking-tighter bg-black/20 px-2 py-0.5 rounded-md border border-white/10">{student.grade}</span>
                                <span className="text-[10px] font-black text-white">{(student.totalScore || student.avg || 0)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>{label}</button>
);

const ICON_MAP = { Users, UserCheck, BookOpen, DollarSign, CheckCircle2, Clock, TrendingDown, Wallet, TrendingUp, Settings };
const COLOR_MAP = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100/50', statColor: 'bg-blue-50 text-blue-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100/50', statColor: 'bg-emerald-50 text-emerald-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-100/50', statColor: 'bg-amber-50 text-amber-600' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-100/50', statColor: 'bg-rose-50 text-rose-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', iconBg: 'bg-purple-100/50', statColor: 'bg-purple-50 text-purple-600' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600', iconBg: 'bg-slate-100/50', statColor: 'bg-slate-50 text-slate-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', iconBg: 'bg-indigo-100/50', statColor: 'bg-indigo-50 text-indigo-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-600', iconBg: 'bg-cyan-100/50', statColor: 'bg-cyan-50 text-cyan-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', iconBg: 'bg-orange-100/50', statColor: 'bg-orange-50 text-orange-600' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-600', iconBg: 'bg-teal-100/50', statColor: 'bg-teal-50 text-teal-600' },
};

const AdminStats = ({ data = {}, cardConfig }) => {
    const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="card-grid">
                {['students', 'teachers', 'classes'].map((key) => {
                    const c = cardConfig[key];
                    const style = COLOR_MAP[c.color] || COLOR_MAP.blue;
                    const IconComp = ICON_MAP[c.icon] || Users;
                    const valueMap = { students: data.students?.total || 0, teachers: data.teachers || 0, classes: data.classes || 0 };
                    const subMap = { students: `${data.students?.male || 0} MALE / ${data.students?.female || 0} FEMALE`, teachers: 'ACTIVE INSTRUCTORS', classes: 'REGISTERED GRADES' };
                    return <StatCard key={key} label={c.label} value={valueMap[key]} sub={subMap[key]} icon={<IconComp />} color={style.statColor} iconSize={c.iconSize} />;
                })}
            </div>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Financial Matrix</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Real-time revenue & expense tracking</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {['totalFees', 'collected', 'pending', 'expenses', 'salary', 'netIncome'].map((key) => {
                        const c = cardConfig[key];
                        const style = COLOR_MAP[c.color] || COLOR_MAP.slate;
                        const IconComp = ICON_MAP[c.icon] || DollarSign;
                        const sz = SIZE_MAP?.[c.iconSize] || { px: 18, boxW: 'w-8', boxH: 'h-8', boxR: 'rounded-xl' };
                        const val = key === 'salary' ? data.finance?.salaries : data.finance?.[key];
                        return (
                            <div key={key} className={`${style.bg} p-4 rounded-2xl border ${style.border} shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all relative group overflow-hidden`}>
                                <div className="flex justify-between items-start">
                                    <div className={`${sz.boxW} ${sz.boxH} ${sz.boxR} flex items-center justify-center ${style.iconBg} ${style.text} transition-all duration-300`}><IconComp size={sz.px} strokeWidth={2.5} /></div>
                                    <p className={`text-[8px] font-black uppercase tracking-widest ${style.text} opacity-70`}>{c.label}</p>
                                </div>
                                <div className="mt-4">
                                    <h4 className={`text-lg font-black ${style.text} leading-none truncate`}>{formatCurrency(val)}</h4>
                                    <div className={`h-1 w-6 mt-2 rounded-full ${style.text.replace('text', 'bg')}`} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const AdmissionStats = ({ data = {} }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Applicat..." value={data.totalApplications || 0} sub="Registered" icon={<Users />} color="bg-blue-50 text-blue-600" />
        <StatCard label="Enrolled Stude..." value={data.enrolledStudents || 0} sub="Active Students" icon={<UserCheck />} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pending Review" value={data.pendingReview || 0} sub="Awaiting Approval" icon={<Clock />} color="bg-amber-50 text-amber-600" />
        <StatCard label="Rejected" value={data.rejected || 0} sub="Denied Applications" icon={<XCircle />} color="bg-rose-50 text-rose-600" />
    </div>
);

const StudentStats = ({ data = {} }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <StatCard label="Attendance" value={`${data.attendancePercentage || 0}%`} sub="Elite Status" icon={<Users />} color="bg-blue-50 text-blue-600" />
            <StatCard label="Academic" value={data.gpa || '0.0'} sub="Dean's List" icon={<GraduationCap />} color="bg-emerald-50 text-emerald-600" />
            <StatCard label="Upcoming" value={data.upcomingExamsCount || 0} sub="Next 14 Days" icon={<BookOpen />} color="bg-purple-50 text-purple-600" />
            <StatCard label="Absences" value={data.totalAbsences || 0} sub="Total Missed" icon={<TrendingDown />} color="bg-rose-50 text-rose-600" />
            <StatCard label="My Fee Balance" value={`$${data.feeBalance || 0}`} sub="Remaining Amount" icon={<DollarSign />} color="bg-amber-50 text-amber-600" />
        </div>
    </div>
);

const TeacherStats = ({ data = {}, onClockIn, onClockOut, actionLoading }) => {
    const config = data.attendanceConfig || { checkInStart: '06:00', startTime: '07:30', lateTime: '08:00', checkOutLimit: '18:00', absentTime: '09:00' };

    const format24to12 = (timeStr) => {
        if (!timeStr) return '--:--';
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12 = h % 12 || 12;
        return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    // Fetch config values, fallback to strings if empty
    const checkInTime = data.myAttendance?.checkIn ? new Date(data.myAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : format24to12(config.startTime);
    const checkOutTime = data.myAttendance?.checkOut ? new Date(data.myAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : format24to12(config.checkOutLimit);
    const hasCheckedIn = !!data.myAttendance?.checkIn;
    const hasCheckedOut = !!data.myAttendance?.checkOut;
    const now = new Date();
    
    const [startH, startM] = (config.checkInStart || '06:00').split(':').map(Number);
    const [inH, inM] = (config.startTime || '07:30').split(':').map(Number);
    const [outH, outM] = (config.checkOutLimit || '18:00').split(':').map(Number);
    
    const checkInWindowTime = new Date(); checkInWindowTime.setHours(startH, startM, 0, 0);
    const checkInAllowedTime = new Date(); checkInAllowedTime.setHours(inH, inM, 0, 0);
    const checkOutAllowedTime = new Date(); checkOutAllowedTime.setHours(outH, outM, 0, 0);
    
    // We let them clock in if it's past the check-in time configured by Admin.
    const isCheckInAllowed = now >= checkInAllowedTime;
    
    // They can only check out exactly if they have checked in, AND it's past CheckOut time config from Admin.
    const isCheckOutAllowed = now >= checkOutAllowedTime;

    const formatTimeStr = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                <div className="min-h-[140px] h-full bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all overflow-hidden">
                    <div className="bg-[#2563EB] px-3 py-2 flex justify-between items-center shadow-lg z-10"><div><h2 className="text-[10px] font-black text-white tracking-tight uppercase">STMS - Matrix</h2><p className="text-[6px] text-blue-100 font-bold uppercase tracking-widest opacity-80">Teacher Mgmt</p></div><Settings className="h-3 w-3 text-white opacity-60" /></div>
                    <div className="grow bg-slate-50 flex items-center justify-evenly relative py-4">
                        {/* Connecting Line */}
                        <div className="absolute top-[40%] left-1/4 right-1/4 h-1 bg-gray-200 z-0" />
                        
                        <div className="flex flex-col items-center gap-1 z-10 w-20">
                            <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClockIn(data.teacherId, data.teacherName); }} 
                                disabled={hasCheckedIn || actionLoading} 
                                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 relative z-50 transition-all cursor-pointer ${(!hasCheckedIn && !actionLoading) ? 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105 active:scale-95 shadow-emerald-500/40' : 'bg-emerald-500 opacity-50'}`}
                                title={!hasCheckedIn ? 'Check In' : 'Checked In'}
                            >
                                {actionLoading && !hasCheckedIn ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Power className="w-6 h-6 text-white drop-shadow-md" style={{ pointerEvents: 'none' }} strokeWidth={3} />
                                )}
                            </button>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-800 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm mt-0.5 whitespace-nowrap">
                                {hasCheckedIn && checkInTime !== '--:-- --' ? checkInTime : (
                                    now < checkInWindowTime ? `Starts ${format24to12(config.checkInStart)}` : 'Check-In'
                                )}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 z-10 w-20">
                            <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClockOut(data.teacherId); }} 
                                disabled={!hasCheckedIn || hasCheckedOut || actionLoading} 
                                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 relative z-50 transition-all cursor-pointer ${(hasCheckedIn && !hasCheckedOut && !actionLoading) ? 'bg-rose-600 hover:bg-rose-700 hover:scale-105 active:scale-95 shadow-rose-500/40' : 'bg-rose-600 opacity-50'}`}
                                title={hasCheckedOut ? 'Checked Out' : !hasCheckedIn ? 'Not Checked In yet' : 'Check Out'}
                            >
                                {actionLoading && (hasCheckedIn && !hasCheckedOut) ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Power className="w-6 h-6 text-white drop-shadow-md" style={{ pointerEvents: 'none' }} strokeWidth={3} />
                                )}
                            </button>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-800 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm mt-0.5 whitespace-nowrap">
                                {hasCheckedOut && checkOutTime !== '--:-- --' ? checkOutTime : 'Check-Out'}
                            </span>
                        </div>
                    </div>
                </div>
                <StatCard compact label="CLASSES" value={data.myClassesCount || 0} sub="THIS TERM" icon={<BookOpen />} color="bg-blue-50 text-blue-600" />
                <StatCard compact label="STUDENTS" value={data.myStudentsCount || 0} sub="ACROSS ALL" icon={<Users />} color="bg-emerald-50 text-emerald-600" />
                <StatCard compact label="EXAMS" value={data.activeExamsCount || 0} sub="MENU" icon={<GraduationCap />} color="bg-[#F8F7FF] text-purple-600" />
            </div>

        </div>
    );
};

const FinanceStats = ({ data = {} }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Revenue Guud" value={`$${data.totalCollected?.toLocaleString() || 0}`} sub="Fees Collected" icon={<Wallet />} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Outstanding" value={`$${data.totalPending?.toLocaleString() || 0}`} sub="Yet to Collect" icon={<Clock />} color="bg-amber-50 text-amber-600" />
        <StatCard label="Expenses" value={`$${data.totalExpenses?.toLocaleString() || 0}`} sub="Operational Costs" icon={<DollarSign />} color="bg-rose-50 text-rose-600" />
        <StatCard label="Net Profit" value={`$${data.netRevenue?.toLocaleString() || 0}`} sub="School Balance" icon={<TrendingUp />} color="bg-blue-50 text-blue-600" />
    </div>
);

const EmployeeAttendanceStats = ({ teachersList = [], onClockIn, onClockOut, actionLoading }) => {
    const { user } = useAuth();
    const { selectedYear, academicYears } = useAcademicYear();
    const [period, setPeriod] = useState('daily');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({ list: [], stats: {} });
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const authConfig = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`/api/teacher-attendance/stats?academicYear=${selectedYear}&period=${period}&date=${date}`, authConfig);
            
            // Map the attendance records to our display format
            const mapped = teachersList.map(teacher => {
                const record = data.stats?.find(a => a.teacherId === teacher.id || a.teacherName === teacher.name || a.name === teacher.name);
                return {
                    ...teacher,
                    checkIn: record?.checkIn || '-',
                    checkOut: record?.checkOut || '-',
                    totalWork: record?.hoursWorked || '-',
                    status: record?.status || 'A'
                };
            });
            setAttendanceData({ 
                list: mapped, 
                stats: { 
                    present: data.present || 0, 
                    late: data.late || 0, 
                    absent: data.absent || 0, 
                    total: data.total || teachersList.length 
                } 
            });
            if (data.attendanceConfig) setConfig(data.attendanceConfig);
        } catch (error) {
            console.error('Error fetching filtered attendance:', error);
        } finally {
            setLoading(false);
        }
    }, [user.token, selectedYear, period, date, teachersList]);

    const handleAction = async (action, id, name) => {
        if (action === 'in') await onClockIn(id, name);
        else await onClockOut(id);
        fetchAttendance();
    };

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    .printable-attendance, .printable-attendance * { visibility: visible; }
                    .printable-attendance { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #eee !important; }
                    th, td { border: 1px solid #eee !important; padding: 12px !important; }
                }
                `}
            </style>
            <div className="printable-attendance space-y-6">
                <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between bg-white gap-4 rounded-4xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2563EB]" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Employee Attendance Matrix</h3>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-tighter border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">Teacher Mgmt</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Real-time presence tracking & synchronization</p>
                        {config && (
                            <div className="flex items-center gap-3 mt-2 no-print">
                                <span className="flex items-center gap-1 text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-tighter">
                                    <Clock className="w-2.5 h-2.5" /> Check-In: {config.startTime}
                                </span>
                                <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 uppercase tracking-tighter">
                                    <Settings className="w-2.5 h-2.5" /> Late: {config.lateTime}
                                </span>
                                <span className="flex items-center gap-1 text-[8px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100 uppercase tracking-tighter">
                                    <Clock className="w-2.5 h-2.5" /> Check-Out: {config.checkOutLimit}
                                </span>
                                <span className="flex items-center gap-1 text-[8px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 uppercase tracking-tighter">
                                    <XCircle className="w-2.5 h-2.5" /> Absent: {config.absentTime}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 no-print">
                        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50/50 rounded-2xl border border-gray-100">
                             <div className="flex flex-col"><span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Present</span><span className="text-sm font-black text-slate-800 tabular-nums">{attendanceData.stats?.present || 0}</span></div>
                             <div className="w-px h-6 bg-gray-200" />
                             <div className="flex flex-col"><span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Late</span><span className="text-sm font-black text-slate-800 tabular-nums">{attendanceData.stats?.late || 0}</span></div>
                             <div className="w-px h-6 bg-gray-200" />
                             <div className="flex flex-col"><span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Absent</span><span className="text-sm font-black text-slate-800 tabular-nums">{attendanceData.stats?.absent || 0}</span></div>
                        </div>

                        <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-xs">
                            {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {p === 'yearly' ? 'Dhamaan' : p === 'monthly' ? 'Bile' : p === 'weekly' ? 'Week' : 'Daily'}
                                </button>
                            ))}
                        </div>
                        
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white border border-gray-100 rounded-xl px-3 py-1.5 text-[9px] font-black text-gray-600 outline-none shadow-xs hover:border-blue-200 transition-all uppercase"
                        />

                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all shadow-xs"
                        >
                            <Printer className="w-3 h-3" /> Print
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[200px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">MACALINKA</th>
                                <th className="px-8 py-5">MAADADA</th>
                                <th className="px-8 py-5 text-center">CHECK-IN</th>
                                <th className="px-8 py-5 text-center">CHECK-OUT</th>
                                <th className="px-8 py-5 text-center">WORK TIME</th>
                                <th className="px-8 py-5 text-center">Actions / Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(attendanceData.list || []).map((teacher, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                                                {teacher.name?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-black text-slate-900">{teacher.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                            {teacher.subject || 'Instructor'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`inline-block text-[13px] font-black px-4 py-2 rounded-xl transition-all ${teacher.checkIn !== '-' ? 'bg-[#E6F9F3] text-[#00A36C]' : 'bg-gray-50 text-gray-300'}`}>
                                            {teacher.checkIn}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`inline-block text-[13px] font-black px-4 py-2 rounded-xl transition-all ${teacher.checkOut !== '-' ? 'bg-[#FFF7E6] text-[#D97706]' : 'bg-gray-50 text-gray-300'}`}>
                                            {teacher.checkOut}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-black text-slate-700 tabular-nums">{teacher.totalWork}</span>
                                    </td>
                                     <td className="px-8 py-5">
                                         <div className="flex items-center justify-center">
                                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${teacher.status === 'P' || teacher.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : teacher.status === 'L' || teacher.status === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                                 {teacher.status === 'P' || teacher.status === 'Present' ? 'Present' : teacher.status === 'L' || teacher.status === 'Late' ? 'Late' : 'Absent'}
                                             </span>
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

const Dashboard = () => {
    const { user } = useAuth();
    const { selectedYear } = useAcademicYear();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || (user.role === 'admin' ? 'ADMISSION' : 'OVERVIEW'));
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [cardConfig, setCardConfig] = useState(loadCardConfig());

    const handleTabChange = useCallback((tab) => { setActiveTab(tab); setSearchParams({ tab }); }, [setSearchParams]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const academicYearParam = selectedYear === 'All' ? '' : `?academicYear=${selectedYear}`;
                const [statsRes, teachersRes] = await Promise.all([
                    axios.get(`/api/dashboard/stats${academicYearParam}`, config),
                    user.role === 'admin' ? axios.get('/api/teachers', config) : Promise.resolve({ data: { data: [] } })
                ]);
                const statsData = statsRes.data.data || statsRes.data || {};
                setStats(statsData);
                if (user.role === 'admin') setTeachers(teachersRes.data.data || teachersRes.data || []);
                console.log('DASHBOARD_LIVE_DATA_LOADED', statsData);
            } catch (error) { console.error('Error fetching dashboard stats', error); } finally { setLoading(false); }
        };
        fetchStats();
    }, [user, selectedYear]);

    const handleClockIn = async (id, name) => { 
        if (actionLoading) return;
        setActionLoading(true);
        console.log('Clock in clicked', { id, name });
        try { 
            const config = { headers: { Authorization: `Bearer ${user.token}` } }; 
            
            // Priority: provided id -> teacherData.id -> user.id -> user._id
            const teacherId = id ?? user?.teacherData?.id ?? user?.id ?? user?._id;
            const teacherName = name ?? user?.teacherData?.name ?? user?.name ?? 'Unknown Teacher';
            
            // Resolve academic year
            let yearToSend = selectedYear;
            if (yearToSend === 'All') {
                // If the user context has academicYears, try to find active one
                const active = academicYears?.find(y => y.status === 'Active');
                yearToSend = active ? active.name : ''; // Backend will handle empty/All anyway
            }

            console.log('Dispatching Clock IN with:', { teacherId, teacherName, academicYear: yearToSend });
            
            const reqData = await axios.post('/api/teacher-attendance/clock-in', { 
                teacherId, 
                teacherName, 
                academicYear: yearToSend 
            }, config); 
            
            console.log('Clock in response:', reqData.data);
            
            // Refresh stats
            const res = await axios.get(`/api/dashboard/stats${selectedYear === 'All' ? '' : `?academicYear=${selectedYear}`}`, config); 
            setStats(res.data.data || res.data || {}); 
            alert('Clock-In Successful!');
        } catch (e) { 
            console.error('Clock In Error:', e);
            alert(e.response?.data?.message || e.message || 'Error occurred during clock-in'); 
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleClockOut = async (id) => { 
        if (actionLoading) return;
        setActionLoading(true);
        console.log('Clock out clicked', { id });
        try { 
            const config = { headers: { Authorization: `Bearer ${user.token}` } }; 
            const teacherId = id ?? user?.teacherData?.id ?? user?.id ?? user?._id;
            
            let yearToSend = selectedYear;
            if (yearToSend === 'All') {
                const active = academicYears?.find(y => y.status === 'Active');
                yearToSend = active ? active.name : '';
            }

            console.log('Dispatching Clock OUT with:', { teacherId, academicYear: yearToSend });
            
            const reqData = await axios.post('/api/teacher-attendance/clock-out', { 
                teacherId, 
                academicYear: yearToSend 
            }, config); 
            
            console.log('Clock out response:', reqData.data);
            
            // Refresh stats
            const res = await axios.get(`/api/dashboard/stats${selectedYear === 'All' ? '' : `?academicYear=${selectedYear}`}`, config); 
            setStats(res.data.data || res.data || {}); 
            alert('Clock-Out Successful!');
        } catch (e) { 
            console.error('Clock Out Error:', e);
            alert(e.response?.data?.message || e.message || 'Error occurred during clock-out'); 
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /><p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Initializing Dashboard...</p></div>;

    const rankThemes = ['gold', 'silver', 'bronze', 'emerald', 'blue', 'indigo', 'rose', 'purple', 'emerald', 'blue'];
    
    let topPerformers = stats.topPerformers || stats.admin?.topPerformers || stats.teacher?.topPerformers || stats.student?.topPerformers || [];
    
    if (!topPerformers || topPerformers.length === 0) {
        topPerformers = [
            { name: 'Abdirahman Ali', grade: 'FORM FOUR', totalScore: '98.5', rank: 1 },
            { name: 'Fardowsa Mohamed', grade: 'FORM FOUR', totalScore: '97.2', rank: 2 },
            { name: 'Mubarak Hassan', grade: 'FORM THREE', totalScore: '96.8', rank: 3 },
            { name: 'Anisa Yusuf', grade: 'FORM FOUR', totalScore: '95.4', rank: 4 },
            { name: 'Mustafe Ahmed', grade: 'FORM TWO', totalScore: '94.1', rank: 5 },
            { name: 'Sumaya Iidid', grade: 'FORM FOUR', totalScore: '93.5', rank: 6 }
        ];
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.role === 'student' ? 'Student Dashboard' : user.role === 'teacher' ? 'Teacher Dashboard' : 'Admin Dashboard'}</h1><p className="text-sm font-bold text-gray-400 mt-1">Welcome back, <span className="text-gray-900">{user?.name || 'User'}</span>. Academic Year <span className="text-blue-600">{selectedYear === 'All' ? 'Wadarta' : selectedYear}</span></p></div>
                <div className="flex items-center gap-3"><button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm"><Printer className="h-4 w-4" /> Print Report</button><button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"><Download className="h-4 w-4" /> Export Data</button></div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm">
                            <Award className="h-6 w-6 text-amber-500 animate-bounce" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Ardayda Ugu Sareysa</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Top Performers — Academic Year 2026/27</p>
                        </div>
                    </div>
                </div>
                <div className="relative group overflow-hidden rounded-3xl">
                    <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
                    <div className="flex animate-ticker hover:[animation-play-state:paused] w-max gap-6 pb-6">
                        {topPerformers && topPerformers.length > 0 ? (
                            <>
                                {topPerformers.map((s, i) => <TopStudentCard key={`f-${i}`} student={s} rank={i + 1} color={rankThemes[i] || 'blue'} />)}
                                {topPerformers.map((s, i) => <TopStudentCard key={`s-${i}`} student={s} rank={i + 1} color={rankThemes[i] || 'blue'} />)}
                            </>
                        ) : (
                            <div className="w-full flex items-center justify-center py-10 px-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Natiijada waxaa la soo bandhigi doonaa dhowaan...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {user.role !== 'student' && (
                <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full sm:w-max overflow-x-auto no-scrollbar">
                    {user.role === 'teacher' ? (
                        <>
                            <TabButton label="OVERVIEW" active={activeTab === 'OVERVIEW'} onClick={() => handleTabChange('OVERVIEW')} />
                            <TabButton label="ACTIVITY" active={activeTab === 'ACTIVITY'} onClick={() => handleTabChange('ACTIVITY')} />
                        </>
                    ) : (
                        <>
                            <TabButton label="ADMISSION" active={activeTab === 'ADMISSION'} onClick={() => handleTabChange('ADMISSION')} />
                            <TabButton label="FINANCE" active={activeTab === 'FINANCE'} onClick={() => handleTabChange('FINANCE')} />
                            <TabButton label="ACTIVITY" active={activeTab === 'ACTIVITY'} onClick={() => handleTabChange('ACTIVITY')} />
                            <TabButton label="EMPLOYEE ATTENDANCE" active={activeTab === 'EMPLOYEE ATTENDANCE'} onClick={() => handleTabChange('EMPLOYEE ATTENDANCE')} />
                        </>
                    )}
                </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {user.role === 'admin' ? (
                    <div className="space-y-8">
                        {activeTab === 'ADMISSION' && <AdminStats data={stats.admin || {}} cardConfig={cardConfig} />}
                        {activeTab === 'FINANCE' && <FinanceStats data={stats.finance || {}} />}
                        {activeTab === 'ACTIVITY' && (
                            <>
                                {console.log('[Dashboard] Rendering AdminLessonFeed with teachers:', teachers.length)}
                                <AdminLessonFeed teachersList={teachers} />
                            </>
                        )}
                        {activeTab === 'EMPLOYEE ATTENDANCE' && <EmployeeAttendanceStats teachersList={teachers} onClockIn={handleClockIn} onClockOut={handleClockOut} actionLoading={actionLoading} />}
                    </div>
                ) : user.role === 'student' ? <StudentStats data={stats.student || {}} /> : (
                    <>{activeTab === 'OVERVIEW' && <div className="space-y-8"><TeacherStats data={stats.teacher || {}} onClockIn={handleClockIn} onClockOut={handleClockOut} actionLoading={actionLoading} /></div>}{activeTab === 'ACTIVITY' && <div className="space-y-8"><TeacherDailyLog /></div>}</>
                )}
            </div>            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-ticker { display: flex; animation: ticker 30s linear infinite; } .animate-ticker:hover { animation-play-state: paused; }` }} />
        </div>
    );
};
export default Dashboard;