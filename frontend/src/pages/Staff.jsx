import { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldCheck, ShieldAlert, Key, Search, X, Save, RefreshCw, GraduationCap, Eye, EyeOff, Trash2, Copy, UserPlus, Shield, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Staff = () => {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('teachers'); // teachers, students, system
    const [modal, setModal] = useState(null);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('cashier');
    const [salary, setSalary] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPasswordIds, setShowPasswordIds] = useState({});
    const [copied, setCopied] = useState('');

    const fetchData = async (showLoading = true) => {
        if (!user) return;
        if (showLoading) setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const [teachersRes, studentsRes, usersRes] = await Promise.all([
                axios.get('/api/teachers', config),
                axios.get('/api/students', config),
                axios.get('/api/auth/users', config)
            ]);
            setTeachers(teachersRes.data);
            setStudents(studentsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error('Error fetching staff data:', err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const generateAllStudentCredentials = async () => {
        if (!window.confirm('Are you sure you want to create login credentials for all students (Sample Password)?')) return;

        setGenerating(true);
        setError('');
        setSuccess('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post('/api/students/generate-credentials', {}, config);

            // Success feedback
            setSuccess(data.message);

            // Re-fetch everything immediately to update UI
            await fetchData(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred while creating.');
        } finally {
            setGenerating(false);
        }
    };

    const clearAllStudentCredentials = async () => {
        if (!window.confirm('Are you sure you want to delete all student logins? This cannot be undone.')) return;

        setClearing(true);
        setError('');
        setSuccess('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post('/api/students/clear-credentials', {}, config);

            setSuccess(data.message);
            await fetchData(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred while deleting.');
        } finally {
            setClearing(false);
        }
    };

    const generateAllTeacherCredentials = async () => {
        if (!window.confirm('Are you sure you want to create login credentials for all teachers (Default Password)?')) return;

        setGenerating(true);
        setError('');
        setSuccess('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post('/api/teachers/generate-credentials', {}, config);
            setSuccess(data.message);
            await fetchData(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred while creating.');
        } finally {
            setGenerating(false);
        }
    };

    const clearAllTeacherCredentials = async () => {
        if (!window.confirm('Are you sure you want to delete all teacher logins?')) return;

        setClearing(true);
        setError('');
        setSuccess('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post('/api/teachers/clear-credentials', {}, config);
            setSuccess(data.message);
            await fetchData(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred while deleting.');
        } finally {
            setClearing(false);
        }
    };

    const clearAllUsersByRole = async (role) => {
        const roleName = role === 'cashier' ? 'Cashiers' : role;
        if (!window.confirm(`Are you sure you want to delete all ${roleName}?`)) return;

        setClearing(true);
        setError('');
        setSuccess('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post('/api/auth/users/bulk-delete', { role }, config);
            setSuccess(data.message);
            await fetchData(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred while deleting.');
        } finally {
            setClearing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const openCredentialModal = (entity, type) => {
        setSelectedEntity({ ...entity, type });
        setName(entity.name || '');
        setUsername(entity.username || entity.email || '');
        setRole(type || 'cashier');
        setPassword('');
        setSalary(entity.salary || 0);
        setError('');
        setSuccess('');
        setModal('credentials');
    };

    const openNewUserModal = () => {
        setSelectedEntity({ type: 'new' });
        setName('');
        setUsername('');
        setRole('cashier');
        setPassword('');
        setSalary(0);
        setError('');
        setSuccess('');
        setModal('credentials');
    };

    const handleSaveCredentials = async () => {
        if (!username || !password || (selectedEntity?.type === 'new' && !name)) {
            setError('Please fill in all empty fields.');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
            };

            const payload = {
                username,
                password,
                name: name || selectedEntity.name,
                role: role,
                salary: salary || 0,
                _id: selectedEntity?._id // Pass ID to find record reliably
            };

            if (selectedEntity?.type === 'new') {
                // Creation
                await axios.post('/api/auth/register', payload, config);
            } else {
                // Update
                await axios.put('/api/auth/users', payload, config);
            }

            setSuccess('Data saved successfully!');
            fetchData();
            setTimeout(() => setModal(null), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred.');
        }
    };

    const handleDeleteUser = async (userUsername) => {
        if (!window.confirm(`Are you sure you want to delete the login for ${userUsername}?`)) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(`/api/auth/users/${userUsername}`, config);
            fetchData();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const getAccountStatus = (entityUsername, entityEmail) => {
        const identifier = entityUsername || entityEmail;
        if (!identifier) return { status: 'none', found: null };
        const found = users.find(u => (u.username || u.email || '').toLowerCase() === identifier.toLowerCase());
        if (found) return { status: 'active', found };
        return { status: 'inactive', found: null };
    };

    const toggleShowPassword = (id) => {
        setShowPasswordIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(''), 2000);
    };

    const getFilteredData = () => {
        if (activeTab === 'teachers') {
            return teachers.filter(item =>
                item.name?.toLowerCase().includes(search.toLowerCase()) ||
                (item.username || item.email)?.toLowerCase().includes(search.toLowerCase())
            );
        } else if (activeTab === 'students') {
            return students.filter(item =>
                item.name?.toLowerCase().includes(search.toLowerCase()) ||
                (item.username || item.email)?.toLowerCase().includes(search.toLowerCase())
            );
        } else {
            // System Staff (Admins, Cashiers)
            return users.filter(u => u.role !== 'student').filter(u =>
                u.name?.toLowerCase().includes(search.toLowerCase()) ||
                (u.username || u.email)?.toLowerCase().includes(search.toLowerCase())
            );
        }
    };

    const currentData = getFilteredData();

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system access (Admins, Cashiers, Teachers & Students)</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    {activeTab === 'teachers' && (
                        <div className="flex gap-2">
                            <button
                                onClick={clearAllTeacherCredentials}
                                disabled={clearing || generating}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold hover:bg-rose-200 transition-all shadow-sm disabled:opacity-50"
                            >
                                {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete All
                            </button>
                            <button
                                onClick={generateAllTeacherCredentials}
                                disabled={generating || clearing}
                                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-all shadow-md disabled:opacity-50"
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                                Create All
                            </button>
                        </div>
                    )}
                    {activeTab === 'students' && (
                        <div className="flex gap-2">
                            <button
                                onClick={clearAllStudentCredentials}
                                disabled={clearing || generating}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold hover:bg-rose-200 transition-all shadow-sm disabled:opacity-50"
                            >
                                {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete All Logins
                            </button>
                            <button
                                onClick={generateAllStudentCredentials}
                                disabled={generating || clearing}
                                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-all shadow-md disabled:opacity-50"
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                                Create All Logins
                            </button>
                        </div>
                    )}
                    {activeTab === 'system' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => clearAllUsersByRole('hr')}
                                disabled={clearing}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-200 transition-all shadow-sm disabled:opacity-50"
                            >
                                {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete All HR
                            </button>
                            <button
                                onClick={() => clearAllUsersByRole('cashier')}
                                disabled={clearing}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold hover:bg-rose-200 transition-all shadow-sm disabled:opacity-50"
                            >
                                {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete All Cashiers
                            </button>
                            <button onClick={openNewUserModal} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] transition-all shadow-md">
                                <UserPlus className="h-4 w-4" /> Add New Staff
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications (Success/Error) */}
            {(error || success) && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${error ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    {error ? <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" /> : <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />}
                    <p className={`text-sm font-bold ${error ? 'text-rose-700' : 'text-emerald-700'}`}>{error || success}</p>
                    <button onClick={() => { setError(''); setSuccess(''); }} className="ml-auto text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('teachers')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'teachers' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Teachers
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'students' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Students
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'system' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Admins & Cashiers
                    </div>
                </button>
            </div>

            {/* Search and Table */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-full sm:w-96 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                        <Search className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search name or username..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400 font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-500 uppercase text-[11px] font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5">Name</th>
                                <th className="px-6 py-5 border-l border-gray-50/50">Username</th>
                                <th className="px-6 py-5 border-l border-gray-50/50">Password</th>
                                <th className="px-6 py-5 border-l border-gray-50/50">Role</th>
                                <th className="px-6 py-5 text-center border-l border-gray-50/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentData.map((item) => {
                                const isUser = activeTab === 'system';
                                const account = isUser ? { status: 'active', found: item } : getAccountStatus(item.username, item.email);
                                const userRecord = account.found;
                                const rowId = item._id || item.id;
                                const isShowing = showPasswordIds[rowId];

                                return (
                                    <tr key={rowId} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shadow-gray-200 ${userRecord?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    userRecord?.role === 'hr' ? 'bg-amber-100 text-amber-700' :
                                                    userRecord?.role === 'cashier' ? 'bg-emerald-100 text-emerald-700' :
                                                        userRecord?.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {item.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{userRecord?.role || 'No Login'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {userRecord ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 font-bold">
                                                        {userRecord.username || userRecord.email}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(userRecord.username || userRecord.email, `u-${rowId}`)}
                                                        className="p-1.5 rounded-lg hover:bg-white hover:shadow-md text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-gray-100"
                                                    >
                                                        {copied === `u-${rowId}` ? <UserCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 italic text-xs font-medium">Not set</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {userRecord?.rawPassword ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs bg-amber-50 text-amber-800 px-2.5 py-1.5 rounded-lg border border-amber-100 min-w-[90px] font-bold text-center">
                                                        {isShowing ? userRecord.rawPassword : '••••••••'}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleShowPassword(rowId)}
                                                        className="p-1.5 rounded-lg hover:bg-white hover:shadow-md text-gray-400 hover:text-amber-600 transition-all border border-transparent hover:border-gray-100"
                                                    >
                                                        {isShowing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            ) : userRecord ? (
                                                <span className="text-xs text-gray-400 font-bold italic">Set (Change)</span>
                                            ) : (
                                                <span className="text-gray-200 text-xs">—</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {userRecord ? (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${userRecord.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                    userRecord.role === 'hr' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    userRecord.role === 'cashier' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        userRecord.role === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            'bg-gray-50 text-gray-700 border-gray-100'
                                                    }`}>
                                                    <ShieldCheck className="h-3 w-3" /> {userRecord.role}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100">
                                                    <ShieldAlert className="h-3 w-3" /> No Access
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openCredentialModal(item, userRecord?.role || (activeTab === 'teachers' ? 'teacher' : 'cashier'))}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-blue-700 hover:bg-[#2563EB] hover:text-white rounded-xl transition-all border border-blue-100 shadow-sm"
                                                >
                                                    <Key className="h-3.5 w-3.5" />
                                                    {userRecord ? 'Update' : 'Create'}
                                                </button>
                                                {userRecord && (
                                                    <button
                                                        onClick={() => handleDeleteUser(userRecord.username || userRecord.email)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-100 shadow-sm"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Credentials Modal */}
            {modal === 'credentials' && selectedEntity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
                        <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 leading-none">
                                    {selectedEntity.type === 'new' ? 'Add System Staff' : 'Manage Access'}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{selectedEntity.type === 'new' ? 'New User Creation' : 'Update Credentials'}</p>
                            </div>
                            <button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-white hover:shadow-md text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
                                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                                <p className="text-xs font-bold text-rose-700">{error}</p>
                            </div>}

                            {success && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                                <p className="text-xs font-bold text-emerald-700">{success}</p>
                            </div>}

                            <div className="space-y-5">
                                {selectedEntity.type === 'new' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                            placeholder="Enter staff full name..."
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                        placeholder="admin123"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Assign Role</label>
                                        <select
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:bg-white focus:border-blue-500 transition-all outline-none cursor-pointer"
                                        >
                                            <option value="cashier">Cashier</option>
                                            <option value="hr">HR (Human Resources)</option>
                                            <option value="admin">Administrator</option>
                                            <option value="teacher">Teacher</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                        <input
                                            type="text"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-amber-700 focus:bg-white focus:border-amber-500 transition-all outline-none font-mono"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Monthly Salary ($)</label>
                                    <input
                                        type="number"
                                        value={salary}
                                        onChange={e => setSalary(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:bg-white focus:border-blue-500 transition-all outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setModal(null)} className="px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                            <button onClick={handleSaveCredentials} className="flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] text-white rounded-2xl text-sm font-black hover:bg-[#1d4ed8] transition-all shadow-xl shadow-blue-100 active:scale-95">
                                <Save className="h-5 w-5" /> {selectedEntity.type === 'new' ? 'Finalize & Create' : 'Update Access'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;

