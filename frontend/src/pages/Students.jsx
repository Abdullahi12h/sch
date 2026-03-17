import { useState, useEffect } from 'react';
import { Users, GraduationCap, UserCheck, Search, Plus, Eye, Edit2, Trash2, ChevronDown, X, Save, BookOpen, Printer } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const gpaColor = g => { const n = parseFloat(g); if (n >= 3.7) return 'text-emerald-600 bg-emerald-50'; if (n >= 3.0) return 'text-blue-600 bg-blue-50'; if (n >= 2.5) return 'text-amber-600 bg-amber-50'; return 'text-red-600 bg-red-50'; };
const empty = { name: '', grade: '', gender: 'Male', shift: 'Morning', address: '', status: 'Active', parent: '', phone: '', dob: '' };

const Modal = ({ title, onClose, onSave, form, setForm, grades }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
                {[{ key: 'name', label: 'Full Name', type: 'text', span: 2 }, { key: 'parent', label: 'Parent/Guardian', type: 'text' }, { key: 'phone', label: 'Phone', type: 'text' }, { key: 'dob', label: 'Date of Birth', type: 'date' }, { key: 'address', label: 'Address', type: 'text' }].map(f => (
                    <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                        <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors" />
                    </div>
                ))}
                {[{ key: 'grade', label: 'Grade', opts: grades.map(g => g.name) }, { key: 'gender', label: 'Gender', opts: ['Male', 'Female'] }, { key: 'shift', label: 'Shift', opts: ['Morning', 'Afternoon'] }, { key: 'status', label: 'Status', opts: ['Active', 'Inactive'] }].map(f => (
                    <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                        <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors bg-white">
                            <option value="">-- Select --</option>
                            {f.opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-xl hover:bg-[#1d4ed8] transition-colors">
                    <Save className="h-4 w-4" /> Save
                </button>
            </div>
        </div>
    </div>
);

const ViewModal = ({ item, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Student Details</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">{item.name.charAt(0)}</div>
                    <div><p className="font-semibold text-gray-900 text-lg">{item.name}</p><p className="text-sm text-gray-500">{item.grade} · {item.gender}</p></div>
                </div>
                <div className="space-y-3">
                    {[['Address', item.address], ['Shift', item.shift], ['Date of Birth', item.dob], ['Parent/Guardian', item.parent], ['Phone', item.phone], ['Status', item.status]].map(([k, v]) => (
                        <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{k}</span>
                            <span className="text-sm font-medium text-gray-700">{v}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Close</button>
            </div>
        </div>
    </div>
);

const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-500" /></div>
                <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Student?</h2>
                <p className="text-sm text-gray-500">Are you sure you want to delete <strong>{item?.name}</strong>? This cannot be undone.</p>
            </div>
            <div className="px-6 pb-6 flex gap-2 justify-center">
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
        </div>
    </div>
);

const Students = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [gradesData, setGradesData] = useState([]);
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        if (!user) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('/api/students', config);
            setData(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGrades = async () => {
        if (!user) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('/api/grades', config);
            setGradesData(data);
        } catch (error) {
            console.error('Error fetching grades:', error);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchGrades();
    }, [user]);

    const grades = ['All', ...Array.from(new Set(data.map(s => s.grade?.trim()).filter(Boolean)))];
    const filtered = data.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchesGrade = gradeFilter === 'All' || (s.grade && s.grade.toLowerCase().trim() === gradeFilter.toLowerCase().trim());
        return matchesSearch && matchesGrade;
    });

    const openAdd = () => { setForm({ ...empty }); setModal('add'); };
    const openEdit = i => { setSelected(i); setForm({ ...i }); setModal('edit'); };
    const openView = i => { setSelected(i); setModal('view'); };
    const openDelete = i => { setSelected(i); setModal('delete'); };
    const close = () => { setModal(null); setSelected(null); };

    const handleSave = async () => {
        if (!form.name.trim() || !user) return;
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            if (modal === 'add') {
                const newStudent = { ...form, id: Date.now() };
                const { data: created } = await axios.post('/api/students', newStudent, config);
                setData([...data, created]);
            } else {
                const { data: updated } = await axios.put(`/api/students/${selected.id}`, form, config);
                setData(data.map(d => d.id === selected.id ? updated : d));
            }
            close();
        } catch (error) {
            console.error('Error saving student:', error);
        }
    };

    const handleDelete = async () => {
        if (!selected || !user) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.delete(`/api/students/${selected.id}`, config);
            setData(data.filter(d => d.id !== selected.id));
            close();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    return (
        <div className="max-w-[1500px] mx-auto px-4 lg:px-6">
            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 10mm; }
                    .no-print { display: none !important; }
                    body { background: white !important; font-size: 10pt; color: black !important; }
                    .p-6 { padding: 0 !important; }
                    .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
                    .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; border: 1px solid #eee !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #eee !important; padding: 6px 4px !important; font-size: 9pt !important; text-align: left !important; }
                    .text-emerald-600, .bg-emerald-50, .bg-emerald-100 { color: black !important; background: transparent !important; border: 1px solid #eee !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                `}
            </style>
            {(modal === 'add' || modal === 'edit') && <Modal title={modal === 'add' ? 'Add Student' : 'Edit Student'} onClose={close} onSave={handleSave} form={form} setForm={setForm} grades={gradesData} />}
            {modal === 'view' && selected && <ViewModal item={selected} onClose={close} />}
            {modal === 'delete' && selected && <DeleteModal item={selected} onClose={close} onConfirm={handleDelete} />}

            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-2 sm:px-0">
                <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">
                        Students Directory
                        {gradeFilter !== 'All' && <span className="hidden print:inline ml-2 text-gray-500">— {gradeFilter}</span>}
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 no-print">View and manage all enrolled students</p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                    <button
                        onClick={() => window.print()}
                        className="no-print flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button onClick={openAdd} className="no-print flex items-center gap-2 px-6 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-100 active:scale-95">
                        <Plus className="h-4 w-4" /> Add Student
                    </button>
                </div>
            </div>

            <div className="card-grid mb-6 no-print px-1 sm:px-0">
                {[
                    { label: 'Total Students', value: data.length, sub: 'All grades', icon: <Users className="h-4 w-4 text-blue-600" />, color: 'bg-blue-50/50' },
                    { label: 'Active', value: data.filter(d => d.status === 'Active').length, sub: 'Enrolled', icon: <UserCheck className="h-4 w-4 text-emerald-600" />, color: 'bg-emerald-50/50' },
                    { label: 'Families', value: new Set(data.map(d => d.parent)).size, sub: 'Registered', icon: <Users className="h-4 w-4 text-purple-600" />, color: 'bg-purple-50/50' },
                    { label: 'Avg Attendance', value: '94%', sub: 'Weekly', icon: <BookOpen className="h-4 w-4 text-amber-600" />, color: 'bg-amber-50/50' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 shadow-xs hover:shadow-md transition-all group col-span-1">
                        <div className={`p-2.5 rounded-xl ${s.color} shrink-0 group-hover:scale-110 transition-transform shadow-xs`}>{s.icon}</div>
                        <div className="text-center sm:text-left min-w-0 w-full">
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{s.label}</p>
                            <p className="text-base sm:text-2xl font-black text-gray-900 mt-0.5 tracking-tighter leading-none">{s.value}</p>
                            <p className="hidden sm:block text-[9px] text-gray-400 mt-0.5 font-bold truncate uppercase tracking-tighter">{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between no-print bg-gray-50/30">
                    <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 w-full lg:w-64 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-gray-600 font-bold outline-none w-full placeholder-gray-400" />
                    </div>
                    <div className="flex items-center gap-1.5 border border-gray-100 rounded-xl px-4 py-2 text-xs font-black uppercase text-gray-500 bg-white hover:border-blue-400 select-none shadow-sm transition-all cursor-pointer">
                        <span>Fasalka:</span>
                        <select className="bg-transparent outline-none cursor-pointer text-xs font-black text-blue-600" value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                            {grades.map(g => <option key={g}>{g}</option>)}
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                </div>
                <div className="table-responsive-container no-scrollbar pb-4">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                            <tr>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">#</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Name</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Grade</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Gender</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Shift</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">DOB</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Parent</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Phone</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Address</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((s, i) => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{String(i + 1).padStart(3, '0')}</td>
                                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{s.name}</td>
                                    <td className="px-5 py-3 text-gray-600">{s.grade}</td>
                                    <td className="px-5 py-3 text-gray-500">{s.gender}</td>
                                    <td className="px-5 py-3 text-gray-500">{s.shift}</td>
                                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{s.dob}</td>
                                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{s.parent}</td>
                                    <td className="px-5 py-3 text-gray-500">{s.phone}</td>
                                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{s.address || '-'}</td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span></td>
                                    <td className="px-5 py-3 no-print">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openView(s)} className="p-1.5 rounded-lg hover:bg-blue-50  text-gray-400 hover:text-blue-600  transition-colors"><Eye className="h-4 w-4" /></button>
                                            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                                            <button onClick={() => openDelete(s)} className="p-1.5 rounded-lg hover:bg-red-50   text-gray-400 hover:text-red-500   transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={11} className="px-5 py-10 text-center text-gray-400">No students found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
                    Showing {filtered.length} of {data.length} students
                </div>
            </div>
        </div>
    );
};

export default Students;
