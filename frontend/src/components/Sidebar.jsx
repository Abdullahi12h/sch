import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Settings,
    GraduationCap,
    Calendar,
    CreditCard,
    LogOut,
    FolderOpen,
    BookOpen,
    ChevronDown,
    ChevronRight,
    UserCheck,
    FileText,
    Edit3,
    Clock,
    X,
    MessageSquare,
    Palette,
    Image as ImageIcon,
    ClipboardCheck,
    Package
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({ 'Administration': true, 'ACADEMIC': true });

    // Dynamic School Name State
    const [schoolInfo, setSchoolInfo] = useState(() => {
        const saved = localStorage.getItem('system_config');
        return saved ? JSON.parse(saved) : { schoolName: 'Al-Nuur', academicYear: '2024/25' };
    });

    useEffect(() => {
        const handleUpdate = () => {
            const saved = localStorage.getItem('system_config');
            if (saved) setSchoolInfo(JSON.parse(saved));
        };
        window.addEventListener('storage', handleUpdate);
        window.addEventListener('configUpdate', handleUpdate);
        return () => {
            window.removeEventListener('storage', handleUpdate);
            window.removeEventListener('configUpdate', handleUpdate);
        };
    }, []);

    const toggleMenu = (title) => {
        setExpandedMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard', roles: ['admin', 'teacher', 'student', 'cashier'] },
        {
            title: 'Administration', icon: <FolderOpen className="h-5 w-5" />, path: '/dashboard/administration', roles: ['admin'],
            submenu: [
                { title: 'Students', path: '/dashboard/students', icon: <Users className="h-4 w-4" />, roles: ['admin'] },
                { title: 'Employees', path: '/dashboard/teachers', icon: <Users className="h-4 w-4" />, roles: ['admin'] },
                { title: 'Staff', path: '/dashboard/staff', icon: <UserCheck className="h-4 w-4" />, roles: ['admin'] },
                { title: 'Admission', path: '/dashboard/admissions', icon: <FolderOpen className="h-4 w-4" />, roles: ['admin'] },
                { title: 'Inventory', path: '/dashboard/inventory', icon: <Package className="h-4 w-4" />, roles: ['admin'] },
            ]
        },
        {
            title: 'Finance', icon: <CreditCard className="h-5 w-5" />, roles: ['admin', 'cashier'],
            submenu: [
                { title: 'Dashboard', path: '/dashboard/finance', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['admin', 'cashier'] },
                { title: 'Salary Registration', path: '/dashboard/finance/salary', icon: <CreditCard className="h-4 w-4" />, roles: ['admin', 'cashier'] },
            ]
        },
        {
            title: 'ACADEMIC', icon: <GraduationCap className="h-5 w-5" />, path: '/dashboard/academics', roles: ['admin', 'teacher', 'student'],
            submenu: [
                { title: 'Subjects', path: '/dashboard/subjects', icon: <BookOpen className="h-4 w-4" />, roles: ['admin'] },
                { title: 'Class', path: '/dashboard/grades', icon: <GraduationCap className="h-4 w-4" />, roles: ['admin'] },
                { title: 'My Fee', path: '/dashboard/my-fee', icon: <CreditCard className="h-4 w-4" />, roles: ['student'] },
                { title: 'Timetable', path: '/dashboard/timetable', icon: <Calendar className="h-4 w-4" />, roles: ['admin', 'teacher', 'student'] },
                { title: 'Periods', path: '/dashboard/periods', icon: <Clock className="h-4 w-4" />, roles: ['admin'] },
            ]
        },
        {
            title: 'ATTENDANCE', icon: <Calendar className="h-5 w-5" />, roles: ['admin', 'teacher', 'student'],
            submenu: [
                { title: 'Student Attendance', path: '/dashboard/attendance', icon: <UserCheck className="h-4 w-4" />, roles: ['admin', 'teacher', 'student'] },
                { title: 'Time Settings', path: '/dashboard/attendance-teacher/policy', icon: <Settings className="h-4 w-4" />, roles: ['admin'] },
            ]
        },
        {
            title: 'EXAM', icon: <FileText className="h-5 w-5" />, path: '/dashboard/exams', roles: ['admin', 'teacher', 'student'],
            submenu: [
                { title: 'Marks Entry', path: '/dashboard/exams/marks', icon: <Edit3 className="h-4 w-4" />, roles: ['admin', 'teacher'] },
                { title: 'View Results', path: '/dashboard/exams/results', icon: <FileText className="h-4 w-4" />, roles: ['admin', 'student'] },
                { title: 'Exam Setting', path: '/dashboard/exams/settings', icon: <Settings className="h-4 w-4" />, roles: ['admin'] },
            ]
        },
        { title: 'Lesson Activity', icon: <Edit3 className="h-5 w-5" />, path: '/dashboard?tab=ACTIVITY', roles: ['admin', 'teacher'] },
        { title: 'Reset Requests', icon: <MessageSquare className="h-5 w-5" />, path: '/dashboard/reset-requests', roles: ['admin'] },
        { title: 'Dashboard Style', icon: <Palette className="h-5 w-5" />, path: '/dashboard/dashboard-settings', roles: ['admin'] },
        { title: 'Logo Branding', icon: <ImageIcon className="h-5 w-5" />, path: '/dashboard/branding', roles: ['admin'] },
        {
            title: 'HR MANAGEMENT', icon: <UserCheck className="h-5 w-5" />, roles: ['admin', 'hr'],
            submenu: [
                { title: 'HR Attendance', path: '/dashboard/hr-attendance', icon: <Clock className="h-4 w-4" />, roles: ['admin', 'hr'] },
            ]
        },
        { title: 'Cleaning Schedule', path: '/dashboard/cleaning', icon: <ClipboardCheck className="h-5 w-5" />, roles: ['admin', 'hr'] },
        { title: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/dashboard/settings', roles: ['admin'] },
    ];

    const visibleItems = menuItems.filter(item => item.roles.includes(user?.role));

    // Split school name for better UI
    const nameParts = schoolInfo.schoolName.split(' ');
    const mainTitle = nameParts[0];
    const subTitle = nameParts.slice(1).join(' ') || 'Academy Portal';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <div className={`fixed md:static inset-y-0 left-0 w-64 h-screen text-slate-300 z-50 transition-transform duration-300 ease-in-out flex flex-col bg-[#1e293b] border-r border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>

                {/* Logo */}
                <div className="flex items-center justify-between h-24 px-5 border-b border-white/10">
                    <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                                <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-none uppercase truncate">{mainTitle}</h1>
                        </div>
                        <p className="text-[11px] text-white/80 font-black tracking-[0.2em] ml-10">SKILLS</p>
                    </div>

                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                    <p className="text-[12px] font-medium text-slate-400 uppercase tracking-widest mb-4 px-5">Main Menu</p>
                    <ul className="space-y-1.5">
                        {visibleItems.map((item, index) => {
                            const currentPath = location.pathname + location.search;
                            const hasSubActive = item.submenu && item.submenu.some(sub => location.pathname === sub.path);
                            const isActive = currentPath === item.path || location.pathname === item.path || hasSubActive || (location.pathname.startsWith(item.path) && item.path !== '/dashboard');

                            const isExpanded = expandedMenus[item.title] || hasSubActive;

                            return (
                                <li key={index} className="flex flex-col">
                                    {item.submenu ? (
                                        <button
                                            onClick={() => toggleMenu(item.title)}
                                            className={`flex items-center justify-between w-full gap-3 px-5 py-3 transition-all duration-300 ${isActive || isExpanded
                                                ? 'bg-slate-800 text-white font-medium'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`${isActive || isExpanded ? 'text-white' : 'text-slate-300'} transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-[14px] font-medium tracking-wide">{item.title}</span>
                                            </div>
                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-300" /> : <ChevronRight className="h-4 w-4 text-slate-300" />}
                                        </button>
                                    ) : (
                                            <Link
                                                to={item.path}
                                                onClick={() => {
                                                    if (window.innerWidth < 768) onClose();
                                                }}
                                                className={`flex items-center gap-3 px-5 py-3 transition-all duration-300 ${isActive
                                                    ? 'bg-blue-600 text-white font-medium border-l-4 border-blue-400'
                                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent'
                                                    }`}
                                            >
                                                <span className={isActive ? 'text-white' : 'text-slate-300'}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-[14px] font-medium tracking-wide">{item.title}</span>
                                            </Link>)}

                                    {/* Render Submenu if present and expanded */}
                                    {item.submenu && (
                                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <ul className="overflow-hidden pl-2 ml-7 border-l border-slate-700">
                                                {item.submenu
                                                    .filter(sub => !sub.roles || sub.roles.includes(user?.role))
                                                    .map((sub, sidx) => {
                                                        const isSubActive = location.pathname === sub.path;
                                                        return (
                                                            <li key={sidx}>
                                                                <Link
                                                                    to={sub.path}
                                                                    onClick={() => {
                                                                        if (window.innerWidth < 768) onClose();
                                                                    }}
                                                                    className={`flex items-center gap-3 px-5 py-2.5 transition-all duration-200 ${isSubActive
                                                                        ? 'text-blue-400 font-medium bg-slate-800/50'
                                                                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                                                                        }`}
                                                                >
                                                                    <span className={`${isSubActive ? 'text-blue-400' : 'text-slate-300'}`}>{sub.icon}</span>
                                                                    <span className="tracking-wide text-[14px] font-medium">{sub.title}</span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* User & Logout */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl p-4 mb-3 border border-slate-700 cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm transform group-hover:scale-110 transition-transform">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[14px] font-medium text-white truncate">{user?.name}</p>
                                <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            onClose && onClose();
                        }}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 uppercase tracking-wider rounded-xl hover:text-white hover:bg-red-500/80 transition-all duration-300"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
