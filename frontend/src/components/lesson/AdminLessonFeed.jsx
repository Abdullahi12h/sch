import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    Search, Book, Edit, Trash2, Printer, Plus,
    ChevronDown, UserCheck, X, Save
} from 'lucide-react';

const AdminLessonFeed = ({ teachersList = [] }) => {
    const { user } = useAuth();
    const [feed, setFeed] = useState([]);
    const [localTeachers, setLocalTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        chapter: '',
        page: '',
        status: 'Completed'
    });

    // Merge props teachers and local teachers, then de-duplicate by _id
    const teachers = useMemo(() => {
        const all = [...(Array.isArray(teachersList) ? teachersList : []), ...localTeachers];
        const unique = {};
        all.forEach(t => {
            if (t && t._id) unique[t._id] = t;
        });
        return Object.values(unique).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [teachersList, localTeachers]);

    const fetchTeachers = async () => {
        if (Array.isArray(teachersList) && teachersList.length > 0) return;

        try {
            const token = user?.token;
            if (!token) return;
            
            const { data } = await axios.get('/api/teachers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const teacherArray = data.data || data.teachers || (Array.isArray(data) ? data : []);
            setLocalTeachers(teacherArray);
        } catch (error) {
            console.error('[AdminLessonFeed] Local teacher fetch failed:', error);
        }
    };

    const fetchFeed = async () => {
        try {
            const token = user?.token;
            if (!token) return;

            setLoading(true);
            const url = selectedTeacher 
                ? `/api/lesson-logs/feed?teacherId=${selectedTeacher}`
                : '/api/lesson-logs/feed';
            
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const feedData = data.data || data || [];
            if (Array.isArray(feedData)) {
                setFeed(feedData);
            }
        } catch (error) {
            console.error('[AdminLessonFeed] Feed fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchTeachers();
            fetchFeed();
        }
    }, [selectedTeacher, user?.token, teachersList?.length]);

    // Client-side filtering
    const filteredFeed = useMemo(() => {
        return feed.filter(log => {
            if (selectedTeacher && log.teacher?._id !== selectedTeacher) return false;
            const matchesSearch = 
                (log.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.grade?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [feed, searchTerm, selectedTeacher]);

    const handleDelete = async (id) => {
        if (!window.confirm('Ma huba weeye inaad tirtirto xogtan?')) return;
        try {
            const token = user?.token;
            await axios.delete(`/api/lesson-logs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeed(prev => prev.filter(log => log._id !== id));
        } catch (error) {
            alert('Cilad ayaa dhacday markii la tirtirayay xogta');
        }
    };

    const openEditModal = (log) => {
        setEditingLog(log);
        setEditFormData({
            title: log.title,
            chapter: log.chapter,
            page: log.page,
            status: log.status || 'Completed'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token;
            await axios.put(`/api/lesson-logs/${editingLog._id}`, editFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditModalOpen(false);
            fetchFeed(); // Refresh feed
        } catch (error) {
            alert('Cilad ayaa dhacday markii la cusboonaysiinayay xogta');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const teacherName = selectedTeacher 
            ? teachers.find(t => t._id === selectedTeacher)?.name?.toUpperCase() 
            : 'DHAMAAN MACALIMIINTA (ALL TEACHERS)';
        
        const content = `
            <html>
                <head>
                    <title>Report - ${teacherName}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0f172a; padding-bottom: 25px; }
                        .header h1 { margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; color: #0f172a; }
                        .header .sub { margin: 10px 0; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .info-item { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9; }
                        .info-item label { display: block; font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
                        .info-item span { font-size: 12px; font-weight: 800; color: #1e293b; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th { background: #0f172a; padding: 15px 12px; text-align: left; font-size: 10px; text-transform: uppercase; color: white; border: 1px solid #0f172a; letter-spacing: 1px; }
                        td { padding: 12px; font-size: 11px; border: 1px solid #f1f5f9; color: #334155; font-weight: 600; }
                        tr:nth-child(even) { background: #fcfdfe; }
                        .teacher-cell { font-weight: 800; color: #0f172a; }
                        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 9px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 2px; }
                        @page { size: auto; margin: 0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>LESSON LOG REPORT</h1>
                        <div class="sub">Academic Activity Monitoring System</div>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>TEACHER / MACALINKA</label>
                            <span>${teacherName}</span>
                        </div>
                        <div class="info-item">
                            <label>REPORT DATE / TAARIIKHDA</label>
                            <span>${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>MACALINKA / TEACHER</th>
                                <th>FASALKA / GRADE</th>
                                <th>MAADADA / SUBJECT</th>
                                <th>CHAPTER</th>
                                <th>CASHARKA / LESSON</th>
                                <th>PAGE</th>
                                <th>DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredFeed.map(log => `
                                <tr>
                                    <td class="teacher-cell">${log.teacher?.name?.toUpperCase()}</td>
                                    <td>${log.grade?.name?.toUpperCase()}</td>
                                    <td>${log.subject?.name?.toUpperCase()}</td>
                                    <td style="text-align: center;">${log.chapter}</td>
                                    <td>${log.title?.toUpperCase()}</td>
                                    <td style="text-align: center;">${log.page}</td>
                                    <td>${new Date(log.date).toLocaleDateString('en-GB')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        School Management System - Official Lesson Log Document
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                                window.onafterprint = () => window.close();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
    };

    return (
        <div className="space-y-8 mt-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        Dhammaystirka Manhajka
                    </h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">
                        Real-time syllabus completion tracking and monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                    >
                        <Printer className="h-4 w-4" /> Print List
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                        <Plus className="h-4 w-4" /> Add Activity
                    </button>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-4xl border border-gray-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Filters Header */}
                <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-50 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 transition-all">
                            <Search className="h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-600" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Raadi cashar, fasal ama macalin..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 shadow-sm transition-all placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 bg-white pl-5 pr-4 py-2 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group relative">
                            <div className="flex items-center gap-3 min-w-[220px]">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                    <UserCheck className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Xogta Macalimiinta</span>
                                    <select 
                                        className="bg-transparent text-xs font-black text-slate-800 focus:outline-hidden cursor-pointer w-full"
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                    >
                                        <option value="">DHAMAAN MACALIMIINTA (ALL)</option>
                                        {teachers.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.name?.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="px-8 py-6 border-b border-gray-100">MACALINKA / NAME</th>
                                <th className="px-8 py-6 border-b border-gray-100">GRADE</th>
                                <th className="px-8 py-6 border-b border-gray-100">SUBJECT</th>
                                <th className="px-8 py-6 border-b border-gray-100">CHAPTER</th>
                                <th className="px-8 py-6 border-b border-gray-100">LESSON / TITLE</th>
                                <th className="px-8 py-6 border-b border-gray-100">PAGE</th>
                                <th className="px-8 py-6 border-b border-gray-100">DATE</th>
                                <th className="px-8 py-6 border-b border-gray-100">STATUS</th>
                                <th className="px-8 py-6 border-b border-gray-100 text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredFeed.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                                <Book className="h-10 w-10 text-slate-200" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Ma jiraan xog casharo ah</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredFeed.map((log) => (
                                    <tr key={log._id} className="group hover:bg-blue-50/30 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 border-2 border-white shadow-xl text-white flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110">
                                                    {log.teacher?.name?.charAt(0).toUpperCase() || 'M'}
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-black text-slate-800 uppercase tracking-tight">{log.teacher?.name}</span>
                                                    <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Instructor</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                {log.grade?.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                {log.subject?.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-center">
                                                <span className="text-[11px] font-black text-slate-700">{log.chapter}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-[150px]">
                                                <span className="text-xs font-bold text-slate-600 truncate block">{log.title || 'Untitled Lesson'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-center">
                                                <span className="text-[11px] font-black text-blue-700">{log.page}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-700 tabular-nums">
                                                    {new Date(log.date).toLocaleDateString('en-GB')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => openEditModal(log)}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-blue-600 hover:bg-blue-50 transition-all shadow-sm group/btn"
                                                >
                                                    <Edit className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(log._id)}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-rose-600 hover:bg-rose-50 transition-all shadow-sm group/btn"
                                                >
                                                    <Trash2 className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Cusboonaysii Casharka</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Wax ka beddel macluumaadka casharka</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lesson Title</label>
                                <input 
                                    type="text"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chapter</label>
                                    <input 
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
                                        value={editFormData.chapter}
                                        onChange={(e) => setEditFormData({...editFormData, chapter: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Page Number</label>
                                    <input 
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
                                        value={editFormData.page}
                                        onChange={(e) => setEditFormData({...editFormData, page: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Save className="h-4 w-4" /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLessonFeed;
