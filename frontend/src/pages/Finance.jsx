import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';
import { DollarSign, AlertCircle, TrendingUp, CheckCircle, Search, Eye, Edit2, Trash2, ChevronDown, X, Save, Plus, Zap, Coffee, Wrench, Users, CreditCard, BookOpen, Wifi, Bus, ShoppingCart, Utensils, Building2, Laptop, HeartPulse, Lightbulb, Hammer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// monthlyData will now be computed dynamically from the records


const mockExpenses = [
    { id: 1, title: 'Staff Salaries', amount: 12500, category: 'Payroll', icon: <Users className="h-4 w-4" />, color: 'bg-blue-500' },
    { id: 2, title: 'Electricity Bill', amount: 450, category: 'Utilities', icon: <Zap className="h-4 w-4" />, color: 'bg-yellow-500' },
    { id: 3, title: 'School Supplies', amount: 2800, category: 'Procurement', icon: <Coffee className="h-4 w-4" />, color: 'bg-emerald-500' },
    { id: 4, title: 'Building Maint.', amount: 1200, category: 'Maintenance', icon: <Wrench className="h-4 w-4" />, color: 'bg-rose-500' },
    { id: 5, title: 'Internet Service', amount: 300, category: 'Utilities', icon: <Zap className="h-4 w-4" />, color: 'bg-indigo-500' },
    { id: 6, title: 'Marketing', amount: 1500, category: 'Ops', icon: <TrendingUp className="h-4 w-4" />, color: 'bg-purple-500' },
];

// Mock data removed in favor of API fetching

const statusStyle = { Paid: 'bg-green-100 text-green-700', Partial: 'bg-amber-100 text-amber-700', Unpaid: 'bg-red-100 text-red-700' };
const empty = { student: '', grade: '', term: 'Fee', amount: 500, paid: 0, status: 'Unpaid', date: '' };

const Modal = ({ title, onClose, onSave, form, setForm, students, grades }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Select Grade</label>
                    <select
                        value={form.grade}
                        onChange={e => {
                            const gradeName = e.target.value;
                            const selectedGrade = grades.find(g => (g._id || g.name) === gradeName || g.name === gradeName);
                            const gradeAmount = selectedGrade 
                                ? (form.term === 'Exammoney' ? (selectedGrade.examFeeAmount || 0) : (selectedGrade.feeAmount || 0)) 
                                : form.amount;
                            let status = 'Unpaid';
                            if (form.paid >= gradeAmount && gradeAmount > 0) status = 'Paid';
                            else if (form.paid > 0) status = 'Partial';
                            setForm({ 
                                ...form, 
                                grade: gradeName, 
                                student: '', 
                                amount: gradeAmount,
                                status
                            });
                        }}
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                    >
                        <option value="">-- Select Grade --</option>
                        {grades.map(g => (
                            <option key={g._id || g.name} value={g.name}>{g.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Term</label>
                    <select 
                        value={form.term} 
                        onChange={e => {
                            const newTerm = e.target.value;
                            const selectedGrade = grades.find(g => g.name === form.grade);
                            let newAmount = form.amount;
                            if (selectedGrade) {
                                newAmount = newTerm === 'Exammoney' ? (selectedGrade.examFeeAmount || 0) : (selectedGrade.feeAmount || 0);
                            }
                            let status = 'Unpaid';
                            if (form.paid >= newAmount && newAmount > 0) status = 'Paid';
                            else if (form.paid > 0) status = 'Partial';
                            setForm({ ...form, term: newTerm, amount: newAmount, status });
                        }}
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                    >
                        {['Fee', 'Exammoney'].map(o => <option key={o}>{o}</option>)}
                    </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Select Student</label>
                    <select
                        value={form.student}
                        onChange={e => {
                            const studentName = e.target.value;
                            const studentObj = students.find(s => s.name === studentName);
                            let finalAmount = form.amount;
                            let status = 'Unpaid';
                            if (form.paid >= finalAmount && finalAmount > 0) status = 'Paid';
                            else if (form.paid > 0) status = 'Partial';
                            setForm({ ...form, student: studentName, amount: finalAmount, status });
                        }}
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                        disabled={!form.grade}
                    >
                        <option value="">-- Select Student --</option>
                        {students
                            .filter(s => s.grade === form.grade)
                            .map(s => <option key={s.id || s._id} value={s.name}>{s.name}</option>)
                        }
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total ($)</label>
                    <input type="number" readOnly value={form.amount} className="w-full bg-gray-100/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-black text-gray-400 outline-none cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Paid ($)</label>
                    <input type="number" value={form.paid} onChange={e => {
                        const paid = Number(e.target.value);
                        let status = 'Unpaid';
                        if (paid >= form.amount && form.amount > 0) status = 'Paid';
                        else if (paid > 0) status = 'Partial';
                        setForm({ ...form, paid, status });
                    }}
                        className="w-full border-2 border-blue-500 bg-blue-50/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-blue-600 shadow-sm" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5">Remaining</label>
                    <input type="number" readOnly value={Math.max(0, form.amount - form.paid)} 
                        className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-600 font-black outline-none cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs">
                        {['Paid', 'Partial', 'Unpaid'].map(o => <option key={o}>{o}</option>)}
                    </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Payment Date</label>
                    <input type="date" value={form.date === '—' ? '' : form.date} onChange={e => setForm({ ...form, date: e.target.value || '—' })}
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs" />
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

const ViewModal = ({ item, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Payment Details</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
                {[['Student', item.student], ['Grade', item.grade], ['Term', item.term],
                ['Total Amount', `$${item.amount}`], ['Paid', `$${item.paid}`],
                ['Outstanding', `$${item.amount - item.paid}`], ['Payment Date', item.date], ['Status', item.status]].map(([k, v]) => (
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

const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm px-6 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-500" /></div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Record?</h2>
            <p className="text-sm text-gray-500 mb-6">Delete fee record for <strong>{item?.student}</strong>?</p>
            <div className="flex gap-2 justify-center">
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
        </div>
    </div>
);

const ICON_OPTIONS = [
    { key: 'Coffee',     label: 'Coffee',     el: <Coffee className="h-4 w-4" /> },
    { key: 'Zap',        label: 'Zap',        el: <Zap className="h-4 w-4" /> },
    { key: 'Wrench',     label: 'Wrench',     el: <Wrench className="h-4 w-4" /> },
    { key: 'Users',      label: 'Users',      el: <Users className="h-4 w-4" /> },
    { key: 'TrendingUp', label: 'Trending',   el: <TrendingUp className="h-4 w-4" /> },
    { key: 'BookOpen',   label: 'Book',       el: <BookOpen className="h-4 w-4" /> },
    { key: 'Wifi',       label: 'Wifi',       el: <Wifi className="h-4 w-4" /> },
    { key: 'Bus',        label: 'Bus',        el: <Bus className="h-4 w-4" /> },
    { key: 'ShoppingCart',label:'Shopping',  el: <ShoppingCart className="h-4 w-4" /> },
    { key: 'Utensils',   label: 'Food',       el: <Utensils className="h-4 w-4" /> },
    { key: 'Building2',  label: 'Building',   el: <Building2 className="h-4 w-4" /> },
    { key: 'Laptop',     label: 'Laptop',     el: <Laptop className="h-4 w-4" /> },
    { key: 'HeartPulse', label: 'Health',     el: <HeartPulse className="h-4 w-4" /> },
    { key: 'Lightbulb',  label: 'Lightbulb',  el: <Lightbulb className="h-4 w-4" /> },
    { key: 'Hammer',     label: 'Hammer',     el: <Hammer className="h-4 w-4" /> },
];

const COLOR_OPTIONS = [
    { key: 'bg-emerald-500', label: 'Green' },
    { key: 'bg-blue-500',    label: 'Blue' },
    { key: 'bg-yellow-500',  label: 'Yellow' },
    { key: 'bg-rose-500',    label: 'Red' },
    { key: 'bg-indigo-500',  label: 'Indigo' },
    { key: 'bg-purple-500',  label: 'Purple' },
    { key: 'bg-orange-500',  label: 'Orange' },
    { key: 'bg-teal-500',    label: 'Teal' },
    { key: 'bg-pink-500',    label: 'Pink' },
    { key: 'bg-cyan-500',    label: 'Cyan' },
];

const ManageExpensesModal = ({ expenses, onClose, onAdd, onDelete }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');
    const [selectedIcon, setSelectedIcon] = useState('Coffee');
    const [selectedColor, setSelectedColor] = useState('bg-emerald-500');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!title || !amount) return;
        onAdd({
            title,
            amount: Number(amount),
            category,
            icon: selectedIcon,
            color: selectedColor
        });
        setTitle('');
        setAmount('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Maareynta Kharashyada</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kudar ama tirtir kharashyada dhowaan dhacay</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-rose-500 transition-all shadow-xs border border-transparent hover:border-rose-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                    {/* Add Form */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1">Kudar Kharash Cusub</h3>
                        <form onSubmit={handleAdd} className="space-y-3">
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Cinwaanka (e.g. Koronto)" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                                />
                            </div>
                            <div>
                                <input 
                                    type="number" 
                                    placeholder="Lacagta (USD)" 
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                                />
                            </div>
                            <div>
                                <select 
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
                                >
                                    <option>Payroll</option>
                                    <option>Utilities</option>
                                    <option>Procurement</option>
                                    <option>Maintenance</option>
                                    <option>General</option>
                                </select>
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Dooro Icon-ka</p>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {ICON_OPTIONS.map(ic => (
                                        <button
                                            key={ic.key}
                                            type="button"
                                            title={ic.label}
                                            onClick={() => setSelectedIcon(ic.key)}
                                            className={`p-2 rounded-xl flex items-center justify-center transition-all border-2 ${
                                                selectedIcon === ic.key
                                                    ? `${selectedColor} text-white border-transparent shadow-md`
                                                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-200'
                                            }`}
                                        >
                                            {ic.el}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Dooro Midabka</p>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_OPTIONS.map(c => (
                                        <button
                                            key={c.key}
                                            type="button"
                                            title={c.label}
                                            onClick={() => setSelectedColor(c.key)}
                                            className={`w-7 h-7 rounded-full ${c.key} transition-all ${
                                                selectedColor === c.key
                                                    ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                                <Plus className="h-4 w-4" /> Save Expense
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-3 space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex justify-between">
                            <span>Liiska Hadda Jira</span>
                            <span className="text-blue-600">{expenses.length} Records</span>
                        </h3>
                        <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {expenses.map(exp => {
                                const currentIcon = ICON_OPTIONS.find(i => i.key === exp.icon)?.el || <CreditCard className="h-4 w-4" />;
                                return (
                                    <div key={exp._id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${exp.color} text-white`}>{currentIcon}</div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 leading-none">{exp.title}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{exp.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-blue-600">${exp.amount.toLocaleString()}</span>
                                            <button 
                                                onClick={() => onDelete(exp._id)}
                                                className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExpenseSlider = ({ expenses, onManage }) => {
    return (
        <div className="mt-8 mb-4 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    Recent Expenses
                </h3>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onManage}
                        className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-1 group/btn"
                    >
                        Manage <Wrench className="h-3 w-3 group-hover/btn:rotate-45 transition-transform" />
                    </button>
                    <div className="flex gap-1">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        <div className="h-1 w-2 bg-blue-200 rounded-full" />
                        <div className="h-1 w-2 bg-blue-100 rounded-full" />
                    </div>
                </div>
            </div>
            
            <div className="relative">
                {/* Gradient Masks */}
                <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
                
                <div className="flex animate-scroll gap-4 py-2">
                    {[...expenses, ...expenses].map((exp, idx) => {
                        const currentIcon = ICON_OPTIONS.find(i => i.key === exp.icon)?.el || <CreditCard className="h-4 w-4" />;
                        return (
                            <div 
                                key={`${exp._id}-${idx}`}
                                className="flex-none w-64 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group/card"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2 rounded-xl ${exp.color} text-white shadow-lg shadow-current/20 group-hover/card:scale-110 transition-transform`}>
                                        {currentIcon}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-lg">
                                        {exp.category}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 truncate">{exp.title}</h4>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-lg font-black text-blue-600">${exp.amount.toLocaleString()}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">USD</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {expenses.length === 0 && (
                        <div className="flex-none w-full py-10 text-center text-gray-400 font-bold uppercase tracking-widest">
                            No expenses added yet
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-256px * ${expenses.length || 1} - 1rem * ${expenses.length || 1})); }
                }
                .animate-scroll {
                    animation: scroll ${Math.max(10, expenses.length * 5)}s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
            `}} />
        </div>
    );
};

const Finance = () => {
    const { user } = useAuth();
    const { selectedYear } = useAcademicYear();
    const [data, setData] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [monthFilter, setMonthFilter] = useState('All');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);

    // Update form when selectedYear changes to ensure new records get the right year
    useEffect(() => {
        setForm(prev => ({ ...prev, academicYear: selectedYear }));
    }, [selectedYear]);

    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/finance', config);
            setData(data);
        } catch (error) {
            console.error('Error fetching finance records:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExpenses = async () => {
        try {
            const { data } = await axios.get('/api/expenses', config);
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('/api/students', config);
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchGrades = async () => {
        try {
            const { data } = await axios.get('/api/grades', config);
            setGrades(data);
        } catch (error) {
            console.error('Error fetching grades:', error);
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const { data } = await axios.get('/api/academic-years', config);
            setAcademicYears(data);
        } catch (error) {
            console.error('Error fetching academic years:', error);
        }
    };

    useEffect(() => {
        fetchRecords();
        fetchExpenses();
        fetchStudents();
        fetchGrades();
        fetchAcademicYears();
    }, []);

    const MONTHS = [
        { value: 'All', label: 'All Months' },
        { value: '01', label: 'January' }, { value: '02', label: 'February' },
        { value: '03', label: 'March' },   { value: '04', label: 'April' },
        { value: '05', label: 'May' },     { value: '06', label: 'June' },
        { value: '07', label: 'July' },    { value: '08', label: 'August' },
        { value: '09', label: 'September'},{ value: '10', label: 'October' },
        { value: '11', label: 'November' },{ value: '12', label: 'December' },
    ];

    const filtered = data.filter(r => {
        const matchSearch = r.student.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || r.status === statusFilter;
        const matchGrade  = gradeFilter  === 'All' || r.grade === gradeFilter;

        // Year filter: prioritized academicYear field, fallback to date-based matching
        const matchYear = selectedYear === 'All' ||
            (r.academicYear && r.academicYear === selectedYear) ||
            (!r.academicYear && r.date && r.date.startsWith(selectedYear.slice(0, 4)));

        // Month filter: match the MM part of r.date (YYYY-MM-DD)
        const matchMonth = monthFilter === 'All' ||
            (r.date && r.date.length >= 7 && r.date.slice(5, 7) === monthFilter);

        return matchSearch && matchStatus && matchGrade && matchYear && matchMonth;
    });
    const openAdd = () => { setForm({ ...empty, date: new Date().toISOString().split('T')[0] }); setModal('add'); };
    const openEdit = i => { setSelected(i); setForm({ ...i }); setModal('edit'); };
    const openView = i => { setSelected(i); setModal('view'); };
    const openDelete = i => { setSelected(i); setModal('delete'); };
    const close = () => { setModal(null); setSelected(null); };

    const handleSave = async () => {
        if (!form.grade) {
            alert('Please select a grade');
            return;
        }
        if (!form.student || !form.student.trim()) {
            alert('Please select a student');
            return;
        }
        try {
            const formData = { ...form, academicYear: form.academicYear || selectedYear };
            if (modal === 'add') {
                await axios.post('/api/finance', formData, config);
            } else {
                await axios.put(`/api/finance/${selected._id}`, formData, config);
            }
            fetchRecords();
            close();
        } catch (error) {
            console.error('Error saving finance record:', error);
            alert(error.response?.data?.message || `Error: ${error.message}`);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/finance/${selected._id}`, config);
            fetchRecords();
            close();
        } catch (error) {
            console.error('Error deleting finance record:', error);
            alert(error.response?.data?.message || 'Error deleting record');
        }
    };

    const totalCollected = filtered.reduce((s, r) => s + (r.paid || 0), 0);
    const totalOutstanding = filtered.reduce((s, r) => s + ((r.amount || 0) - (r.paid || 0)), 0);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Compute chart data dynamically from all data (not just filtered) to show context
    // or from filtered data depending on preference. Usually chart shows the trend.
    const computeChartData = () => {
        return monthNames.map((name, index) => {
            const mCode = String(index + 1).padStart(2, '0');
            // Filter records for this month and current selected year
            const monthRecords = data.filter(r => {
                const matchYear = selectedYear === 'All' || 
                    (r.academicYear && r.academicYear === selectedYear) ||
                    (!r.academicYear && r.date && r.date.startsWith(selectedYear.slice(0, 4)));
                const matchMonth = r.date && r.date.slice(5, 7) === mCode;
                return matchYear && matchMonth;
            });
            const monthExpenses = expenses.filter(e => {
                const matchYear = selectedYear === 'All' || 
                    (e.academicYear && e.academicYear === selectedYear) ||
                    (!e.academicYear && e.date && e.date.startsWith(selectedYear.slice(0, 4)));
                const matchMonth = e.date && e.date.slice(5, 7) === mCode;
                return matchYear && matchMonth;
            });
            return {
                month: name,
                fees: monthRecords.reduce((sum, r) => sum + (r.paid || 0), 0),
                expenses: monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
            };
        });
    };

    const dynamicChartData = computeChartData().filter(d => d.fees > 0 || (new Date().getMonth() >= monthNames.indexOf(d.month) - 3 && new Date().getMonth() <= monthNames.indexOf(d.month) + 3));
    // Fallback if no data to show a decent range
    const finalChartData = dynamicChartData.length > 0 ? dynamicChartData : [
        { month: 'Jan', fees: 0, expenses: 0 }, { month: 'Feb', fees: 0, expenses: 0 }, { month: 'Mar', fees: 0, expenses: 0 }
    ];
    
    return (
        <div className="max-w-[1500px] mx-auto pb-10 px-4 lg:px-6">
            {(modal === 'add' || modal === 'edit') && <Modal title={modal === 'add' ? 'Add Payment Record' : 'Edit Payment Record'} onClose={close} onSave={handleSave} form={form} setForm={setForm} students={students} grades={grades} />}
            {modal === 'view' && selected && <ViewModal item={selected} onClose={close} />}
            {modal === 'delete' && selected && <DeleteModal item={selected} onClose={close} onConfirm={handleDelete} />}

            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-2 sm:px-0">
                <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">Finance Dashboard</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage billing and payments — Academic Year {academicYears.find(y => y.isCurrent)?.name || '...'}</p>
                </div>
                <button onClick={openAdd} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-100 active:scale-95">
                    <Plus className="h-4 w-4" /> Add Record
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
                {[
                    { label: 'Fees Collected', value: `$${totalCollected.toLocaleString()}`, sub: 'Total paid', icon: <DollarSign className="h-4 w-4 text-blue-600" />, color: 'bg-blue-50', gradient: 'from-blue-50/50 to-white' },
                    { label: 'Outstanding', value: `$${totalOutstanding.toLocaleString()}`, sub: 'Yet to collect', icon: <AlertCircle className="h-4 w-4 text-amber-600" />, color: 'bg-amber-50', gradient: 'from-amber-50/50 to-white' },
                    { label: 'Total Records', value: filtered.length, sub: 'Filtered', icon: <TrendingUp className="h-4 w-4 text-purple-600" />, color: 'bg-purple-50', gradient: 'from-purple-50/50 to-white' },
                    { label: 'Fully Paid', value: filtered.filter(d => d.paid >= d.amount).length, sub: 'Students', icon: <CheckCircle className="h-4 w-4 text-green-600" />, color: 'bg-green-50', gradient: 'from-green-50/50 to-white' },
                ].map((s, i) => (
                    <div key={i} className={`bg-linear-to-br ${s.gradient} rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 shadow-xs hover:shadow-md transition-all group col-span-1`}>
                        <div className={`p-2.5 rounded-xl ${s.color} shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>{s.icon}</div>
                        <div className="min-w-0 text-center sm:text-left">
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{s.label}</p>
                            <p className="text-base sm:text-xl font-black text-gray-900 mt-0.5 tracking-tighter">{s.value}</p>
                            <p className="hidden sm:block text-[9px] text-gray-400 mt-0.5 font-bold truncate uppercase tracking-tighter">{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Monthly Revenue</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Values based on {selectedYear === 'All' ? 'All Years' : selectedYear}</p>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={finalChartData} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v / 1000}K`} />
                        <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="fees" name="Fees Collected" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between bg-gray-50/30">
                    <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 w-full lg:w-64 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-gray-600 font-bold outline-none w-full placeholder-gray-400" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white hover:border-blue-400 select-none">
                            <span>Grade:</span>
                            <select className="bg-transparent outline-none cursor-pointer text-sm font-medium" value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                                <option>All</option>
                                {grades.map(g => <option key={g._id || g.name} value={g.name}>{g.name}</option>)}
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white hover:border-blue-400 select-none">
                            <span>Status:</span>
                            <select className="bg-transparent outline-none cursor-pointer text-sm font-medium" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option>All</option><option>Paid</option><option>Partial</option><option>Unpaid</option>
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        {/* Month dropdown */}
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white hover:border-blue-400 select-none">
                            <span>Month:</span>
                            <select
                                className="bg-transparent outline-none cursor-pointer text-sm font-medium"
                                value={monthFilter}
                                onChange={e => setMonthFilter(e.target.value)}
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div className="table-responsive-container no-scrollbar">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                            <tr>{['#', 'Student', 'Grade', 'Term', 'Amount', 'Paid', 'Outstanding', 'Date', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={10} className="px-5 py-10 text-center text-gray-400">Loading records...</td></tr>
                            ) : filtered.map((r, i) => (
                                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{String(i + 1).padStart(3, '0')}</td>
                                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{r.student}</td>
                                    <td className="px-5 py-3 text-gray-600">{r.grade}</td>
                                    <td className="px-5 py-3 text-gray-500">{r.term}</td>
                                    <td className="px-5 py-3 text-gray-600 font-medium">${r.amount}</td>
                                    <td className="px-5 py-3 text-green-600 font-medium">${r.paid}</td>
                                    <td className="px-5 py-3 text-red-500 font-medium">${r.amount - r.paid}</td>
                                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{r.date}</td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle[r.status]}`}>{r.status}</span></td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openView(r)} className="p-1.5 rounded-lg hover:bg-blue-50  text-gray-400 hover:text-blue-600  transition-colors"><Eye className="h-4 w-4" /></button>
                                            <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                                            <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg hover:bg-red-50   text-gray-400 hover:text-red-500   transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={10} className="px-5 py-10 text-center text-gray-400">No records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
                    Showing {filtered.length} of {data.length} records
                </div>
            </div>

            <ExpenseSlider expenses={expenses} onManage={() => setModal('manage_expenses')} />
            {modal === 'manage_expenses' && (
                <ManageExpensesModal 
                    expenses={expenses} 
                    onClose={close}
                    onAdd={async (exp) => {
                        try {
                            await axios.post('/api/expenses', { ...exp, academicYear: selectedYear }, config);
                            fetchExpenses();
                        } catch (error) {
                            console.error('Error saving expense:', error);
                            alert('Failed to save expense');
                        }
                    }}
                    onDelete={async (id) => {
                        try {
                            await axios.delete(`/api/expenses/${id}`, config);
                            fetchExpenses();
                        } catch (error) {
                            console.error('Error deleting expense:', error);
                            alert('Failed to delete expense');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default Finance;
