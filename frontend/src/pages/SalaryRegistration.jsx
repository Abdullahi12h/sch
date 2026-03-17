import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';
import { 
    DollarSign, 
    Search, 
    Plus, 
    X, 
    Save, 
    Trash2, 
    Edit2, 
    Calendar, 
    User, 
    Building2,
    CheckCircle,
    Download,
    Printer,
    Filter
} from 'lucide-react';

const SalaryRegistration = () => {
    const { user } = useAuth();
    const { selectedYear } = useAcademicYear();
    const [salaries, setSalaries] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [monthFilter, setMonthFilter] = useState('All');
    const [employeeTypeFilter, setEmployeeTypeFilter] = useState('All');

    const [form, setForm] = useState({
        employeeId: '',
        employeeName: '',
        employeeType: 'Teacher',
        month: 'January',
        year: selectedYear !== 'All' ? selectedYear : '',
        salaryAmount: 0,
        bonus: 0,
        deductions: 0,
        paidAmount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'Paid',
        academicYear: selectedYear !== 'All' ? selectedYear : ''
    });

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const fetchSalaries = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/salaries', config);
            setSalaries(data);
        } catch (error) {
            console.error('Error fetching salaries:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const [teachersRes, staffRes, yearsRes] = await Promise.all([
                axios.get('/api/teachers', config),
                axios.get('/api/auth/users', config), // For non-teacher staff
                axios.get('/api/academic-years', config)
            ]);
            setTeachers(teachersRes.data);
            setStaff(staffRes.data.filter(u => u.role === 'cashier' || u.role === 'admin'));
            setAcademicYears(yearsRes.data);
        } catch (error) {
            console.error('Error fetching employees or years:', error);
        }
    };

    useEffect(() => {
        fetchSalaries();
        fetchData();
    }, []);

    useEffect(() => {
        setForm(prev => ({ 
            ...prev, 
            academicYear: selectedYear !== 'All' ? selectedYear : prev.academicYear,
            year: selectedYear !== 'All' ? selectedYear : prev.year
        }));
    }, [selectedYear]);

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!form.academicYear || form.academicYear === 'All') {
            alert('Fadlan dooro sanad-dugsiyeed gaar ah (ha dooran "All") ka hor inta aadan mushaar bixin.');
            return;
        }

        try {
            if (modal === 'add') {
                await axios.post('/api/salaries', form, config);
            } else {
                await axios.put(`/api/salaries/${selected._id}`, form, config);
            }
            fetchSalaries();
            setModal(null);
            setSelected(null);
        } catch (error) {
            console.error('Salary save error:', error.response?.data || error);
            alert(error.response?.data?.message || 'Khalad ayaa dhacay xiligii la kaydinayay xogta mushaarka.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ma xaqiijinaysaa in aad tirtirto xogtan?')) return;
        try {
            await axios.delete(`/api/salaries/${id}`, config);
            fetchSalaries();
        } catch (error) {
            alert('Error deleting salary record');
        }
    };

    const filtered = salaries.filter(s => {
        const matchSearch = (s.employeeName || '').toLowerCase().includes(search.toLowerCase());
        const matchMonth = monthFilter === 'All' || s.month === monthFilter;
        const matchType = employeeTypeFilter === 'All' || s.employeeType === employeeTypeFilter;
        
        // Use trim() to ensure exact matches even if there are hidden spaces
        const sYear = (s.academicYear || '').trim();
        const selYear = (selectedYear || '').trim();
        const matchYear = !selYear || selYear === 'All' || sYear === selYear;
        
        return matchSearch && matchMonth && matchType && matchYear;
    });

    const totalPaid = filtered.reduce((sum, s) => sum + s.paidAmount, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-12">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Salary Registration</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Diiwaan-galinta iyo Maareynta Mushaaraadka Shaqaalaha</p>
                </div>
                <button 
                    onClick={() => {
                        setForm({
                            ...form,
                            employeeId: '',
                            employeeName: '',
                            salaryAmount: 0,
                            bonus: 0,
                            deductions: 0,
                            paidAmount: 0,
                            paymentDate: new Date().toISOString().split('T')[0],
                            academicYear: selectedYear !== 'All' ? selectedYear : '',
                            year: selectedYear !== 'All' ? selectedYear : ''
                        });
                        setModal('add');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                    <Plus className="h-4 w-4" /> Bixi Mushaar Cusub
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wadarta La Bixiyay</p>
                        <h3 className="text-2xl font-black text-gray-900">${totalPaid.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shaqaalaha La Siiyay</p>
                        <h3 className="text-2xl font-black text-gray-900">{filtered.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bisha Socota</p>
                        <h3 className="text-2xl font-black text-gray-900">{MONTHS[new Date().getMonth()]}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 flex-1 min-w-[200px]">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Raadi magaca shaqaalaha..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm font-bold text-gray-700 outline-none w-full"
                    />
                </div>
                <select 
                    value={monthFilter}
                    onChange={e => setMonthFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-sm font-bold text-gray-700 outline-none cursor-pointer"
                >
                    <option value="All">Dhamaan Bilaha</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                    value={employeeTypeFilter}
                    onChange={e => setEmployeeTypeFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-sm font-bold text-gray-700 outline-none cursor-pointer"
                >
                    <option value="All">Nooca Shaqaalaha</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Staff">Staff/Admin</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Shaqaalaha</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bisha/Sanadka</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lacagta</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Taariikhda</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest">Majiraan xog la helay</td></tr>
                            ) : filtered.map(s => (
                                <tr key={s._id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-xs text-gray-500">
                                                {s.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 leading-none">{s.employeeName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-tight">{s.employeeType}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-gray-700">{s.month}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{s.year}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-black text-emerald-600">${s.paidAmount}</span>
                                            {s.bonus > 0 && <span className="text-[10px] text-blue-500 font-bold">+{s.bonus}</span>}
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Basic: ${s.salaryAmount}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-gray-500">{s.paymentDate}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => { setSelected(s); setForm(s); setModal('edit'); }}
                                                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-blue-100"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(s._id)}
                                                className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-rose-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {(modal === 'add' || modal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{modal === 'add' ? 'Bixi Mushaar Cusub' : 'Wax ka bedel Xogta'}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Fadlan buuxi xogta mushaarka</p>
                            </div>
                            <button onClick={() => setModal(null)} className="p-2 rounded-2xl hover:bg-white text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100 shadow-xs"><X className="h-5 w-5" /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nooca Shaqaalaha</label>
                                    <select 
                                        value={form.employeeType}
                                        onChange={e => setForm({ ...form, employeeType: e.target.value, employeeId: '', employeeName: '' })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs"
                                    >
                                        <option value="Teacher">Teacher</option>
                                        <option value="Staff">Staff/Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Dooro Shaqaalaha</label>
                                    <select 
                                        value={form.employeeId}
                                        onChange={e => {
                                            const id = e.target.value;
                                            const list = form.employeeType === 'Teacher' ? teachers : staff;
                                            const emp = list.find(x => String(x._id || x.id) === String(id));
                                            setForm({ 
                                                ...form, 
                                                employeeId: id, 
                                                employeeName: emp ? emp.name : '', 
                                                salaryAmount: emp ? (emp.salary || 0) : 0, 
                                                paidAmount: emp ? (emp.salary || 0) : 0 
                                            });
                                        }}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs"
                                        required
                                    >
                                        <option value="">-- Dooro --</option>
                                        {(form.employeeType === 'Teacher' ? teachers : staff).map(x => (
                                            <option key={x._id || x.id} value={x._id || x.id}>{x.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bisha</label>
                                <select 
                                    value={form.month}
                                    onChange={e => setForm({ ...form, month: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs"
                                >
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Sanad Dugsiyeedka</label>
                                <select 
                                    value={form.academicYear}
                                    onChange={e => setForm({ ...form, academicYear: e.target.value, year: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs cursor-pointer"
                                    required
                                >
                                    <option value="">-- Dooro Sanadka --</option>
                                    {academicYears.map(y => (
                                        <option key={y._id} value={y.name}>{y.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3 col-span-full">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Basic Salary</label>
                                    <input 
                                        type="number"
                                        value={form.salaryAmount}
                                        onChange={e => setForm({ ...form, salaryAmount: Number(e.target.value), paidAmount: Number(e.target.value) + form.bonus - form.deductions })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 ml-1">Bonus (+) (Optional)</label>
                                    <input 
                                        type="number"
                                        value={form.bonus || ''}
                                        onChange={e => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setForm({ ...form, bonus: val, paidAmount: form.salaryAmount + val - form.deductions });
                                        }}
                                        className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-blue-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 ml-1">Deductions (-) (Optional)</label>
                                    <input 
                                        type="number"
                                        value={form.deductions || ''}
                                        onChange={e => {
                                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                                            setForm({ ...form, deductions: val, paidAmount: form.salaryAmount + form.bonus - val });
                                        }}
                                        className="w-full bg-rose-50/30 border border-rose-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-rose-700 outline-none focus:bg-white focus:border-rose-500 transition-all shadow-xs"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Net Payable</p>
                                    <h4 className="text-3xl font-black text-emerald-700">${form.paidAmount}</h4>
                                </div>
                                <div className="text-right">
                                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 mr-1">Date of Payment</label>
                                    <input 
                                        type="date"
                                        value={form.paymentDate}
                                        onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                                        className="bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-bold text-emerald-700 outline-none focus:ring-4 focus:ring-emerald-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setModal(null)} className="px-8 py-3.5 text-sm font-black text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest">Baaji</button>
                                <button type="submit" className="flex items-center gap-2 px-10 py-3.5 bg-[#2563EB] text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest active:scale-95">
                                    <Save className="h-5 w-5" /> Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryRegistration;
