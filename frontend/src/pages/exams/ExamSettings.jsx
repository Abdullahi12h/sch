import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ExamSettings = () => {
    const { user } = useAuth();
    const [types, setTypes] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, type: 'add', data: null });
    const [form, setForm] = useState({
        name: '',
        academicYear: '',
        passPercentage: 50,
        weight: 25,
        totalMarks: 100,
        isActive: true
    });

    const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
    };

    const fetchData = async () => {
        try {
            const [{ data: examTypes }, { data: years }] = await Promise.all([
                axios.get('/api/exam-types', config),
                axios.get('/api/academic-years', config)
            ]);
            setTypes(examTypes);
            setAcademicYears(years);
            
            // Set default academic year to current one if available
            const currentYear = years.find(y => y.isCurrent)?.name || (years.length > 0 ? years[0].name : '');
            if (currentYear) {
                setForm(prev => ({ ...prev, academicYear: currentYear }));
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (type, data = null) => {
        setModal({ isOpen: true, type, data });
        if (data) {
            setForm({
                name: data.name,
                academicYear: data.academicYear,
                passPercentage: data.passPercentage,
                weight: data.weight || 25,
                totalMarks: data.totalMarks || 100,
                isActive: data.isActive
            });
        } else {
            const currentYear = academicYears.find(y => y.isCurrent)?.name || (academicYears.length > 0 ? academicYears[0].name : '');
            setForm({
                name: '',
                academicYear: currentYear,
                passPercentage: 50,
                weight: 25,
                totalMarks: 100,
                isActive: true
            });
        }
    };

    const closeModal = () => setModal({ isOpen: false, type: 'add', data: null });

    const handleSave = async () => {
        try {
            if (modal.data) {
                await axios.put(`/api/exam-types/${modal.data._id}`, form, config);
            } else {
                await axios.post('/api/exam-types', form, config);
            }
            fetchData();
            closeModal();
        } catch (err) {
            alert('Error saving exam type: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam type?')) return;
        try {
            await axios.delete(`/api/exam-types/${id}`, config);
            fetchData();
        } catch (err) {
            alert('Error deleting exam type');
        }
    };

    if (loading) return <div className="p-6 text-center">Loading settings...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage exam types and passing marks here (Admin Only)</p>
                </div>
                <button
                    onClick={() => openModal('add')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-sm font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Add Exam Type
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-black">Exam Name</th>
                            <th className="px-6 py-4 font-black">Academic Year</th>
                            <th className="px-6 py-4 font-black text-center">Pass %</th>
                            <th className="px-6 py-4 font-black text-center">Total Marks</th>
                            <th className="px-6 py-4 font-black text-center">Weight %</th>
                            <th className="px-6 py-4 font-black text-center">Status</th>
                            <th className="px-6 py-4 font-black text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {types.map((type) => (
                            <tr key={type._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                                <td className="px-6 py-4 text-gray-600">{type.academicYear}</td>
                                <td className="px-6 py-4 text-center font-bold text-blue-600">{type.passPercentage}%</td>
                                <td className="px-6 py-4 text-center font-bold text-gray-600">/{type.totalMarks || 100}</td>
                                <td className="px-6 py-4 text-center font-bold text-green-600">{type.weight || 25}%</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${type.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        {type.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => openModal('edit', type)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(type._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-600" />
                                {modal.type === 'add' ? 'Add New Exam Type' : 'Edit Exam Type'}
                            </h2>
                            <button onClick={closeModal}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Exam Name (e.g. Mid-Term, Final)</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {[
                                        { name: 'Bileed 1', total: 15, weight: 15 },
                                        { name: 'Bileed 2', total: 15, weight: 15 },
                                        { name: 'Mid-Term', total: 30, weight: 30 },
                                        { name: 'Final', total: 40, weight: 40 }
                                    ].map(preset => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => setForm({ ...form, name: preset.name, totalMarks: preset.total, weight: preset.weight })}
                                            className="px-2 py-1 bg-blue-50 text-[#2563EB] border border-blue-100 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                        >
                                            {preset.name} ({preset.total})
                                        </button>
                                    ))}
                                </div>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full border-gray-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Mid-Term, Final, etc..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Academic Year (Manual Entry)</label>
                                <input
                                    type="text"
                                    value={form.academicYear}
                                    onChange={e => setForm({ ...form, academicYear: e.target.value })}
                                    className="w-full border-gray-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. 2026-2027"
                                    list="year-suggestions"
                                />
                                <datalist id="year-suggestions">
                                    {academicYears.map(y => (
                                        <option key={y._id} value={y.name} />
                                    ))}
                                </datalist>
                                <p className="text-[10px] text-gray-400 mt-1">Type the year range manually as per the catalog.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Total Marks</label>
                                    <input
                                        type="number"
                                        value={form.totalMarks}
                                        onChange={e => setForm({ ...form, totalMarks: e.target.value })}
                                        className="w-full border-gray-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="e.g. 15, 30, 100"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Maximum marks for this exam.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pass %</label>
                                    <input
                                        type="number"
                                        value={form.passPercentage}
                                        onChange={e => setForm({ ...form, passPercentage: e.target.value })}
                                        className="w-full border-gray-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        min="0" max="100"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Example: 50 is half.</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Overall Result Weight (%)</label>
                                <input
                                    type="number"
                                    value={form.weight}
                                    onChange={e => setForm({ ...form, weight: e.target.value })}
                                    className="w-full border-gray-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    min="0" max="100"
                                    placeholder="e.g. 15, 30, 40"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Weight of this exam in the final 100% score.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                                <select
                                    value={form.isActive}
                                    onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}
                                    className="w-full border-gray-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-bold"
                                >
                                    <option value="true">ACTIVE</option>
                                    <option value="false">INACTIVE</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button onClick={closeModal} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1d4ed8] shadow-md transition-all">
                                <Save className="w-4 h-4" /> Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamSettings;
