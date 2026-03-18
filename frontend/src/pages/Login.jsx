import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, GraduationCap, User, Lock, UserPlus, LogIn, ChevronRight, Mail, X } from 'lucide-react';

const Login = () => {
    // Branding State
    const [branding, setBranding] = useState({
        logo: localStorage.getItem('login_logo') || null,
        schoolName: localStorage.getItem('system_config') ? JSON.parse(localStorage.getItem('system_config')).schoolName : 'AI-HAFID SKILLS'
    });

    // Authentication Mode
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Forgot Password State
    const [showForgot, setShowForgot] = useState(false);
    const [forgotFullName, setForgotFullName] = useState('');
    const [forgotUsername, setForgotUsername] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState('');

    const { login, register } = useAuth();
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

        if (isRegistering) {
            if (password !== confirmPassword) {
                setError('Password-yada isma laha!');
                setIsLoading(false);
                return;
            }

            const result = await register(name, username, password, role);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
                setIsLoading(false);
            }
        } else {
            const result = await login(username, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#364251] p-4 font-sans">
            <div className="w-full max-w-[420px]">
                {/* ── Auth Card ────────────────────────────────────────────────────── */}
                <div className="bg-[#f4f5f7] shadow-lg p-10 flex flex-col items-center">
                    
                    {/* Logo Section */}
                    <div className="mb-6 w-full flex flex-col items-center">
                        {branding.logo ? (
                            <img src={branding.logo} alt="School Logo" className="w-[180px] h-auto object-contain mix-blend-multiply" />
                        ) : (
                            <h1 className="text-3xl font-black text-[#1e88e5] tracking-tight uppercase text-center mb-2">
                                {branding.schoolName}
                            </h1>
                        )}
                    </div>

                    {/* Subtitle */}
                    <p className="text-gray-900 mb-6 text-center font-bold text-[15px]">
                        {isRegistering ? 'Please fill out all fields.' : 'Please sign in to get access.'}
                    </p>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="w-full space-y-3">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 text-center font-semibold">
                                {error}
                            </div>
                        )}

                        {isRegistering && (
                            <>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full h-10 px-3 bg-[#ebf0f5] border border-gray-300 text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#2185d0] transition-colors"
                                    placeholder="Full Name"
                                />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="block w-full h-10 px-3 bg-[#ebf0f5] border border-gray-300 text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#2185d0] transition-colors"
                                >
                                    <option value="student">Arday</option>
                                    <option value="teacher">Macalin</option>
                                    <option value="admin">Maamulka</option>
                                </select>
                            </>
                        )}

                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full h-10 px-3 bg-[#ebf0f5] border border-gray-300 text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#2185d0] transition-colors"
                            placeholder="Username ama Email"
                        />

                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full h-10 px-3 bg-[#ebf0f5] border border-gray-300 text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#2185d0] transition-colors"
                            placeholder="Password"
                        />

                        {isRegistering && (
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full h-10 px-3 bg-[#ebf0f5] border border-gray-300 text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#2185d0] transition-colors"
                                placeholder="Confirm Password"
                            />
                        )}

                        {!isRegistering && (
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="text-[12px] text-gray-500 hover:text-[#2185d0] font-medium transition-colors"
                                >
                                    Lost your password?
                                </button>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-10 bg-[#2185d0] hover:bg-[#1678c2] text-white text-[15px] font-bold transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    isRegistering ? 'Register' : 'Log in'
                                )}
                            </button>
                        </div>
                        
                        <div className="pt-3 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                }}
                                className="text-xs text-gray-500 hover:text-[#2185d0] transition-colors"
                            >
                                {isRegistering ? 'Account miyaad leedahay? Log in' : 'Account ma u baahan tahay? Register'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Forgot Password Modal ─────────────────── */}
            {showForgot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
                    <div className="relative w-full max-w-sm bg-[#f4f5f7] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setShowForgot(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                            <p className="text-sm text-gray-600 mt-2">Buuxi foomka si aan kuu caawino.</p>
                        </div>

                        {forgotSuccess ? (
                            <div className="p-4 bg-green-50 text-green-700 text-sm font-bold text-center border border-green-200">
                                {forgotSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleForgotSubmit} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    value={forgotFullName}
                                    onChange={(e) => setForgotFullName(e.target.value)}
                                    className="w-full h-10 px-3 bg-[#ebf0f5] border border-gray-300 text-sm focus:bg-white focus:outline-none focus:border-[#2185d0] transition-all"
                                    placeholder="Magaca oo buuxa"
                                />
                                <input
                                    type="text"
                                    required
                                    value={forgotUsername}
                                    onChange={(e) => setForgotUsername(e.target.value)}
                                    className="w-full h-10 px-3 bg-[#ebf0f5] border border-gray-300 text-sm focus:bg-white focus:outline-none focus:border-[#2185d0] transition-all"
                                    placeholder="Username-kaaga"
                                />
                                <textarea
                                    required
                                    value={forgotMessage}
                                    onChange={(e) => setForgotMessage(e.target.value)}
                                    className="w-full h-24 px-3 py-2 bg-[#ebf0f5] border border-gray-300 text-sm focus:bg-white focus:outline-none focus:border-[#2185d0] transition-all resize-none"
                                    placeholder="Fariintaada (Sharaxaad)..."
                                />
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="w-full h-10 bg-gray-800 hover:bg-black text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dir Codsiga"}
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

