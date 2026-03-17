import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    MessageSquare, 
    Trash2, 
    CheckCircle, 
    Clock, 
    Search,
    AlertCircle,
    User,
    Calendar,
    ArrowRight
} from 'lucide-react';

const PasswordRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/reset-requests', config);
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Ma hubaal inaad rabto inaad tirtirto codsigan?')) return;
        try {
            await axios.delete(`/api/reset-requests/${id}`, config);
            fetchRequests();
        } catch (error) {
            alert('Error deleting request');
        }
    };

    const handleResolve = async (id) => {
        try {
            await axios.put(`/api/reset-requests/${id}`, { status: 'Resolved' }, config);
            fetchRequests();
        } catch (error) {
            alert('Error updating request');
        }
    };

    const filtered = requests.filter(r => 
        r.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <MessageSquare className="h-7 w-7 text-blue-600" />
                        Password Reset Requests
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Manage password reset requests sent by users.</p>
                </div>
                
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search username..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold">Soo rarayaa codsiyada...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <AlertCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">Wax codsiyo ah lama helin.</p>
                    </div>
                ) : filtered.map((req) => (
                    <div key={req._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 relative group overflow-hidden">
                        {req.status === 'Resolved' && (
                            <div className="absolute top-0 right-0 p-4">
                                <CheckCircle className="h-6 w-6 text-emerald-500" />
                            </div>
                        )}
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg shadow-sm border border-blue-100/50">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg leading-none mb-1">{req.fullName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">@{req.username}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 rounded-2xl p-4 mb-6 border border-gray-100/50">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message:</p>
                            <p className="text-sm font-semibold text-gray-700 italic leading-relaxed">
                                {req.message}
                            </p>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                }`}>
                                    {req.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {req.status === 'Pending' && (
                                    <button 
                                        onClick={() => handleResolve(req._id)}
                                        className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
                                        title="Mark as Resolved"
                                    >
                                        <CheckCircle className="h-4.5 w-4.5" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDelete(req._id)}
                                    className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm"
                                    title="Delete Request"
                                >
                                    <Trash2 className="h-4.5 w-4.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        // Navigate to staff page to reset password
                                        window.location.href = '/dashboard/staff';
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                >
                                    Go Reset <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordRequests;
