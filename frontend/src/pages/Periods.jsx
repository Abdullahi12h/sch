import { useState, useEffect } from 'react';
import { Clock, Search, Plus, Edit2, Trash2, X, Save, Users, Building, Printer } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const initialPeriods = [
    { id: 1, name: 'Period 1', startTime: '08:00', endTime: '08:45', type: 'Regular', isBreak: false, status: 'Active' },
    { id: 2, name: 'Period 2', startTime: '08:45', endTime: '09:30', type: 'Regular', isBreak: false, status: 'Active' },
    { id: 3, name: 'Break', startTime: '09:30', endTime: '10:00', type: 'Break', isBreak: true, status: 'Active' },
    { id: 4, name: 'Period 3', startTime: '10:00', endTime: '10:45', type: 'Regular', isBreak: false, status: 'Active' },
    { id: 5, name: 'Period 4', startTime: '10:45', endTime: '11:30', type: 'Regular', isBreak: false, status: 'Active' },
];

const emptyPeriod = { name: '', startTime: '', endTime: '', type: 'Regular', isBreak: false, status: 'Active' };

const Modal = ({ title, onClose, onSave, form, setForm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Period Name</label>
                    <input type="text" placeholder="e.g. Period 1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Time</label>
                        <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End Time</label>
                        <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b3d60] transition-colors" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-[7px]">
                        <input type="checkbox" id="isBreak" checked={form.isBreak} onChange={e => setForm({ ...form, isBreak: e.target.checked, type: e.target.checked ? 'Break' : 'Regular' })} className="w-4 h-4 text-[#2563EB] rounded cursor-pointer" />
                        <label htmlFor="isBreak" className="text-sm font-medium text-gray-700 cursor-pointer">Is Break Time?</label>
                    </div>
                    <div>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] transition-colors bg-white">
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-xl hover:bg-[#1d4ed8] transition-colors">
                    <Save className="h-4 w-4" /> Save Schedule
                </button>
            </div>
        </div>
    </div>
);

const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm px-6 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-500" /></div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Period?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong>{item?.name}</strong>?</p>
            <div className="flex gap-2 justify-center">
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
        </div>
    </div>
);

const Periods = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyPeriod);

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/periods', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setData(data);
        } catch (error) {
            console.error('Error fetching periods:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = data.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.startTime.includes(search));

    const close = () => { setModal(null); setSelected(null); };

    const handleSave = async () => {
        if (!form.name.trim() || !form.startTime || !form.endTime) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (modal === 'add') {
                await axios.post('/api/periods', form, config);
            } else {
                await axios.put(`/api/periods/${selected._id}`, form, config);
            }
            fetchPeriods();
            close();
        } catch (error) {
            console.error('Error saving period:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/periods/${selected._id}`, config);
            fetchPeriods();
            close();
        } catch (error) {
            console.error('Error deleting period:', error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
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
                    .p-5, .p-6, .px-6, .py-4, .pb-10 { padding: 4px !important; }
                    .shadow-sm, .shadow-md { box-shadow: none !important; border: none !important; }
                    .rounded-xl, .rounded-sm { border-radius: 0 !important; }
                    
                    /* Table Styling */
                    .overflow-x-auto { overflow: visible !important; }
                    table { width: 100% !important; border-collapse: collapse !important; border: 0.5pt solid black !important; margin-top: 5mm; }
                    th, td { 
                        border: 0.5pt solid black !important; 
                        padding: 10px !important; 
                        text-align: left !important; 
                        font-size: 10pt !important;
                        color: black !important;
                    }
                    th { background-color: #f2f2f2 !important; color: black !important; font-weight: bold !important; text-transform: uppercase !important; }
                    
                    .print-header { 
                        display: block !important; 
                        margin-bottom: 25px; 
                        border-bottom: 2pt solid #000; 
                        padding-bottom: 12px; 
                        text-align: center;
                    }
                    .bg-[#2563EB] { background: #f2f2f2 !important; }
                }
                .print-header { display: none; }
                `}
            </style>

            <div className="print-header">
                <h1 className="text-2xl font-black uppercase">Official Class Schedule</h1>
                <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">School Year 2024/25 - Period Distribution</p>
            </div>

            {(modal === 'add' || modal === 'edit') && <Modal title={modal === 'add' ? 'Add New Period' : 'Edit Period'} onClose={close} onSave={handleSave} form={form} setForm={setForm} />}
            {modal === 'delete' && selected && <DeleteModal item={selected} onClose={close} onConfirm={handleDelete} />}

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Period Schedule (Xiisadaha)</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage school periods, classes, and break times</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="h-3.5 w-3.5" /> Print Schedule
                    </button>
                    <button onClick={() => { setForm({ ...emptyPeriod }); setModal('add'); }} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> Add Period / Xiisad
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 no-print">
                {[
                    { label: 'Total Periods', value: data.length, sub: 'All periods', icon: <Building className="h-5 w-5 text-[#2563EB]" />, color: 'bg-blue-50' },
                    { label: 'Learning Sessions', value: data.filter(d => !d.isBreak).length, sub: 'Active lessons', icon: <Users className="h-5 w-5 text-emerald-600" />, color: 'bg-emerald-50' },
                    { label: 'Break Times', value: data.filter(d => d.isBreak).length, sub: 'Recess or lunch', icon: <Clock className="h-5 w-5 text-amber-600" />, color: 'bg-amber-50' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl ${s.color}`}>{s.icon}</div>
                        <div><p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p><p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p><p className="text-xs text-gray-400 mt-0.5">{s.sub}</p></div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <input type="text" placeholder="Search by period name or time..." value={search} onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#2563EB] text-white uppercase text-[11px] tracking-wide">
                            <tr>{['Period Name', 'Time Schedule', 'Type', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3 text-left font-bold border-r border-[#1d4ed8] whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filtered.map((g) => {
                                return (
                                    <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-gray-900 flex items-center gap-2">
                                            {g.isBreak ? <Clock className="h-4 w-4 text-amber-500" /> : <Layers className="h-4 w-4 text-[#2563EB]" />}
                                            {g.name}
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-700 font-medium">
                                            {g.startTime} - {g.endTime}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase ${g.isBreak ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {g.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase ${g.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{g.status}</span></td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => { setSelected(g); setForm({ ...g }); setModal('edit'); }} className="p-1.5 rounded bg-[#f39c12] hover:bg-[#e67e22] text-white transition-colors " title="Edit"><Edit2 className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => { setSelected(g); setModal('delete'); }} className="p-1.5 rounded bg-[#e74c3c] hover:bg-[#c0392b] text-white transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No periods/lessons found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Ensure generic icon used in Map rendering
const Layers = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
)

export default Periods;
