import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, GraduationCap, User, Lock, UserPlus, LogIn, ChevronRight, Mail } from 'lucide-react';

const Login = () => {
    // Branding State
    const [branding, setBranding] = useState({
        logo: localStorage.getItem('login_logo') || null,
        schoolName: localStorage.getItem('system_config') ? JSON.parse(localStorage.getItem('system_config')).schoolName : 'AI-HAFID SKILLS'
    });

    // Authentication Mode
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Forgot Password State
    const [showForgot, setShowForgot] = useState(false);
    const [forgotFullName, setForgotFullName] = useState('');
    const [forgotUsername, setForgotUsername] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setError('');
        try {
            await axios.post('/api/reset-requests', { 
                fullName: forgotFullName,
                username: forgotUsername, 
                message: forgotMessage 
            });
            setForgotSuccess('Codsigaaga waa la diray!');
            setTimeout(() => {
                setShowForgot(false);
                setForgotSuccess('');
                setForgotFullName('');
                setForgotUsername('');
                setForgotMessage('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Khalad ayaa dhacay');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-sans">
            <div className="w-full max-w-[480px]">
                {/* ── Auth Card ────────────────────────────────────────────────────── */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 sm:p-12 flex flex-col items-center border border-gray-100 relative overflow-hidden">
                    
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-50 rounded-full -ml-12 -mb-12 opacity-50"></div>

                    {/* Logo Section */}
                    <div className="mb-6 relative z-10">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-white rounded-3xl shadow-xl border border-gray-100 p-4 transform hover:rotate-3 transition-transform duration-300">
                            {branding.logo ? (
                                <img src={branding.logo} alt="School Logo" className="w-full h-full object-contain" />
                            ) : (
                                <GraduationCap className="w-16 h-16 text-blue-600" />
                            )}
                        </div>
                    </div>

                    {/* School Name */}
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight text-center uppercase relative z-10">
                        {branding.schoolName}
                    </h1>

                    <p className="text-gray-500 mb-8 text-center font-medium relative z-10">
                        Welcome back! Please enter your details.
                    </p>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="w-full space-y-4 relative z-10">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 text-center font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full h-[60px] pl-12 pr-5 bg-gray-50 border border-transparent rounded-2xl text-base text-gray-900 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none font-semibold placeholder:text-gray-400"
                                placeholder="Username"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full h-[60px] pl-12 pr-5 bg-gray-50 border border-transparent rounded-2xl text-base text-gray-900 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none font-semibold placeholder:text-gray-400"
                                placeholder="Password"
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                type="button"
                                onClick={() => setShowForgot(true)}
                                className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-all"
                            >
                                Lost your password?
                            </button>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full h-[65px] bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl text-lg font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50 shadow-[0_10px_25px_rgba(37,99,235,0.25)]"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <LogIn className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Forgot Password Modal ─────────────────── */}
            {showForgot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
                    <div className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setShowForgot(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 capitalize">Password-ka ma ilaawday?</h3>
                            <p className="text-gray-500 mt-2 font-medium">Fadlan nala soo xiriir si aan kuu caawino.</p>
                        </div>

                        {forgotSuccess ? (
                            <div className="p-6 rounded-2xl bg-green-50 text-green-700 text-sm font-bold text-center border border-green-100">
                                {forgotSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleForgotSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-wider">Magaca oo buuxa</label>
                                    <input
                                        type="text"
                                        required
                                        value={forgotFullName}
                                        onChange={(e) => setForgotFullName(e.target.value)}
                                        className="w-full h-[56px] px-5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-400 transition-all outline-none"
                                        placeholder="Tusaale: Maxamed Cali"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-wider">Username-kaaga</label>
                                    <input
                                        type="text"
                                        required
                                        value={forgotUsername}
                                        onChange={(e) => setForgotUsername(e.target.value)}
                                        className="w-full h-[56px] px-5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-400 transition-all outline-none"
                                        placeholder="Tusaale: maxamed123"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-wider">Fariintaada</label>
                                    <textarea
                                        required
                                        value={forgotMessage}
                                        onChange={(e) => setForgotMessage(e.target.value)}
                                        className="w-full h-[120px] px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-400 transition-all outline-none resize-none"
                                        placeholder="Sharaxaad kooban ka bixi codsigaaga..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="w-full h-[60px] bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                                >
                                    {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Dir Codsiga"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;

