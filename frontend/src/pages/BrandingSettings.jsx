import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Check, Palette, Shield, Info, Save } from 'lucide-react';

const BrandingSettings = () => {
    const [logo, setLogo] = useState(null);
    const [saved, setSaved] = useState(false);
    const [schoolName, setSchoolName] = useState(() => {
        const saved = localStorage.getItem('system_config');
        return saved ? JSON.parse(saved).schoolName : 'AI-HAFID SKILLS';
    });

    useEffect(() => {
        const savedLogo = localStorage.getItem('login_logo');
        if (savedLogo) {
            setLogo(savedLogo);
        }
    }, []);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Logo-ka waa inuu ka yaryahay 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setLogo(base64String);
                setSaved(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (logo) {
            localStorage.setItem('login_logo', logo);
        } else {
            localStorage.removeItem('login_logo');
        }
        
        // Also update school name in system_config if changed
        const currentConfig = JSON.parse(localStorage.getItem('system_config') || '{}');
        localStorage.setItem('system_config', JSON.stringify({
            ...currentConfig,
            schoolName: schoolName
        }));

        setSaved(true);
        // Trigger storage event for sidebar/header
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('configUpdate'));
        
        setTimeout(() => setSaved(false), 3000);
    };

    const removeLogo = () => {
        setLogo(null);
        setSaved(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-[#2e86de] flex items-center justify-center shadow-lg shadow-blue-100">
                        <ImageIcon className="h-6 w-6 text-white" />
                    </span>
                    Maamulka Logo-ka & Branding
                </h1>
                <p className="text-sm font-bold text-gray-400 mt-2">
                    Halkaan ka bedel Logo-ga ka muuqda bogga Login-ka iyo magaca dugsiga.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left side: Upload area */}
                <div className="md:col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-blue-500" /> Soo Gali Logo Cusub
                        </h2>

                        <div className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${logo ? 'border-blue-100 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                            {logo ? (
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        <img src={logo} alt="Logo Preview" className="w-48 h-48 object-contain rounded-xl shadow-md bg-white p-2" />
                                        <button 
                                            onClick={removeLogo}
                                            className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs font-bold text-blue-600 mt-4 uppercase tracking-widest">Logo-ga waa diyaar</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <ImageIcon className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600">Riix halkan si aad u soo xulato logo</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-black">PNG, JPG ama SVG (Max 2MB)</p>
                                    <input 
                                        type="file" 
                                        onChange={handleLogoUpload} 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                    />
                                </>
                            )}
                        </div>

                        <div className="mt-8 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Magaca Dugsiga (System Name)</label>
                                <input 
                                    type="text" 
                                    value={schoolName}
                                    onChange={(e) => {
                                        setSchoolName(e.target.value);
                                        setSaved(false);
                                    }}
                                    placeholder="Tusaale: AI-HAFID SKILLS"
                                    className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button 
                                onClick={handleSave}
                                disabled={saved}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl ${saved ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-[#2563EB] text-white hover:bg-blue-700 shadow-blue-100'}`}
                            >
                                {saved ? <><Check className="h-5 w-5" /> Saved!</> : <><Save className="h-5 w-5" /> Save Changes</>}
                            </button>
                        </div>
                    </div>

                    {/* Security/Info box */}
                    <div className="bg-amber-50 rounded-3xl border border-amber-100 p-6 flex gap-4">
                        <Info className="h-6 w-6 text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-black text-amber-900 leading-none mb-1">Feejignaan</p>
                            <p className="text-xs font-bold text-amber-700/70">
                                Logo-ga aad halkan ku soo gasho wuxuu si toos ah uga muuqan doonaa bogga Login-ka. 
                                Hubi inuu yahay mid tayo leh (High Resolution) si uu u muuqdo mid qurux badan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side: Login Page Simulation Preview */}
                <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Live Preview (Login Page)</p>
                    <div className="bg-[#f0f2f5] rounded-3xl border border-gray-200 overflow-hidden shadow-sm aspect-[4/5] flex flex-col items-center justify-center p-6 transform scale-95 origin-top">
                        <div className="w-full bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
                            {/* Logo */}
                            <div className="mb-4">
                                <div className="w-24 h-24 flex items-center justify-center relative">
                                    {logo ? (
                                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="w-16 h-16 text-gray-200" />
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-black text-[#2e86de] mb-4 text-center leading-tight">
                                {schoolName || 'SCHOOL NAME'}
                            </h3>

                            <div className="w-full space-y-3">
                                <div className="h-10 bg-blue-50 rounded border border-gray-100"></div>
                                <div className="h-10 bg-blue-50 rounded border border-gray-100"></div>
                                <div className="h-10 bg-blue-600 rounded mt-4"></div>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-widest">Login Screen Simulator</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingSettings;
