import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, AlertCircle, Search, Plus, Eye, Edit2, Trash2, ChevronDown, X, Save, Download, Upload, Printer } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Papa from 'papaparse';

const initialData = [
    { id: 1, name: 'Amina Hassan', grade: 'Grade 8', gender: 'Female', shift: 'Morning', status: 'Enrolled', date: '2025-03-01', parent: 'Hassan Ali', phone: '0612345678' },
    { id: 2, name: 'Yusuf Ahmed', grade: 'Grade 9', gender: 'Male', shift: 'Afternoon', status: 'Pending', date: '2025-03-02', parent: 'Ahmed Warsame', phone: '0623456789' },
    { id: 3, name: 'Faadumo Ali', grade: 'Grade 7', gender: 'Female', shift: 'Morning', status: 'Enrolled', date: '2025-03-02', parent: 'Ali Mohamed', phone: '0634567890' },
    { id: 4, name: 'Mohamed Jama', grade: 'Grade 11', gender: 'Male', shift: 'Morning', status: 'Rejected', date: '2025-03-03', parent: 'Jama Hussein', phone: '0645678901' },
    { id: 5, name: 'Khadija Ibrahim', grade: 'Grade 10', gender: 'Female', shift: 'Afternoon', status: 'Enrolled', date: '2025-03-03', parent: 'Ibrahim Farah', phone: '0656789012' },
    { id: 6, name: 'Abdi Warsame', grade: 'Grade 12', gender: 'Male', shift: 'Morning', status: 'Pending', date: '2025-03-04', parent: 'Warsame Aden', phone: '0667890123' },
    { id: 7, name: 'Hodan Farah', grade: 'Grade 8', gender: 'Female', shift: 'Morning', status: 'Enrolled', date: '2025-03-04', parent: 'Farah Dahir', phone: '0678901234' },
    { id: 8, name: 'Bilal Omar', grade: 'Grade 9', gender: 'Male', shift: 'Afternoon', status: 'Enrolled', date: '2025-03-05', parent: 'Omar Salad', phone: '0689012345' },
    { id: 9, name: 'Sahra Dahir', grade: 'Grade 7', gender: 'Female', shift: 'Morning', status: 'Pending', date: '2025-03-05', parent: 'Dahir Abdi', phone: '0690123456' },
    { id: 10, name: 'Khalid Nur', grade: 'Grade 10', gender: 'Male', shift: 'Morning', status: 'Enrolled', date: '2025-03-06', parent: 'Nur Hassan', phone: '0601234567' },
];

const statusStyle = { Enrolled: 'bg-green-100 text-green-700', Pending: 'bg-amber-100 text-amber-700', Rejected: 'bg-red-100 text-red-700' };
const empty = { name: '', grade: 'Grade 7', gender: 'Male', shift: 'Morning', status: 'Pending', date: '', parent: '', phone: '', username: '', password: '', dob: '' };

// ── Modal ──────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, onSave, form, setForm, allGrades }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
                {[
                    { key: 'name', label: 'Full Name', type: 'text' },
                    { key: 'parent', label: 'Parent/Guardian', type: 'text' },
                    { key: 'phone', label: 'Phone', type: 'text' },
                    { key: 'date', label: 'Application Date', type: 'date' },
                    { key: 'username', label: 'Username', type: 'text' },
                    { key: 'password', label: 'Password', type: 'password' },
                ].map(f => (
                    <div key={f.key} className={f.key === 'name' ? 'col-span-2' : ''}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                        <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors" />
                    </div>
                ))}
                {[
                    { key: 'grade', label: 'Grade', opts: allGrades.length > 0 ? allGrades.map(g => g.name) : ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
                    { key: 'gender', label: 'Gender', opts: ['Male', 'Female'] },
                    { key: 'shift', label: 'Shift', opts: ['Morning', 'Afternoon'] },
                    { key: 'status', label: 'Status', opts: ['Enrolled', 'Pending', 'Rejected'] },
                ].map(f => (
                    <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                        <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-white">
                            {f.opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-xl hover:bg-[#1d4ed8] transition-colors shadow-sm">
                    <Save className="h-4 w-4" /> Save
                </button>
            </div>
        </div>
    </div>
);

// ── View Modal ─────────────────────────────────────────────────────────────────
const ViewModal = ({ item, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Applicant Details</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">{item.name.charAt(0)}</div>
                    <div><p className="font-semibold text-gray-900">{item.name}</p><p className="text-xs text-gray-500">{item.grade} · {item.gender}</p></div>
                </div>
                {[['Shift', item.shift], ['Parent/Guardian', item.parent], ['Phone', item.phone], ['Application Date', item.date],
                ['Status', item.status]].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{k}</span>
                        <span className="text-sm font-medium text-gray-700">{v}</span>
                    </div>
                ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Close</button>
            </div>
        </div>
    </div>
);

// ── Delete Confirm ─────────────────────────────────────────────────────────────
const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-500" /></div>
                <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Applicant?</h2>
                <p className="text-sm text-gray-500">Are you sure you want to delete <strong>{item?.name}</strong>? This cannot be undone.</p>
            </div>
            <div className="px-6 pb-6 flex gap-2 justify-center">
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-sm">Delete</button>
            </div>
        </div>
    </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
const Admissions = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [modal, setModal] = useState(null); // 'add' | 'edit' | 'view' | 'delete'
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(true);
    const [allGrades, setAllGrades] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [{ data: students }, { data: gradesData }, { data: years }] = await Promise.all([
                axios.get('/api/students', config),
                axios.get('/api/grades', config),
                axios.get('/api/academic-years', config)
            ]);

            setAllGrades(gradesData);
            setAcademicYears(years);
            // Map student model fields back to Admission table fields if necessary
            // For now, assume they align or it's a shared model
            setData(students.map(s => ({
                ...s,
                date: s.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
            })));
        } catch (err) {
            console.error('Error fetching admissions data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const filtered = data.filter(a => {
        const ms = a.name.toLowerCase().includes(search.toLowerCase()) || a.grade.toLowerCase().includes(search.toLowerCase());
        const mf = statusFilter === 'All' || a.status === statusFilter;
        return ms && mf;
    });

    const openAdd = () => { setForm({ ...empty, date: new Date().toISOString().split('T')[0] }); setModal('add'); };
    const openEdit = (item) => { setSelected(item); setForm({ ...item }); setModal('edit'); };
    const openView = (item) => { setSelected(item); setModal('view'); };
    const openDelete = (item) => { setSelected(item); setModal('delete'); };
    const closeModal = () => { setModal(null); setSelected(null); };

    const handleSave = async () => {
        if (!form.name.trim() || !user) return;
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            };

            const payload = {
                ...form,
                dob: form.dob || '2010-01-01', // Fallback for model requirement
                status: form.status // Use the exact status (Enrolled, Pending, Rejected)
            };

            if (modal === 'add') {
                const { data: created } = await axios.post('/api/students', { ...payload, id: Date.now() }, config);
                setData([...data, created]);
            } else {
                const { data: updated } = await axios.put(`/api/students/${selected.id}`, payload, config);
                setData(data.map(d => d.id === selected.id ? updated : d));
            }
            fetchData(); // Refresh to be safe
            closeModal();
        } catch (err) {
            console.error('Error saving admission:', err);
            alert(err.response?.data?.message || 'Failed to save admission.');
        }
    };

    const handleDelete = async () => {
        if (!selected || !user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/students/${selected.id}`, config);
            setData(data.filter(d => d.id !== selected.id));
            closeModal();
        } catch (err) {
            console.error('Error deleting admission:', err);
        }
    };

    const stats = [
        { label: 'Total Applications', value: data.length, sub: 'All records', icon: <Users className="h-5 w-5 text-blue-600" />, color: 'bg-blue-50' },
        { label: 'Enrolled', value: data.filter(d => d.status === 'Enrolled').length, sub: 'Accepted', icon: <UserCheck className="h-5 w-5 text-green-600" />, color: 'bg-green-50' },
        { label: 'Pending', value: data.filter(d => d.status === 'Pending').length, sub: 'In review', icon: <Clock className="h-5 w-5 text-amber-600" />, color: 'bg-amber-50' },
        { label: 'Rejected', value: data.filter(d => d.status === 'Rejected').length, sub: 'Declined', icon: <AlertCircle className="h-5 w-5 text-red-500" />, color: 'bg-red-50' },
    ];

    const handleExport = () => {
        if (filtered.length === 0) return alert('No data to export');
        const headers = ['Applicant Name', 'Grade', 'Gender', 'Shift', 'Parent/Guardian', 'Phone', 'Date', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filtered.map(a => `"${a.name}","${a.grade}","${a.gender}","${a.shift}","${a.parent}","${a.phone}","${a.date}","${a.status}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admissions_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data;
                if (data.length === 0) {
                    alert('The file is empty or poorly formatted.');
                    return;
                }

                try {
                    setLoading(true);
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const res = await axios.post('/api/students/import', data, config);

                    alert(res.data.message);
                    fetchData(); // Dib usoo celi xogta cusub
                } catch (err) {
                    console.error('Error importing data:', err);
                    alert(err.response?.data?.message || 'Error occurred while importing data.');
                } finally {
                    setLoading(false);
                    e.target.value = null; // Clear input selector
                }
            },
            error: (error) => {
                alert(`CSV parsing error: ${error.message}`);
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
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
                    th, td { border: 1px solid #eee !important; padding: 6px 4px !important; font-size: 8.5pt !important; text-align: left !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                `}
            </style>
            {/* Modals */}
            {(modal === 'add' || modal === 'edit') && (
                <Modal
                    title={modal === 'add' ? 'New Application' : 'Edit Application'}
                    onClose={closeModal}
                    onSave={handleSave}
                    form={form}
                    setForm={setForm}
                    allGrades={allGrades}
                />
            )}
            {modal === 'view' && selected && <ViewModal item={selected} onClose={closeModal} />}
            {modal === 'delete' && selected && <DeleteModal item={selected} onClose={closeModal} onConfirm={handleDelete} />}

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Admission
                        {statusFilter !== 'All' && <span className="hidden print:inline ml-2 text-gray-500">— {statusFilter}</span>}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 no-print">Manage student applications and enrollment — Academic Year {academicYears.find(y => y.isCurrent)?.name || 'Loading...'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => window.print()}
                        className="no-print flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Printer className="h-4 w-4" /> Print
                    </button>
                    <label className="no-print flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                        <Upload className="h-4 w-4" /> Import Data
                        <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleImport} />
                    </label>
                    <button onClick={handleExport} className="no-print flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="h-4 w-4" /> Export Data
                    </button>
                    <button onClick={openAdd} className="no-print flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> New Application
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl ${s.color} shrink-0`}>{s.icon}</div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{s.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between no-print">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-64">
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        <input type="text" placeholder="Search applicants..." value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400" />
                    </div>
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white cursor-pointer hover:border-blue-400 select-none">
                        <span>Status:</span>
                        <select className="bg-transparent outline-none cursor-pointer text-sm font-medium" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option>All</option><option>Enrolled</option><option>Pending</option><option>Rejected</option>
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                            <tr>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">#</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Applicant Name</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Grade</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Gender</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Shift</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Parent/Guardian</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Phone</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Date</th>
                                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                                <th className="px-5 py-3 text-right font-semibold whitespace-nowrap no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((a, i) => (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{String(i + 1).padStart(3, '0')}</td>
                                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{a.name}</td>
                                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{a.grade}</td>
                                    <td className="px-5 py-3 text-gray-500">{a.gender}</td>
                                    <td className="px-5 py-3 text-gray-500">{a.shift}</td>
                                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{a.parent}</td>
                                    <td className="px-5 py-3 text-gray-500">{a.phone}</td>
                                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{a.date}</td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle[a.status]}`}>{a.status}</span></td>
                                    <td className="px-5 py-3 no-print">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openView(a)} title="View" className="p-1.5 rounded-lg hover:bg-blue-50   text-gray-400 hover:text-blue-600  transition-colors"><Eye className="h-4 w-4" /></button>
                                            <button onClick={() => openEdit(a)} title="Edit" className="p-1.5 rounded-lg hover:bg-amber-50  text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                                            <button onClick={() => openDelete(a)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50    text-gray-400 hover:text-red-500   transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={10} className="px-5 py-10 text-center text-gray-400 text-sm">No applicants found.</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>Showing {filtered.length} of {data.length} applicants</span>
                </div>
            </div>
        </div>
    );
};

export default Admissions;
