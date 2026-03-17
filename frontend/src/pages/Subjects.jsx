import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, Plus, Edit2, Trash2, X, Save, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const empty = { name: '', status: 'Active' };

const Modal = ({ title, onClose, onSave, form, setForm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subject Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors bg-white">
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
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

const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm px-6 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-500" /></div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Subject?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong>{item?.name}</strong>?</p>
            <div className="flex gap-2 justify-center">
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
        </div>
    </div>
);

const Subjects = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(empty);

    const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
    };

    const fetchData = async () => {
        try {
            const { data: subjects } = await axios.get('/api/subjects', config);
            setData(subjects);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = data.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

    const close = () => { setModal(null); setSelected(null); };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        try {
            if (modal === 'add') {
                await axios.post('/api/subjects', form, config);
            } else {
                await axios.put(`/api/subjects/${selected._id}`, form, config);
            }
            fetchData();
            close();
        } catch (err) {
            alert('Error saving subject: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/subjects/${selected._id}`, config);
            fetchData();
            close();
        } catch (err) {
            alert('Error deleting subject');
        }
    };

    if (loading) return <div className="p-6 text-center">Loading subjects...</div>;

    return (
        <div className="max-w-[1500px] mx-auto pb-10 px-4">
            <style>
                {`
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { 
                        background: white !important; 
                        font-size: 11pt !important; 
                        color: black !important; 
                        margin: 0 !important;
                    }
                    .mx-auto { margin: 0 !important; max-width: 100% !important; }
                    .p-6, .px-6, .py-4, .pb-10 { padding: 4px !important; }
                    .shadow-sm { box-shadow: none !important; border: none !important; }
                    .rounded-xl { border-radius: 0 !important; }
                    
                    /* Table Styling */
                    .overflow-x-auto { overflow: visible !important; }
                    table { width: 100% !important; border-collapse: collapse !important; border: 0.5pt solid black !important; margin-top: 5mm; }
                    th, td { 
                        border: 0.5pt solid black !important; 
                        padding: 10px !important; 
                        text-align: left !important; 
                        font-size: 10pt !important;
                    }
                    th { background-color: #f2f2f2 !important; font-weight: bold !important; text-transform: uppercase !important; }
                    
                    .print-header { 
                        display: block !important; 
                        margin-bottom: 25px; 
                        border-bottom: 2pt solid #000; 
                        padding-bottom: 12px; 
                        text-align: center;
                    }
                }
                .print-header { display: none; }
                `}
            </style>

            <div className="print-header">
                <h1 className="text-2xl font-black uppercase">Official Subject Catalog</h1>
                <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">School Year 2024/25 - Approved Curriculum</p>
            </div>

            {(modal === 'add' || modal === 'edit') && <Modal title={modal === 'add' ? 'Add New Subject' : 'Edit Subject'} onClose={close} onSave={handleSave} form={form} setForm={setForm} />}
            {modal === 'delete' && selected && <DeleteModal item={selected} onClose={close} onConfirm={handleDelete} />}

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.role === 'teacher' ? 'Subjects' : 'Manage Subjects'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{user?.role === 'teacher' ? 'View subjects in the curriculum' : 'Add or update subjects in the curriculum'}</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="h-3.5 w-3.5" /> Print Catalog
                    </button>
                    {user?.role !== 'teacher' && (
                        <button onClick={() => { setForm({ ...empty }); setModal('add'); }} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
                            <Plus className="h-4 w-4" /> Add Subject
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <input type="text" placeholder="Search by subject name..." value={search} onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                            <tr>{['Subject Name', 'Status', ...(user?.role !== 'teacher' ? ['Actions'] : [])].map(h => (
                                <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((s) => (
                                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-600" />{s.name}</td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span></td>
                                    {user?.role !== 'teacher' && (
                                        <td className="px-5 py-3">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => { setSelected(s); setForm({ ...s }); setModal('edit'); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                                                <button onClick={() => { setSelected(s); setModal('delete'); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-400">No subjects found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Subjects;
