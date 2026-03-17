import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layers, Search, Plus, Edit2, Trash2, X, Save, Users, Eye, Printer } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const empty = { name: '', code: '', capacity: 40, status: 'Active', subjects: [], feeAmount: 0, examFeeAmount: 0 };

const Modal = ({ title, onClose, onSave, form, setForm, allSubjects }) => {
    const toggleSubject = (name) => {
        const current = form.subjects || [];
        if (current.includes(name)) {
            setForm({ ...form, subjects: current.filter(s => s !== name) });
        } else {
            setForm({ ...form, subjects: [...current, name] });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="px-6 py-5 grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Grade/Class Name</label>
                            <input type="text" placeholder="e.g. Grade 7" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Class Code</label>
                            <input type="text" placeholder="e.g. G7" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Capacity</label>
                            <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors bg-white">
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fee Amount ($)</label>
                            <input type="number" min="0" value={form.feeAmount} onChange={e => setForm({ ...form, feeAmount: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Exam Fee Amount ($)</label>
                            <input type="number" min="0" value={form.examFeeAmount} onChange={e => setForm({ ...form, examFeeAmount: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assign Subjects</label>
                        <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-40 overflow-y-auto">
                            {allSubjects.map(sub => (
                                <label key={sub._id} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={(form.subjects || []).includes(sub.name)}
                                        onChange={() => toggleSubject(sub.name)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">{sub.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
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
};

const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm px-6 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-500" /></div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Grade?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong>{item?.name}</strong>?</p>
            <div className="flex gap-2 justify-center">
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
        </div>
    </div>
);

const Grades = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const [gradesRes, subjectsRes] = await Promise.all([
                axios.get('/api/grades', config),
                axios.get('/api/subjects', config)
            ]);
            setData(gradesRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Error fetching grades/subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const filtered = data.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()) || g.code?.toLowerCase().includes(search.toLowerCase()));

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
                const { data: created } = await axios.post('/api/grades', form, config);
                setData([...data, created]);
            } else {
                const { data: updated } = await axios.put(`/api/grades/${selected._id}`, form, config);
                setData(data.map(d => d._id === selected._id ? updated : d));
            }
            close();
        } catch (error) {
            console.error('Error saving grade:', error);
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
            await axios.delete(`/api/grades/${selected._id}`, config);
            setData(data.filter(d => d._id !== selected._id));
            close();
        } catch (error) {
            console.error('Error deleting grade:', error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
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
                    }
                    .mx-auto { margin: 0 !important; max-width: 100% !important; }
                    .p-6, .px-6, .py-4, .pb-10 { padding: 4px !important; }
                    .shadow-sm { box-shadow: none !important; border: none !important; }
                    .rounded-xl { border-radius: 0 !important; }
                    
                    /* Table Styling */
                    .overflow-x-auto { overflow: visible !important; }
                    table { width: 100% !important; border-collapse: collapse !important; border: 0.5pt solid black !important; margin-top: 2mm; }
                    th, td { 
                        border: 0.5pt solid black !important; 
                        padding: 8px !important; 
                        text-align: left !important; 
                        font-size: 9pt !important;
                    }
                    th { background-color: #f2f2f2 !important; font-weight: bold !important; text-transform: uppercase !important; }
                    
                    .print-header { 
                        display: block !important; 
                        margin-bottom: 20px; 
                        border-bottom: 2pt solid #000; 
                        padding-bottom: 10px; 
                        text-align: center;
                    }
                    .bg-emerald-100, .bg-red-100 { background: transparent !important; border: 1px solid #ddd !important; }
                }
                .print-header { display: none; }
                `}
            </style>

            <div className="print-header">
                <h1 className="text-2xl font-black uppercase">Official Grade/Class List</h1>
                <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">School Year 2024/25 - Administrative Record</p>
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <Modal
                    title={modal === 'add' ? 'Add New Grade' : 'Edit Grade'}
                    onClose={close}
                    onSave={handleSave}
                    form={form}
                    setForm={setForm}
                    allSubjects={subjects}
                />
            )}
            {modal === 'delete' && selected && <DeleteModal item={selected} onClose={close} onConfirm={handleDelete} />}

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Grades</h1>
                    <p className="text-sm text-gray-500 mt-1">Add or update classes and grades in the school</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="h-3.5 w-3.5" /> Print List
                    </button>
                    <button onClick={() => { setForm({ ...empty }); setModal('add'); }} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> Add Grade
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <input type="text" placeholder="Search by grade name or code..." value={search} onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                            <tr>{['Grade Name', 'Code', 'Capacity', 'Enrolled', 'Fee ($)', 'Exam Fee ($)', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((g) => {
                                const isFull = g.studentsCount >= g.capacity;
                                return (
                                    <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-semibold text-gray-900 flex items-center gap-2"><Layers className="h-4 w-4 text-blue-600" />{g.name}</td>
                                        <td className="px-5 py-3 text-gray-500 font-mono">{g.code}</td>
                                        <td className="px-5 py-3 text-gray-600">{g.capacity}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className={`font-medium ${isFull ? 'text-red-600' : 'text-gray-900'}`}>{g.studentsCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-900 font-bold">${g.feeAmount || 0}</td>
                                        <td className="px-5 py-3 text-blue-600 font-bold">${g.examFeeAmount || 0}</td>
                                        <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${g.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{g.status}</span></td>
                                        <td className="px-5 py-3">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => navigate(`/dashboard/grades/${g._id}`)} title="View Details" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => { setSelected(g); setForm({ ...g }); setModal('edit'); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                                                <button onClick={() => { setSelected(g); setModal('delete'); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No grades found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Grades;
