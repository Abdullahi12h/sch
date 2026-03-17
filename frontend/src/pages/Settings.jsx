import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Globe, Shield, Save, Eye, EyeOff, KeyRound, Copy, Check, Loader2, Database, Download, Upload, FileJson, Table } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';

const staffCredentials = [
    { role: 'Admin', name: 'Admin User', username: 'admin', password: 'password123', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    { role: 'Teacher', name: 'Teacher Jama', username: 'teacher', password: 'password123', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    { role: 'Cashier', name: 'Cashier Ahmed', username: 'cashier', password: 'password123', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    { role: 'Student', name: 'Student Ali', username: 'student', password: 'password123', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
];

const CredentialCard = ({ cred }) => {
    const [showPass, setShowPass] = useState(false);
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(`Username: ${cred.username}\nPassword: ${cred.password}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cred.dot}`} />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{cred.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cred.color}`}>{cred.role}</span>
                    </div>
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#2563EB] transition-colors">
                    {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /><span className="text-green-500">Copied!</span></> : <><Copy className="h-3.5 w-3.5" />Copy</>}
                </button>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400 w-16 shrink-0">Username</span>
                    <span className="text-xs font-mono text-gray-700 flex-1">{cred.username}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400 w-16 shrink-0">Password</span>
                    <span className="text-xs font-mono text-gray-700 flex-1">{showPass ? cred.password : '•'.repeat(cred.password.length)}</span>
                    <button onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');
    const [showPass, setShowPass] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    // Load initial data from localStorage or defaults
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        phone: '',
        role: user?.role || '',
        school: 'Al-Nuur Academy',
        year: '2026-2027'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.token) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get('/api/auth/profile', config);
                
                setProfileData({
                    name: data.name || '',
                    username: data.username || '',
                    role: data.role || '',
                    phone: data.studentData?.phone || data.teacherData?.phone || '',
                    school: localStorage.getItem('system_config') ? JSON.parse(localStorage.getItem('system_config')).schoolName : 'Al-Nuur Academy',
                    year: localStorage.getItem('system_config') ? JSON.parse(localStorage.getItem('system_config')).academicYear : '2026-2027',
                    grade: data.studentData?.grade || '',
                    parent: data.studentData?.parent || '',
                    subject: data.teacherData?.subject || ''
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };
        fetchProfile();
    }, [user]);

    const [systemData, setSystemData] = useState(() => {
        const saved = localStorage.getItem('system_config');
        return saved ? JSON.parse(saved) : {
            schoolName: 'Al-Nuur Academy',
            academicYear: '2026-2027',
            language: 'English',
            timezone: 'Africa/Mogadishu',
            currency: 'USD ($)',
            dateFormat: 'MM/DD/YYYY'
        };
    });

    const [notificationSettings, setNotificationSettings] = useState(() => {
        const saved = localStorage.getItem('system_notifications');
        return saved ? JSON.parse(saved) : [
            { id: 1, label: 'New Student Enrollment', desc: 'Get notified when a new student is enrolled', on: true },
            { id: 2, label: 'Fee Payment Received', desc: 'Alert when a fee payment is recorded', on: true },
            { id: 3, label: 'Exam Schedule Updates', desc: 'Notify about changes to exam timetable', on: false },
            { id: 4, label: 'Attendance Reports', desc: 'Daily attendance summary email', on: true },
            { id: 5, label: 'System Alerts', desc: 'Critical system and security alerts', on: true },
            { id: 6, label: 'Teacher Activity', desc: 'Updates from teacher submissions', on: false },
        ];
    });

    const handleSave = (tabName) => {
        setSaving(true);

        // Persist to local storage
        if (tabName === 'Profile') localStorage.setItem('system_profile', JSON.stringify(profileData));
        if (tabName === 'System') {
            localStorage.setItem('system_config', JSON.stringify(systemData));
            // Trigger a global event so Sidebar/Header can update immediately
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('configUpdate', { detail: systemData }));
        }
        if (tabName === 'Notifications') localStorage.setItem('system_notifications', JSON.stringify(notificationSettings));

        setTimeout(() => {
            setSaving(false);
            setSuccessMessage(`${tabName} updated successfully!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        }, 800);
    };

    const toggleNotification = (id) => {
        setNotificationSettings(prev => prev.map(n => n.id === id ? { ...n, on: !n.on } : n));
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-0">
            <div className="mb-8 p-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
                <p className="text-sm text-gray-500 mt-1.5 font-medium">Configure portal preferences, user roles, and system options</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-60 shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                        {[
                            { label: 'Profile', icon: <User className="h-4.5 w-4.5" /> },
                            { label: 'Security', icon: <Lock className="h-4.5 w-4.5" /> },
                            { label: 'Notifications', icon: <Bell className="h-4.5 w-4.5" /> },
                            { label: 'System', icon: <Globe className="h-4.5 w-4.5" /> },
                            { label: 'Staff', icon: <KeyRound className="h-4.5 w-4.5" /> },
                            { label: 'Backup', icon: <Database className="h-4.5 w-4.5" /> },
                        ].map(t => (
                            <button
                                key={t.label}
                                onClick={() => setActiveTab(t.label)}
                                className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all border-b border-gray-50 last:border-b-0 ${activeTab === t.label ? 'bg-blue-50 text-[#2563EB] border-l-[3px] border-l-[#2563EB]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                            >
                                <span className={activeTab === t.label ? 'scale-110' : ''}>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {successMessage && (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
                            <Check className="h-4 w-4" /> {successMessage}
                        </div>
                    )}
                </div>

                {/* Tab Content */}
                <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    {activeTab === 'Profile' && (
                        <div className="bg-linear-to-br from-white to-gray-50/30 rounded-2xl border border-gray-100/80 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3"><User className="h-6 w-6 text-[#2563EB]" /> Profile Information</h2>
                            <div className="flex items-center gap-6 mb-8 p-4 bg-white rounded-2xl border border-gray-50 shadow-xs">
                                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-100">
                                    {profileData.name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-black text-gray-900">{profileData.name}</p>
                                    <p className="text-sm font-bold text-[#2563EB] uppercase tracking-wider">{profileData.role}</p>
                                    <button className="text-xs text-blue-400 hover:text-[#2563EB] font-bold transition-colors">Change Photo</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: 'Full Name', value: profileData.name, type: 'text', key: 'name' },
                                    { label: 'Username', value: profileData.username, type: 'text', key: 'username' },
                                    { label: 'Phone Number', value: profileData.phone, type: 'tel', key: 'phone' },
                                    { label: 'Role', value: profileData.role, type: 'text', disabled: true, key: 'role' },
                                    ...(user?.role === 'student' ? [
                                        { label: 'Grade / Class', value: profileData.grade, type: 'text', disabled: true, key: 'grade' },
                                        { label: 'Parent / Guardian', value: profileData.parent, type: 'text', disabled: true, key: 'parent' }
                                    ] : []),
                                    ...(user?.role === 'teacher' ? [
                                        { label: 'Subject', value: profileData.subject, type: 'text', disabled: true, key: 'subject' }
                                    ] : []),
                                    { label: 'School Name', value: profileData.school, type: 'text', key: 'school' },
                                    { label: 'Academic Year', value: profileData.year, type: 'text', key: 'year' },
                                ].map(f => (
                                    <div key={f.label} className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{f.label}</label>
                                        <input
                                            type={f.type}
                                            value={f.value}
                                            disabled={f.disabled}
                                            onChange={(e) => setProfileData({ ...profileData, [f.key]: e.target.value })}
                                            className={`w-full border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/5 transition-all ${f.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white shadow-sm hover:border-gray-200'}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => handleSave('Profile')}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] text-white rounded-2xl text-sm font-black hover:bg-[#1d4ed8] transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="bg-linear-to-br from-white to-rose-50/10 rounded-2xl border border-gray-100/80 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3"><Lock className="h-6 w-6 text-rose-600" /> Security Settings</h2>
                            <div className="space-y-6">
                                {[
                                    { label: 'Current Password', placeholder: 'Enter current password' },
                                    { label: 'New Password', placeholder: 'Enter new password' },
                                    { label: 'Confirm New Password', placeholder: 'Confirm new password' },
                                ].map(f => (
                                    <div key={f.label} className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{f.label}</label>
                                        <div className="relative">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                placeholder={f.placeholder}
                                                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all bg-white shadow-sm"
                                            />
                                            <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-5 bg-rose-50 rounded-2xl border border-rose-100">
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                                    <p className="text-sm font-bold text-rose-700 leading-snug">Password must be at least 8 characters and include uppercase, lowercase, and a number.</p>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => handleSave('Security')}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-rose-600 text-white rounded-2xl text-sm font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Notifications' && (
                        <div className="bg-linear-to-br from-white to-amber-50/10 rounded-2xl border border-gray-100/80 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3"><Bell className="h-6 w-6 text-amber-500" /> Notifications</h2>
                            <div className="space-y-2">
                                {notificationSettings.map((n, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{n.label}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">{n.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleNotification(n.id)}
                                            className={`relative w-14 h-7 rounded-full transition-all shrink-0 ${n.on ? 'bg-[#2563EB] shadow-inner' : 'bg-gray-200'}`}
                                        >
                                            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${n.on ? 'left-8' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => handleSave('Notifications')}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] text-white rounded-2xl text-sm font-black hover:bg-[#1d4ed8] transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'System' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3"><Globe className="h-6 w-6 text-emerald-600" /> System Config</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: 'School Name', value: systemData.schoolName, key: 'schoolName' },
                                    { label: 'Academic Year', value: systemData.academicYear, key: 'academicYear' },
                                    { label: 'Default Language', value: systemData.language, type: 'select', options: ['English', 'Somali', 'Arabic'], key: 'language' },
                                    { label: 'Timezone', value: systemData.timezone, type: 'select', options: ['Africa/Mogadishu', 'UTC', 'Europe/London'], key: 'timezone' },
                                    { label: 'Currency', value: systemData.currency, type: 'select', options: ['USD ($)', 'SOS', 'EUR (€)'], key: 'currency' },
                                    { label: 'Date Format', value: systemData.dateFormat, type: 'select', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], key: 'dateFormat' },
                                ].map(f => (
                                    <div key={f.label} className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{f.label}</label>
                                        {f.type === 'select' ? (
                                            <select
                                                value={f.value}
                                                onChange={(e) => setSystemData({ ...systemData, [f.key]: e.target.value })}
                                                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all bg-white shadow-sm cursor-pointer"
                                            >
                                                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={f.value}
                                                onChange={(e) => setSystemData({ ...systemData, [f.key]: e.target.value })}
                                                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all bg-white shadow-sm"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => handleSave('System')}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                                    Save Config
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Staff' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3"><KeyRound className="h-6 w-6 text-purple-600" /> Staff Credentials</h2>
                            <p className="text-sm font-bold text-gray-400 mb-8 ml-9">Default login credentials for all system staff roles.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {staffCredentials.map(cred => <CredentialCard key={cred.role} cred={cred} />)}
                            </div>
                            <div className="mt-8 p-5 bg-purple-50 border border-purple-100 rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Shield className="h-5 w-5 text-purple-600 shrink-0" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-purple-900 leading-none">Security Reminder</p>
                                    <p className="text-xs font-bold text-purple-700/70">These are the default system credentials. Staff should change their passwords after first login.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Backup' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3"><Database className="h-6 w-6 text-blue-600" /> Backup & Restore</h2>
                            <p className="text-sm font-bold text-gray-400 mb-8 ml-9">Download full system database or upload a previously saved backup.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Export Section */}
                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <Download className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm font-black text-blue-900 uppercase">Export Data</p>
                                    </div>
                                    <p className="text-xs font-bold text-blue-700/70">Exports all system data (Students, Teachers, Attendance, etc.)</p>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setSaving(true);
                                                    const { data } = await axios.get('/api/backup/export', {
                                                        headers: { Authorization: `Bearer ${user.token}` }
                                                    });
                                                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `backup_full_${new Date().toISOString().split('T')[0]}.json`;
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                    setSuccessMessage('Full JSON backup exported!');
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Error exporting JSON backup');
                                                } finally {
                                                    setSaving(false);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-[#2563EB] border border-blue-200 rounded-xl text-xs font-black uppercase hover:bg-[#2563EB] hover:text-white transition-all"
                                        >
                                            <FileJson className="h-4 w-4" /> Download JSON
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setSaving(true);
                                                    const { data } = await axios.get('/api/backup/export', {
                                                        headers: { Authorization: `Bearer ${user.token}` }
                                                    });
                                                    
                                                    const workbook = XLSX.utils.book_new();
                                                    Object.keys(data).forEach(collection => {
                                                        if (Array.isArray(data[collection]) && data[collection].length > 0) {
                                                            const worksheet = XLSX.utils.json_to_sheet(data[collection]);
                                                            XLSX.utils.book_append_sheet(workbook, worksheet, collection);
                                                        }
                                                    });
                                                    
                                                    XLSX.writeFile(workbook, `system_data_full_${new Date().toISOString().split('T')[0]}.xlsx`);
                                                    setSuccessMessage('Full Excel backup exported!');
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Error exporting Excel backup');
                                                } finally {
                                                    setSaving(false);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-200"
                                        >
                                            <Table className="h-4 w-4" /> Download Excel
                                        </button>
                                    </div>
                                </div>

                                {/* Import Section */}
                                <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <Upload className="h-5 w-5 text-amber-600" />
                                        <p className="text-sm font-black text-amber-900 uppercase">Import Data</p>
                                    </div>
                                    <p className="text-xs font-bold text-amber-700/70">Restores previously saved backup. Warning: This will delete current data!</p>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <label className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl text-xs font-black uppercase hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 cursor-pointer">
                                            <FileJson className="h-4 w-4" /> Upload JSON File
                                            <input
                                                type="file"
                                                accept=".json"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    if (!window.confirm("Are you sure you want to restore this data? All current data will be erased!")) return;
                                                    
                                                    const reader = new FileReader();
                                                    reader.onload = async (event) => {
                                                        try {
                                                            setSaving(true);
                                                            const json = JSON.parse(event.target.result);
                                                            await axios.post('/api/backup/import', json, {
                                                                headers: { Authorization: `Bearer ${user.token}` }
                                                            });
                                                            setSuccessMessage('System restored successfully!');
                                                            setTimeout(() => window.location.reload(), 2000);
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Error importing JSON: ' + (err.response?.data?.message || err.message));
                                                        } finally {
                                                            setSaving(false);
                                                        }
                                                    };
                                                    reader.readAsText(file);
                                                }}
                                            />
                                        </label>
                                        <p className="text-[10px] text-amber-400 font-bold text-center italic mt-2">* Excel upload feature coming in next version</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;

