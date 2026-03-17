import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CreditCard, Calendar, CheckCircle, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

const MyFee = () => {
    const { user } = useAuth();
    const [feeData, setFeeData]   = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [slideIdx, setSlideIdx] = useState(0);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/api/finance/student/me', {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setFeeData(data);
            } catch (err) {
                console.error('Error fetching student fees:', err);
                setError(err.response?.data?.message || 'Could not load fee data');
            } finally {
                setLoading(false);
            }
        };
        fetchFees();
    }, [user]);

    useEffect(() => {
        if (feeData) {
            setTimeout(() => setAnimated(true), 100);
        }
    }, [feeData]);

    const fmt = (n) => `$${(n || 0).toLocaleString()}`;

    if (loading) return <div className="p-10 text-center text-gray-400">Loading your financial records...</div>;
    if (error) return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-4">
            <AlertCircle className="h-6 w-6" />
            <p className="font-semibold">{error}</p>
        </div>
    );

    if (!feeData || !feeData.records?.length) return (
        <div className="max-w-4xl mx-auto mt-10 p-10 bg-gray-50 border border-dashed border-gray-200 rounded-3xl text-center">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium italic">No fee records found. Please contact the finance department.</p>
        </div>
    );

    const { summary, records } = feeData;
    const paidPct = summary.totalAmount > 0
        ? Math.min(100, Math.round((summary.totalPaid / summary.totalAmount) * 100))
        : 0;

    const statusStyle = {
        Paid:    { bg: 'from-emerald-600 to-teal-700',   badge: 'bg-emerald-100 text-emerald-700', icon: '✅' },
        Partial: { bg: 'from-[#2563EB] to-[#1d4ed8]',   badge: 'bg-blue-100  text-[#2563EB]',   icon: '⏳' },
        Unpaid:  { bg: 'from-rose-600 to-red-700',    badge: 'bg-red-100    text-red-700',     icon: '❌' },
    };
    const style = statusStyle[summary.status] || statusStyle.Unpaid;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 uppercase">Financial Overview</h1>
                <p className="text-sm text-gray-500 font-medium">Track your payments and outstanding balance — Academic Year 2024/25</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 text-white">
                <div className={`lg:col-span-2 bg-linear-to-br ${style.bg} rounded-4xl p-10 shadow-2xl relative overflow-hidden group`}>
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 h-full">
                        <div className="flex-1 space-y-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Current Balance / Lacagta dhiman</p>
                                <h2 className="text-5xl font-black tracking-tight">{fmt(summary.balance)}</h2>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-black uppercase mb-3">
                                    <span className="opacity-80">Paid Progress</span>
                                    <span className="bg-white/20 px-3 py-1 rounded-xl">{paidPct}%</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-5 p-1 backdrop-blur-md border border-white/10">
                                    <div 
                                        className="h-full rounded-full bg-linear-to-r from-white/90 to-white transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(255,255,255,0.7)]"
                                        style={{ width: animated ? `${paidPct}%` : '0%' }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] opacity-60 mt-4 font-bold uppercase tracking-widest">
                                    <span>Total Amount: {fmt(summary.totalAmount)}</span>
                                    <span>Status: {summary.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-px bg-white/10 hidden md:block" />

                        <div className="flex flex-col justify-between gap-6 min-w-[180px]">
                            {[
                                { label: 'Bixiyey (Paid)', value: fmt(summary.totalPaid), icon: <CheckCircle className="h-4 w-4" /> },
                                { label: 'Wadarta (Total)', value: fmt(summary.totalAmount), icon: <DollarSign className="h-4 w-4" /> },
                                { label: 'Xaaladda (Status)', value: summary.status === 'Paid' ? 'Full' : 'Pending', icon: <TrendingUp className="h-4 w-4" /> },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-1 opacity-60">
                                        {s.icon}
                                        <span className="text-[9px] font-black uppercase tracking-tighter">{s.label}</span>
                                    </div>
                                    <p className="text-lg font-black">{s.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-xl flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                        <CreditCard className="h-10 w-10 text-[#2563EB]" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Need Support?</h3>
                    <p className="text-sm text-gray-500 mb-8 px-4 font-medium leading-relaxed">If you have any questions regarding your fee statement, please visit the accounts office.</p>
                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-200 flex items-center justify-center gap-2">
                        Visit Accounts <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#2563EB]" />
                        Transaction History / Taariikhda Lacag bixinta
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-4 text-left">Period / Term</th>
                                <th className="px-8 py-4 text-left">Date</th>
                                <th className="px-8 py-4 text-left">Total Fee</th>
                                <th className="px-8 py-4 text-left">Amount Paid</th>
                                <th className="px-8 py-4 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {records.map((r, i) => (
                                <tr key={i} className="hover:bg-blue-50 transition-colors group">
                                    <td className="px-8 py-5 font-black text-gray-900 group-hover:text-[#2563EB] transition-colors uppercase">{r.term}</td>
                                    <td className="px-8 py-5 text-gray-500 text-xs font-mono">{r.date || 'System Generated'}</td>
                                    <td className="px-8 py-5 text-gray-700">{fmt(r.amount)}</td>
                                    <td className="px-8 py-5 text-emerald-600 font-black">{fmt(r.paid)}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                            r.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {r.status === 'Paid' ? 'Dhameystiran' : 'Qabyo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyFee;
