import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Clock, Save, Settings, Printer, Edit2, X, Search, ShieldCheck } from 'lucide-react';

const Modal = ({ title, onClose, onSave, form, setForm, saving }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 gap-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 text-emerald-600">Window Opens</label>
                        <input type="time" value={form.checkInStart} onChange={e => setForm({ ...form, checkInStart: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 text-blue-600">Check-In Time</label>
                        <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 text-amber-500">Late Time</label>
                        <input type="time" value={form.lateTime} onChange={e => setForm({ ...form, lateTime: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 text-pink-500">Check-Out Time</label>
                        <input type="time" value={form.checkOutLimit} onChange={e => setForm({ ...form, checkOutLimit: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 text-red-500">Absent Time</label>
                        <input type="time" value={form.absentTime} onChange={e => setForm({ ...form, absentTime: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 text-emerald-700">Cleaning In</label>
                        <input type="time" value={form.cleaningIn} onChange={e => setForm({ ...form, cleaningIn: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-700 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 text-rose-700">Cleaning Out</label>
                        <input type="time" value={form.cleaningOut} onChange={e => setForm({ ...form, cleaningOut: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-700 transition-colors" />
                    </div>
                </div>
            </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button disabled={saving} onClick={onSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-xl hover:bg-primary-700 transition-colors disabled:bg-blue-300">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                    Set (Change)
                </button>
            </div>
        </div>
    </div>
);

const CreateTime = () => {
    const { user } = useAuth();
    const [config, setConfig] = useState({
        startTime: '07:30',
        lateTime: '08:00',
        absentTime: '09:00',
        checkInStart: '06:00',
        checkOutLimit: '18:00',
        cleaningIn: '07:30',
        cleaningOut: '16:00',
        _id: 'default'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(config);
    const [search, setSearch] = useState('');

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/attendance-config', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (data) {
                setConfig(data);
                setForm(data);
            }
        } catch (err) {
            console.error('Error fetching config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('/api/attendance-config', form, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setConfig(form);
            setModalOpen(false);
        } catch (err) {
            console.error('Error saving config:', err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Loading time system...</div>;

    // We make a dummy array of 1 item to represent the one policy in a table format as requested
    const policies = [config].filter(p => 'Standard Teacher Policy'.toLowerCase().includes(search.toLowerCase()) || p.startTime.includes(search));

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
                <h1 className="text-2xl font-black uppercase">Official Time Policy</h1>
                <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">School Year 2024/25 - Time Settings</p>
            </div>

            {modalOpen && <Modal title="Edit Time Policy" onClose={() => setModalOpen(false)} onSave={handleSave} form={form} setForm={setForm} saving={saving} />}

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Time Settings (Jadwalka Waqtiga)</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system lockdown and attendance windows</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="h-3.5 w-3.5" /> Print Settings
                    </button>
                </div>
            </div>

            {/* Top Stat Cards just like the user's Period screenshot */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 no-print">
                <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-emerald-50"><Clock className="h-5 w-5 text-emerald-600" /></div>
                    <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide leading-none mb-1">Window Opens</p><p className="text-xl font-bold text-gray-900">{config.checkInStart || '06:00'}</p><p className="text-[10px] text-gray-400 mt-0.5">Earliest check-in</p></div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-blue-50"><Clock className="h-5 w-5 text-blue-600" /></div>
                    <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide leading-none mb-1">Check-In</p><p className="text-xl font-bold text-gray-900">{config.startTime}</p><p className="text-[10px] text-gray-400 mt-0.5">Standard arrival</p></div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-amber-50"><Settings className="h-5 w-5 text-amber-500" /></div>
                    <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide leading-none mb-1">Late Time</p><p className="text-xl font-bold text-gray-900">{config.lateTime}</p><p className="text-[10px] text-gray-400 mt-0.5">Marked late</p></div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-pink-50"><Clock className="h-5 w-5 text-pink-600" /></div>
                    <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide leading-none mb-1">Check-Out</p><p className="text-xl font-bold text-gray-900">{config.checkOutLimit}</p><p className="text-[10px] text-gray-400 mt-0.5">End of day</p></div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <input type="text" placeholder="Search by policy name..." value={search} onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#2563EB] text-white uppercase text-[11px] tracking-wide">
                            <tr>{['Policy Name', 'Check-In Time', 'Late Time', 'Check-Out Time', 'Absent Time', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3 text-left font-bold border-r border-primary-700 whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {policies.map((p) => {
                                return (
                                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-gray-900 flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                                            Standard Teacher Policy
                                        </td>
                                        <td className="px-5 py-3.5 text-blue-700 font-bold bg-blue-50/50">
                                            {p.startTime}
                                        </td>
                                        <td className="px-5 py-3.5 text-amber-700 font-bold bg-amber-50/50">
                                            {p.lateTime}
                                        </td>
                                        <td className="px-5 py-3.5 text-pink-700 font-bold bg-pink-50/50">
                                            {p.checkOutLimit}
                                        </td>
                                        <td className="px-5 py-3.5 text-red-700 font-bold bg-red-50/50">
                                            {p.absentTime}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => { setForm({ ...p }); setModalOpen(true); }} className="p-1.5 rounded bg-[#f39c12] hover:bg-[#e67e22] text-white transition-colors flex items-center gap-1 px-3 w-full justify-center" title="Edit">
                                                    <Edit2 className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase">Change</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {policies.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No matching policies found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CreateTime;
