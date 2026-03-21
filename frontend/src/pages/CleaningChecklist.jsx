import { useState, useEffect } from 'react';
import { ClipboardCheck, ClipboardList, Save, Trash2, User, Calendar, MessageSquare, AlertCircle, Plus, Sparkles, Home, Droplets, Layout, ShieldCheck, Clock, Power, Settings } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const getInitialSections = () => ({
    classrooms: [
        { task: 'Xaaqid & Masaxid: Sagxadda fasallada iyo marinnada (corridors)', completed: false },
        { task: 'Kuraasta & Miisaska: In boodhka laga tirtiro kuraasta ardayda iyo miisaska macallimiinta', completed: false },
        { task: 'Sabuuradaha: In la nadiifiyo sabuuradaha iyo agagaarkooda', completed: false },
        { task: 'Qashin-qubka: In laga saaro qashinka dambiillada yaalla fasallada dhexdiisa', completed: false },
    ],
    toilets: [
        { task: 'Jeermig-dilis: In la isticmaalo dareeraha lagu dilo bakteeriyada (Disinfectant)', completed: false },
        { task: 'Dhaqid: Sagxadda iyo darbiga musqusha in si fiican loogu dhaqo saabuun', completed: false },
        { task: 'Biyo & Saabuun: Hubinta in weelka gacmaha lagu dhaqdo uu leeyahay saabuun iyo biyo ku filan', completed: false },
        { task: 'Muraayadaha: In la nadiifiyo muraayadaha iyo weelka gacmo-dhaqashada', completed: false },
    ],
    yard: [
        { task: 'Ururinta Qashinka: In la soo guro caagadaha, waraaqaha, iyo qashinka yaalla barxadda ciyaarta', completed: false },
        { task: 'Dambiillada Waaweyn: In la faajiyo dambiillada waaweyn ee bannaanka yaalla', completed: false },
        { task: 'Iridda hore: In la xaaqo oo la qurxiyo laga soo galo iskuulka', completed: false },
    ],
    security: [
        { task: 'Daaqadaha & Albaabbada: Hubi inay xiran yihiin dhammaan daaqadaha fasallada', completed: false },
        { task: 'Dami Layrta: Hubi in layrka iyo marawaxadaha aan loo baahnayn la damiyay', completed: false },
        { task: 'Kaydka Agabka: Hubi inta ay kaaga harsan tahay saabuunta iyo kiimikooyinka si loo dalbo kuwo cusub', completed: false },
    ]
});

const CleaningChecklist = () => {
    const { user } = useAuth();
    const [staffName, setStaffName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [comments, setComments] = useState('');
    const [supervisorName, setSupervisorName] = useState('');
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState(user && user.role === 'admin' ? 'history' : 'new'); 
    const [suppliesStatus, setSuppliesStatus] = useState('Haystaa'); 
    const [suppliesNote, setSuppliesNote] = useState('');
    const [checkInTime, setCheckInTime] = useState('07:30'); 
    const [checkOutTime, setCheckOutTime] = useState('16:00'); 
    const [cleaningInStandard, setCleaningInStandard] = useState('07:30');
    const [cleaningOutStandard, setCleaningOutStandard] = useState('16:00');
    useEffect(() => {
        if (user && (user.role === 'hr' || user.role === 'admin')) {
            setSupervisorName(user.name);
        }
    }, [user]);

    const [sections, setSections] = useState(getInitialSections());

    const fetchHistory = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/cleaning', config);
            setChecklists(data);
        } catch (err) {
            console.error('History fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const setCurrentInTime = () => {
        const now = new Date();
        setCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };

    const setCurrentOutTime = () => {
        const now = new Date();
        setCheckOutTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };

    useEffect(() => {
        if (!user) return;
        
        fetchHistory();
        
        const fetchConfig = async () => {
            try {
                const { data } = await axios.get('/api/attendance-config', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (data) {
                    if (data.cleaningIn) {
                        setCheckInTime(data.cleaningIn);
                        setCleaningInStandard(data.cleaningIn);
                    }
                    if (data.cleaningOut) {
                        setCheckOutTime(data.cleaningOut);
                        setCleaningOutStandard(data.cleaningOut);
                    }
                }
            } catch (err) {
                console.error('Error fetching time config:', err);
            }
        };
        fetchConfig();
    }, [user]);

    const handleToggle = (section, index) => {
        setSections(prev => {
            const updatedSection = [...prev[section]];
            // Create a new object for the toggled item to ensure React detects the change
            updatedSection[index] = { 
                ...updatedSection[index], 
                completed: !updatedSection[index].completed 
            };
            return { ...prev, [section]: updatedSection };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!staffName) return setError('Fadlan qor magaca shaqaalaha');
        
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const config = { 
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                } 
            };
            await axios.post('/api/cleaning', {
                staffName,
                date,
                sections,
                comments,
                supervisorName,
                suppliesStatus,
                suppliesNote,
                checkInTime,
                checkOutTime
            }, config);

            setSuccess('Warbixinta si guul leh ayaa loo keydiyay!');
            setSections(getInitialSections());
            setStaffName('');
            setComments('');
            setSuppliesNote('');
            setSuppliesStatus('Haystaa');
            setCheckInTime(cleaningInStandard);
            setCheckOutTime(cleaningOutStandard);
            fetchHistory();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Khalad ayaa dhacay markii la keydinayay xogta');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ma hubaal baa inaad tirtirto xogtan?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/cleaning/${id}`, config);
            fetchHistory();
        } catch (err) {
            alert('Tirtiriddu ma suuroobin');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-amber-500" /> Jadwalka Nadaafadda Iskuulka
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Daily School Cleaning Checklist & HR Tracking</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
                    {user.role !== 'admin' && (
                        <button 
                            onClick={() => setActiveTab('new')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Checklist Cusub
                        </button>
                    )}
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Taariikhda (History)
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 animate-shake">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-bold text-sm">{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 animate-bounce-subtle">
                    <ClipboardCheck className="h-5 w-5" />
                    <span className="font-bold text-sm">{success}</span>
                </div>
            )}

            {user.role === 'admin' && (
                <div className="mb-8 p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 shrink-0">
                            <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Standard Times (Shift Config)</h4>
                            <p className="text-[10px] text-blue-600 font-bold opacity-80 uppercase tracking-widest">Set global shift times for HR staff</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                        <div className="flex items-center gap-5 w-full sm:w-auto">
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex-1 sm:flex-none">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">In:</span>
                                <input 
                                    type="time" 
                                    value={checkInTime} 
                                    onChange={(e) => setCheckInTime(e.target.value)} 
                                    className="bg-transparent text-sm font-black text-blue-700 outline-none w-full sm:w-20"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex-1 sm:flex-none">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Out:</span>
                                <input 
                                    type="time" 
                                    value={checkOutTime} 
                                    onChange={(e) => setCheckOutTime(e.target.value)} 
                                    className="bg-transparent text-sm font-black text-rose-700 outline-none w-full sm:w-20"
                                />
                            </div>
                        </div>
                        <button 
                            disabled={saving}
                            onClick={async () => {
                                setSaving(true);
                                try {
                                    await axios.post('/api/attendance-config', { cleaningIn: checkInTime, cleaningOut: checkOutTime }, { headers: { Authorization: `Bearer ${user.token}` } });
                                    setSuccess('Waqtiga rasmiga ah waa la keydiyay!');
                                    setTimeout(() => setSuccess(''), 3000);
                                } catch (err) {
                                    alert('Keydinta waqtiga ma suuroobin');
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 disabled:bg-blue-300"
                        >
                            <Save className="h-4 w-4" /> Save Settings
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'new' ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 items-end">
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <User className="h-3.5 w-3.5" /> Magaca Shaqaalaha
                            </label>
                            <input 
                                type="text"
                                value={staffName}
                                onChange={e => setStaffName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                placeholder="Axmed Cali..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Calendar className="h-3.5 w-3.5" /> Taariikhda
                            </label>
                            <input 
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl border border-gray-100 flex items-center justify-center gap-4 shadow-inner min-h-[160px]">
                            <div className="text-center">
                                <ClipboardList className="h-10 w-10 text-blue-200 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mark Tasks & Submit Report</p>
                            </div>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. Classrooms */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                            <div className="bg-blue-600 p-5 flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Home className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider">1. Fasallada iyo Xafiisyada</h3>
                                    <p className="text-blue-100 text-[10px] font-bold">Subax hore - intaan ardaydu iman</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 flex-1 bg-gradient-to-b from-white to-blue-50/20">
                                {sections.classrooms.map((item, idx) => (
                                    <label key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${item.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={item.completed}
                                            onChange={() => handleToggle('classrooms', idx)}
                                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500/20 transition-all mt-0.5" 
                                        />
                                        <span className={`text-sm font-bold ${item.completed ? 'text-emerald-700' : 'text-gray-600'}`}>{item.task}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 2. Toilets */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                            <div className="bg-indigo-600 p-5 flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Droplets className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider">2. Musqulaha</h3>
                                    <p className="text-indigo-100 text-[10px] font-bold">Subax iyo Duhur</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 flex-1 bg-gradient-to-b from-white to-indigo-50/20">
                                {sections.toilets.map((item, idx) => (
                                    <label key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${item.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={item.completed}
                                            onChange={() => handleToggle('toilets', idx)}
                                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500/20 transition-all mt-0.5" 
                                        />
                                        <span className={`text-sm font-bold ${item.completed ? 'text-emerald-700' : 'text-gray-600'}`}>{item.task}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 3. Yard */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                            <div className="bg-emerald-600 p-5 flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Layout className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider">3. Barxadda iyo Agagaarka</h3>
                                    <p className="text-emerald-100 text-[10px] font-bold">Ururinta & Nadiifinta</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 flex-1 bg-gradient-to-b from-white to-emerald-50/20">
                                {sections.yard.map((item, idx) => (
                                    <label key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${item.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={item.completed}
                                            onChange={() => handleToggle('yard', idx)}
                                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500/20 transition-all mt-0.5" 
                                        />
                                        <span className={`text-sm font-bold ${item.completed ? 'text-emerald-700' : 'text-gray-600'}`}>{item.task}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 4. Security */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                            <div className="bg-slate-800 p-5 flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <ShieldCheck className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider">4. Hubinta & Ammaanka</h3>
                                    <p className="text-slate-400 text-[10px] font-bold">Galabta - Shaqada ka dib</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 flex-1 bg-gradient-to-b from-white to-slate-50/20">
                                {sections.security.map((item, idx) => (
                                    <label key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${item.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={item.completed}
                                            onChange={() => handleToggle('security', idx)}
                                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500/20 transition-all mt-0.5" 
                                        />
                                        <span className={`text-sm font-bold ${item.completed ? 'text-emerald-700' : 'text-gray-600'}`}>{item.task}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 5. Supplies Status - NEW */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 md:col-span-2">
                        <div className="bg-amber-600 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <AlertCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider">5. Agabka iyo Qalabka (Supplies)</h3>
                                    <p className="text-amber-100 text-[10px] font-bold">Xaaladda agabka nadaafadda</p>
                                </div>
                            </div>
                            <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md">
                                {['Haystaa', 'Way sii dhamaanayaan', 'Way dhammaadeen'].map(s => (
                                    <button 
                                        key={s}
                                        type="button"
                                        onClick={() => setSuppliesStatus(s)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${suppliesStatus === s ? 'bg-white text-amber-700 shadow-sm' : 'text-white hover:bg-white/5'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-gradient-to-r from-white to-amber-50/20">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Agabka ka dhiman ama loo baahan yahay (e.g. Saabuun, Kiimiko...)</label>
                            <input 
                                type="text"
                                value={suppliesNote}
                                onChange={e => setSuppliesNote(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder:text-gray-300"
                                placeholder="Tusaale: Saabuunta gacmaha ayaa sii dhimanaysa..."
                            />
                        </div>
                    </div>

                    {/* Comments & Footer */}
                    <div className="space-y-6">
                        <div className="space-y-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <MessageSquare className="h-3.5 w-3.5" /> Warbixin ama Talooyin (Comments)
                            </label>
                            <textarea 
                                value={comments}
                                onChange={e => setComments(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 h-32 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                placeholder="Haddii aad aragto wax jabsan ama dalab agab cusub..."
                            ></textarea>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200">
                            <p className="text-white text-sm font-bold flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-200" />
                                Mar walba xiro galoofyada iyo af-xirka marka aad isticmaalayso kiimikooyinka.
                            </p>
                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-white text-blue-700 rounded-2xl text-sm font-black hover:bg-blue-50 transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {saving ? 'La keydinayaa...' : <><Save className="h-5 w-5" /> Keydi jadwalka</>}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-[11px] font-black tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">Taariikhda</th>
                                    <th className="px-8 py-5">Shaqaalaha</th>
                                    <th className="px-8 py-5">Hawsha (Summary)</th>
                                    <th className="px-8 py-5">Agabka (Supplies)</th>
                                    <th className="px-8 py-5 text-center">Tirtir</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {checklists.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold italic">
                                            Ma jiro xog hore oo la diiwaangeliyay
                                        </td>
                                    </tr>
                                ) : checklists.map(cl => {
                                    const allTasks = [...(cl.sections.classrooms || []), ...(cl.sections.toilets || []), ...(cl.sections.yard || []), ...(cl.sections.security || [])];
                                    const total = allTasks.length;
                                    const pending = allTasks.filter(t => !t.completed);
                                    const completedCount = total - pending.length;
                                    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
                                    
                                    // Create a list of pending tasks for the hover tooltip
                                    const pendingList = pending.length > 0 
                                        ? "Dhiman:\n" + pending.map(t => "• " + t.task).join("\n")
                                        : "Dhammaan waa la dhammaytiray! ✓";

                                    return (
                                        <tr key={cl._id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-8 py-4 font-mono font-bold text-gray-600">
                                                {new Date(cl.date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <p className="font-black text-gray-800">{cl.staffName}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shadow-sm">
                                                            <Clock className="w-2.5 h-2.5" /> {cl.checkInTime || '-'}
                                                        </span>
                                                        <span className="text-gray-300 text-[9px]">→</span>
                                                        <span className="flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded shadow-sm">
                                                            <Clock className="w-2.5 h-2.5" /> {cl.checkOutTime || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4" title={pendingList}>
                                                <div className="flex flex-col gap-1.5 min-w-[140px] cursor-help transition-transform hover:scale-105">
                                                    <div className="flex items-center justify-between text-[11px] font-black">
                                                        <span className={percentage === 100 ? 'text-emerald-600' : 'text-blue-600'}>
                                                            {completedCount}/{total} Qabtay
                                                        </span>
                                                        <span className="text-gray-400">{percentage}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className={`h-full transition-all duration-1000 ${percentage === 100 ? 'bg-emerald-500' : percentage > 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ring-1 ${cl.suppliesStatus === 'Haystaa' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 
                                                        cl.suppliesStatus === 'Way sii dhamaanayaan' ? 'bg-amber-50 text-amber-700 ring-amber-100' : 'bg-rose-50 text-rose-700 ring-rose-100'
                                                    }`}>
                                                        {cl.suppliesStatus || 'Haystaa'}
                                                    </span>
                                                    {cl.suppliesNote && <p className="text-[10px] text-gray-500 font-medium italic truncate max-w-[150px]">{cl.suppliesNote}</p>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                {user.role === 'admin' && (
                                                    <button 
                                                        onClick={() => handleDelete(cl._id)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CleaningChecklist;
