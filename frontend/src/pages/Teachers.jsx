import { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, AlertCircle, Search, Plus, Eye, Edit2, Trash2, X, Save, Printer } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// Removed invalid import: import { initialSubjects } from './Subjects';

const statusStyle = { Active: 'bg-emerald-100 text-emerald-700', Inactive: 'bg-red-100 text-red-700' };
const empty = { name: '', subject: '', type: 'Full-Time', phone: '', username: '', assignedClasses: '', status: 'Active', password: '' };

const availableGrades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];

const Modal = ({ title, onClose, onSave, form, setForm, allSubjects, allGrades }) => {
    const handleClassToggle = (grade) => {
        let current = form.assignedClasses ? form.assignedClasses.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (current.includes(grade)) {
            current = current.filter(g => g !== grade);
        } else {
            current.push(grade);
        }
        setForm({ ...form, assignedClasses: current.join(', ') });
    };

    const handleSubjectToggle = (subjName) => {
        let current = form.subject ? form.subject.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (current.includes(subjName)) {
            current = current.filter(s => s !== subjName);
        } else {
            current.push(subjName);
        }
        setForm({ ...form, subject: current.join(', ') });
    };

    const assignedClassArray = form.assignedClasses ? form.assignedClasses.split(',').map(s => s.trim()).filter(Boolean) : [];
    const assignedSubjectArray = form.subject ? form.subject.split(',').map(s => s.trim()).filter(Boolean) : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="px-6 py-5 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned Subjects (Maadooyinka)</label>
                        <div className="flex flex-wrap gap-2">
                            {allSubjects.map(s => (
                                <button
                                    key={s._id || s.id}
                                    type="button"
                                    onClick={() => handleSubjectToggle(s.name)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${assignedSubjectArray.includes(s.name)
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                        {assignedSubjectArray.length === 0 && <p className="text-xs text-amber-500 mt-2">Fadlan ku dar ugu yaraan hal maado.</p>}
                    </div>

                    {[{ key: 'phone', label: 'Phone' }, { key: 'username', label: 'Username' }, { key: 'salary', label: 'Salary (Monthly)', type: 'number' }].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                            <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    ))}
                    {[{ key: 'type', label: 'Employment Type', opts: ['Full-Time', 'Part-Time', 'Contract'] }, { key: 'status', label: 'Status', opts: ['Active', 'Inactive'] }].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                            <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors bg-white">
                                {f.opts.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    ))}

                    {title.includes('Register') && (
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Login Password</label>
                            <input
                                type="password"
                                placeholder="Create a password for this teacher"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] transition-colors"
                            />
                        </div>
                    )}

                    <div className="col-span-2 mt-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned Classes / Grades (Fasalada)</label>
                        <div className="flex flex-wrap gap-2">
                            {allGrades.map(g => (
                                <button
                                    key={g._id || g.id}
                                    type="button"
                                    onClick={() => handleClassToggle(g.name)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${assignedClassArray.includes(g.name)
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                        {assignedClassArray.length === 0 && <p className="text-xs text-amber-500 mt-2">Fadlan ku dar ugu yaraan hal fasal.</p>}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                    <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-xl hover:bg-[#1d4ed8] transition-colors">
                        <Save className="h-4 w-4" /> Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const ViewModal = ({ item, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Teacher Profile</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">{item.name.charAt(0)}</div>
                    <div><p className="font-semibold text-gray-900 text-lg">{item.name}</p><p className="text-sm text-gray-500">{item.subject} Teacher</p></div>
                </div>
                <div className="space-y-3">
                    {[['Role', 'Teacher'], ['Type', item.type], ['Phone', item.phone], ['Username', item.username], ['Salary', `$${item.salary || 0}`], ['Assigned Classes', item.assignedClasses], ['Status', item.status]].map(([k, v]) => (
                        <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 flex-col sm:flex-row sm:items-center gap-1">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">{k}</span>
                            <span className="text-sm font-medium text-gray-700 sm:text-right">{v || 'None'}</span>
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
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm px-6 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-500" /></div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Remove Teacher?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to remove <strong>{item?.name}</strong> from the directory?</p>
            <div className="flex gap-2 justify-center">
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Remove</button>
            </div>
        </div>
    </div>
);

const Teachers = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [allGrades, setAllGrades] = useState([]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const [tRes, sRes, gRes] = await Promise.all([
                axios.get('/api/teachers', config),
                axios.get('/api/subjects', config),
                axios.get('/api/grades', config)
            ]);
            setData(tRes.data);
            setSubjects(sRes.data);
            setAllGrades(gRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const filtered = data.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.subject?.toLowerCase().includes(search.toLowerCase()) || (t.assignedClasses && t.assignedClasses.toLowerCase().includes(search.toLowerCase())));

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
                const newTeacher = { ...form, id: Date.now() };
                const { data: created } = await axios.post('/api/teachers', newTeacher, config);
                setData([...data, created]);
            } else {
                const { data: updated } = await axios.put(`/api/teachers/${selected.id}`, form, config);
                setData(data.map(d => d.id === selected.id ? updated : d));
            }
            fetchData();
            close();
        } catch (error) {
            console.error('Error saving teacher:', error);
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
            await axios.delete(`/api/teachers/${selected.id}`, config);
            setData(data.filter(d => d.id !== selected.id));
            fetchData();
            close();
        } catch (error) {
            console.error('Error deleting teacher:', error);
        }
    };

    return (
        <div className="max-w-[1500px] mx-auto pb-10 px-4 lg:px-6">
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
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                `}
            </style>
            {(modal === 'add' || modal === 'edit') && <Modal title={modal === 'add' ? 'Register New Teacher' : 'Edit Teacher Details'} onClose={close} onSave={handleSave} form={form} setForm={setForm} allSubjects={subjects} allGrades={allGrades} />}
            {modal === 'view' && selected && <ViewModal item={selected} onClose={close} />}
            {modal === 'delete' && selected && <DeleteModal item={selected} onClose={close} onConfirm={handleDelete} />}

            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-2 sm:px-0">
                <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Teachers Directory</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 no-print">Manage staff and teaching assignments</p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                    <button
                        onClick={() => window.print()}
                        className="no-print flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button onClick={() => { setForm({ ...empty }); setModal('add'); }} className="no-print flex items-center gap-2 px-6 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-100 active:scale-95">
                        <Plus className="h-4 w-4" /> Register Teacher
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 no-print px-1 sm:px-0">
                {[
                    { label: 'Total Teachers', value: data.length, sub: 'Directory', icon: <Users className="h-4 w-4 text-blue-600" />, color: 'bg-blue-50/50' },
                    { label: 'Active Staff', value: data.filter(d => d.status === 'Active').length, sub: 'Teaching', icon: <BookOpen className="h-4 w-4 text-emerald-600" />, color: 'bg-emerald-50/50' },
                    { label: 'Full-Time', value: data.filter(d => d.type === 'Full-Time').length, sub: 'Permanent', icon: <Clock className="h-4 w-4 text-purple-600" />, color: 'bg-purple-50/50' },
                    { label: 'On Leave', value: data.filter(d => d.status === 'Inactive').length, sub: 'Inactive', icon: <AlertCircle className="h-4 w-4 text-amber-600" />, color: 'bg-amber-50/50' },
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
                        <input type="text" placeholder="Search teachers or classes..." value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-gray-600 font-bold outline-none w-full placeholder-gray-400" />
                    </div>
                </div>
                <div className="table-responsive-container no-scrollbar">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                            <tr>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Name</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Role</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Subject</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Classes Assigned</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Phone</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{t.name}</td>
                                    <td className="px-5 py-3"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Teacher</span></td>
                                    <td className="px-5 py-3 text-gray-600">{t.subject}</td>
                                    <td className="px-5 py-3 text-green-600 font-medium max-w-xs truncate">{t.assignedClasses || <span className="text-amber-500 font-normal">Unassigned</span>}</td>
                                    <td className="px-5 py-3 text-gray-500">{t.phone}</td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle[t.status]}`}>{t.status}</span></td>
                                    <td className="px-5 py-3 no-print">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => { setSelected(t); setModal('view'); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="h-4 w-4" /></button>
                                            <button onClick={() => { setSelected(t); setForm({ ...t }); setModal('edit'); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                                            <button onClick={() => { setSelected(t); setModal('delete'); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No teachers found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Teachers;
