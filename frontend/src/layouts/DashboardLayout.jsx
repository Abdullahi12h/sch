import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';
import { Bell, Search, Menu, CalendarDays, ChevronDown } from 'lucide-react';
import { loadBgConfig, getBgStyle } from '../pages/DashboardSettings';

const DashboardLayout = () => {
    const { user } = useAuth();
    const { academicYears, selectedYear, setSelectedYear } = useAcademicYear();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [bgConfig, setBgConfig] = useState(loadBgConfig);

    useEffect(() => {
        const handleBgUpdate = () => setBgConfig(loadBgConfig());
        window.addEventListener('bgConfigUpdate', handleBgUpdate);
        return () => window.removeEventListener('bgConfigUpdate', handleBgUpdate);
    }, []);

    const bgStyle = getBgStyle(bgConfig);

    const breadcrumb = location.pathname.split('/').filter(Boolean).map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '));

    return (
        <div className="flex h-screen font-sans relative overflow-hidden" style={bgStyle}>
            {/* Sidebar with Mobile Support */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 md:hidden hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
                        >
                            <Menu className="h-5 w-5 text-gray-600" />
                        </button>

                        <div className="hidden lg:flex flex-col ml-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Al-Nuur Academy</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                {breadcrumb.map((b, i) => (
                                    <span key={i} className="flex items-center gap-1">
                                        {i > 0 && <span className="text-gray-300 text-[10px]">/</span>}
                                        <span className={`text-[10px] font-bold ${i === breadcrumb.length - 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {b}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Xog raadi..."
                                className="bg-transparent text-sm text-gray-700 font-medium placeholder-gray-400 outline-none w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Global Academic Year Selector */}
                        {/* Global Academic Year Selector - Now visible on mobile */}
                        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 cursor-pointer hover:border-blue-400 transition-colors">
                            <CalendarDays className="h-3 w-3 text-blue-600 shrink-0" />
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                className="bg-transparent text-[10px] font-black text-blue-700 outline-none cursor-pointer pr-1"
                            >
                                <option value="All">All Years</option>
                                {academicYears.map(y => (
                                    <option key={y._id} value={y.name}>
                                        {y.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <Bell className="h-5 w-5 text-gray-500" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                        </button>

                        {/* User Avatar */}
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content - Optimized for all screens from Mobile to 4K */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto dashboard-container" style={bgStyle}>
                    <div className="max-w-[1600px] mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
