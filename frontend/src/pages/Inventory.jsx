import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Package, 
    Search, 
    Plus, 
    X, 
    Save, 
    Trash2, 
    Edit2, 
    Calendar, 
    MapPin, 
    Filter,
    Activity,
    AlertCircle,
    CheckCircle2,
    Settings,
    DollarSign,
    Box,
    Layers,
    ClipboardList,
    Printer,
    Download,
    PlusCircle
} from 'lucide-react';

const Inventory = () => {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // 'add', 'edit', 'categories'
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [conditionFilter, setConditionFilter] = useState('All');

    // Category modal state
    const [newCatName, setNewCatName] = useState('');
    const [catLoading, setCatLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        category: '',
        quantity: 1,
        condition: 'Good',
        location: 'Main Office',
        purchaseDate: new Date().toISOString().split('T')[0],
        price: 0,
        description: '',
        status: 'Available'
    });

    const CONDITIONS = ['New', 'Good', 'Fair', 'Poor', 'Broken'];
    const STATUSES = ['Available', 'In Use', 'In Repair', 'Retired'];

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/assets', config);
            setAssets(data);
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/asset-categories', config);
            setCategories(data);
            if (data.length > 0 && !form.category) {
                setForm(prev => ({ ...prev, category: data[0].name }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchAssets();
        fetchCategories();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.category) {
            alert('Fadlan marka hore sameey Category (Category Management)');
            return;
        }
        try {
            if (modal === 'add') {
                await axios.post('/api/assets', form, config);
            } else {
                await axios.put(`/api/assets/${selected._id}`, form, config);
            }
            fetchAssets();
            setModal(null);
            setSelected(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Khalad ayaa dhacay markii la keydiyay xogta agabka');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ma hubaal baa inaad tirtirto agabkan?')) return;
        try {
            await axios.delete(`/api/assets/${id}`, config);
            fetchAssets();
        } catch (error) {
            alert('Tirtiriddu ma suuroobin');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setCatLoading(true);
        try {
            await axios.post('/api/asset-categories', { name: newCatName }, config);
            setNewCatName('');
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding category');
        } finally {
            setCatLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Ma hubtaa inaad tirtirto category-gan?')) return;
        try {
            await axios.delete(`/api/asset-categories/${id}`, config);
            fetchCategories();
        } catch (error) {
            alert('Musaariddu ma suuroobin');
        }
    };

    const filtered = assets.filter(a => {
        const matchSearch = (a.name || '').toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'All' || a.category === categoryFilter;
        const matchCondition = conditionFilter === 'All' || a.condition === conditionFilter;
        return matchSearch && matchCategory && matchCondition;
    });

    const totalValue = filtered.reduce((sum, a) => sum + (a.price * a.quantity), 0);
    const criticalItems = filtered.filter(a => a.condition === 'Broken' || a.condition === 'Poor').length;

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-20">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        <Package className="h-9 w-9 text-blue-600" /> Maaraynta Agabka Guud
                    </h1>
                    <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">General School Inventory & Asset Tracking System</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setModal('categories')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Layers className="h-4 w-4" /> Category Management
                    </button>
                    <button 
                        onClick={() => {
                            setForm({
                                name: '',
                                category: categories.length > 0 ? categories[0].name : '',
                                quantity: 1,
                                condition: 'Good',
                                location: 'Main Office',
                                purchaseDate: new Date().toISOString().split('T')[0],
                                price: 0,
                                description: '',
                                status: 'Available'
                            });
                            setModal('add');
                        }}
                        className="flex items-center justify-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Agab Cusub
                    </button>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                        <Box className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wadarta Agabka</p>
                        <h3 className="text-2xl font-black text-slate-900">{filtered.length}</h3>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qiimaha Guud</p>
                        <h3 className="text-2xl font-black text-slate-900">${totalValue.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Broken Items</p>
                        <h3 className="text-2xl font-black text-slate-900">{criticalItems}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categories</p>
                        <h3 className="text-2xl font-black text-slate-900">{categories.length}</h3>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-wrap items-center gap-4 sticky top-4 z-20 no-print">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 flex-1 min-w-[240px]">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Raadi magaca agabka ama qalabka..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm font-bold text-gray-700 outline-none w-full"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                        <Filter className="h-3.5 w-3.5 text-gray-400" />
                        <select 
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase text-gray-600 outline-none cursor-pointer"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                        <Activity className="h-3.5 w-3.5 text-gray-400" />
                        <select 
                            value={conditionFilter}
                            onChange={e => setConditionFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase text-gray-600 outline-none cursor-pointer"
                        >
                            <option value="All">All Conditions</option>
                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Asset Grid/Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden no-print">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category & Location</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Condition</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity & Value</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading Inventory...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Majiraan Agab la helay</td>
                                </tr>
                            ) : filtered.map(asset => (
                                <tr key={asset._id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm shadow-blue-100 ${
                                                asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600' :
                                                asset.status === 'In Use' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {asset.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 leading-tight">{asset.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-tight flex items-center gap-1">
                                                    <Calendar className="h-2.5 w-2.5" /> Added: {new Date(asset.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-2">
                                            {asset.category}
                                        </span>
                                        <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {asset.location}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                            asset.condition === 'New' ? 'bg-emerald-100 text-emerald-700' :
                                            asset.condition === 'Good' ? 'bg-blue-100 text-blue-700' :
                                            asset.condition === 'Fair' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {asset.condition === 'New' || asset.condition === 'Good' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                            {asset.condition}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-black text-slate-900">{asset.quantity}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Items</span>
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase mt-1">Value: ${ (asset.price * asset.quantity).toLocaleString() }</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setSelected(asset); setForm(asset); setModal('edit'); }}
                                                className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-blue-100"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(asset._id)}
                                                className="p-2.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-rose-100"
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

            {/* Asset Modal */}
            {(modal === 'add' || modal === 'edit') && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100">
                        <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                    {modal === 'add' ? 'Add New Asset' : 'Edit Asset'}
                                </h2>
                            </div>
                            <button onClick={() => setModal(null)} className="p-3 rounded-2xl hover:bg-white text-gray-400 transition-all"><X /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 h-[60vh] overflow-y-auto no-scrollbar">
                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Item Name</label>
                                <input 
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Category</label>
                                <select 
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none cursor-pointer"
                                    required
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Location</label>
                                <input 
                                    type="text"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] font-black text-gray-400 uppercase">Qty</label><input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold" /></div>
                                <div><label className="block text-[10px] font-black text-gray-400 uppercase">Price</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold" /></div>
                            </div>
                            <div className="col-span-full flex justify-end gap-3 mt-4 border-t pt-8">
                                <button type="button" onClick={() => setModal(null)} className="px-10 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Cancel</button>
                                <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
                                    <Save className="h-5 w-5 inline-block mr-2" /> Save Asset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories Management Modal */}
            {modal === 'categories' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
                        <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Category Management</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Add or remove asset categories</p>
                            </div>
                            <button onClick={() => setModal(null)} className="p-3 rounded-2xl hover:bg-white text-gray-400 transition-all"><X /></button>
                        </div>
                        <div className="p-10 space-y-8">
                            <form onSubmit={handleAddCategory} className="flex gap-3">
                                <input 
                                    type="text"
                                    placeholder="New Category Name..."
                                    value={newCatName}
                                    onChange={e => setNewCatName(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                    required
                                />
                                <button 
                                    disabled={catLoading}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all"
                                >
                                    {catLoading ? '...' : <Plus className="h-5 w-5" />}
                                </button>
                            </form>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                                {categories.map(cat => (
                                    <div key={cat._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                                        <span className="text-sm font-black text-gray-700">{cat.name}</span>
                                        <button 
                                            onClick={() => handleDeleteCategory(cat._id)}
                                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
        </div>
    );
};

export default Inventory;
