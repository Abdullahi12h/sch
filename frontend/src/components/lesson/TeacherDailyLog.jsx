import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { BookOpen, Clock, AlertCircle, CheckCircle2, History, Send, Printer, Search, X, Info, Settings } from 'lucide-react';

const TeacherDailyLog = () => {
    const { user } = useAuth();
    const { academicYears, selectedYear } = useAcademicYear();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const printRef = useRef();

    const handlePrint = () => {
        window.print();
    };
    
    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        grade: '',
        title: '',
        chapter: '',
        page: ''
    });

    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchLogs = async () => {
        try {
            const { data } = await axios.get('/api/lesson-logs/my-logs', config);
            setLogs(data.data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const fetchData = async () => {
        try {
            const [subsRes, gradesRes] = await Promise.all([
                axios.get('/api/subjects', config),
                axios.get('/api/grades', config)
            ]);
            let currentSubjects = subsRes.data || [];
            
            // Filter subjects for teacher
            if (user?.role === 'teacher') {
                const teacherProfile = user.teacherData;
                if (teacherProfile && teacherProfile.subject) {
                    const assignedSubjectNames = teacherProfile.subject.split(',').map(s => s.trim().toLowerCase());
                    currentSubjects = currentSubjects.filter(sub => assignedSubjectNames.includes(sub.name.toLowerCase()));
                } else if (!teacherProfile) {
                    try {
                        const { data: teachers } = await axios.get('/api/teachers?status=Active', config);
                        const foundTeacher = teachers.find(t => t.username === user.username);
                        if (foundTeacher && foundTeacher.subject) {
                            const assignedSubjectNames = foundTeacher.subject.split(',').map(s => s.trim().toLowerCase());
                            currentSubjects = currentSubjects.filter(sub => assignedSubjectNames.includes(sub.name.toLowerCase()));
                        }
                    } catch (e) { console.error('Error fetching teacher specifics', e); }
                }
            }

            setSubjects(currentSubjects);
            setGrades(gradesRes.data || []);
            fetchLogs();
        } catch (error) {
            console.error('Error fetching dropdown data', error);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post('/api/lesson-logs', {
                ...formData,
                teacher: user.teacherId, // assuming user object has teacherId
                academicYear: selectedYear
            }, config);
            
            alert('Cashirka waala xareeyey (Lesson logged successfully)');
            setFormData({ subject: '', grade: '', title: '', chapter: '', page: '' });
            setShowForm(false);
            fetchLogs();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to log lesson');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => 
        log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.grade?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 printable-area" ref={printRef}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        Macalinka Activity
                    </h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        Manage and track your daily lessons in the school
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="h-4 w-4" /> Print List
                    </button>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                        {showForm ? <X className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                        {showForm ? 'Cancel' : '+ Add Activity'}
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all">
                {/* Search Bar Area */}
                <div className="px-8 py-6 bg-gray-50/30 border-b border-gray-50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by lesson name or grade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-slate-600 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Form Section - Toggleable Overlay or In-place */}
                {showForm && (
                    <div className="px-8 py-8 border-b border-gray-50 bg-blue-50/20 animate-in slide-in-from-top duration-300">
                        <div className="max-w-4xl">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6">Xaraynta Cashirka Cusub</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Fasalka (Grade)</label>
                                    <select name="grade" value={formData.grade} onChange={handleChange} required className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm">
                                        <option value="">Dooro Fasalka...</option>
                                        {grades.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Maaddada (Subject)</label>
                                    <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm">
                                        <option value="">Dooro Maaddada...</option>
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Ciwaanka (Title)</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Ex: Hordhaca" className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Cutubka (Chapter)</label>
                                    <input type="text" name="chapter" value={formData.chapter} onChange={handleChange} required placeholder="Ex: Ch 4" className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Bogga (Page)</label>
                                    <input type="text" name="page" value={formData.page} onChange={handleChange} required placeholder="Ex: p. 45" className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm" />
                                </div>
                                <div className="flex items-end">
                                    <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {loading ? 'Sugan...' : 'Save Lesson Activity'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                                <th className="px-8 py-6">LESSON TITLE</th>
                                <th className="px-8 py-6">SUBJECT</th>
                                <th className="px-8 py-6">GRADE</th>
                                <th className="px-8 py-6 text-center">CHAPTER / PAGE</th>
                                <th className="px-8 py-6 text-center">DATE</th>
                                <th className="px-8 py-6 text-center">STATUS</th>
                                <th className="px-8 py-6 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-300 space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em]">Ma jiro wax xog ah oo la helay</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-800">{log.title || 'Ciwaan La\'aan'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-medium text-slate-600 uppercase tracking-tight whitespace-nowrap truncate max-w-[120px] block" title={log.subject?.name}>
                                                {log.subject?.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-tight whitespace-nowrap">
                                                {log.grade?.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-xs font-medium text-slate-600 uppercase">
                                                Ch: <span>{log.chapter}</span> <span className="text-gray-200 mx-2">|</span> Pg: <span>{log.page}</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                                            {new Date(log.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-widest">
                                                    Active
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                                    <Info className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                                    <Settings className="h-4 w-4" />
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

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    /* Hide everything by default */
                    body * {
                        visibility: hidden;
                    }
                    /* Only show the printRef container and its children */
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    /* Position the printable area at the top-left */
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    /* Hide unnecessary UI elements during print */
                    .printable-area button, 
                    .printable-area input,
                    .printable-area .bg-gray-50\\/30,
                    .printable-area .text-right,
                    .printable-area th:last-child,
                    .printable-area td:last-child {
                        display: none !important;
                    }
                    /* Ensure table looks good on paper */
                    .printable-area table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    .printable-area th, .printable-area td {
                        border: 1px solid #eee !important;
                        padding: 12px 8px !important;
                        color: black !important;
                    }
                    .printable-area .bg-blue-50, .printable-area .bg-slate-900 {
                        background-color: #f8fafc !important;
                        color: black !important;
                        border: 1px solid #ddd !important;
                    }
                    /* Remove transitions and animations for print */
                    * {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}} />
        </div>
    );
};

export default TeacherDailyLog;
