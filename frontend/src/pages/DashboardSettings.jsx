import React, { useState } from 'react';
import {
    Users, UserCheck, BookOpen, DollarSign, CheckCircle2,
    Clock, TrendingDown, Wallet, TrendingUp, Settings,
    Save, RotateCcw, Eye, Palette, Layers, Minus, Plus, Monitor
} from 'lucide-react';

// ─── Available Icons ───────────────────────────────────────────────────
const ICON_OPTIONS = [
    { key: 'Users',        label: 'Users',        component: Users },
    { key: 'UserCheck',    label: 'UserCheck',    component: UserCheck },
    { key: 'BookOpen',     label: 'BookOpen',     component: BookOpen },
    { key: 'DollarSign',   label: 'DollarSign',   component: DollarSign },
    { key: 'CheckCircle2', label: 'CheckCircle2', component: CheckCircle2 },
    { key: 'Clock',        label: 'Clock',        component: Clock },
    { key: 'TrendingDown', label: 'TrendingDown', component: TrendingDown },
    { key: 'Wallet',       label: 'Wallet',       component: Wallet },
    { key: 'TrendingUp',   label: 'TrendingUp',   component: TrendingUp },
    { key: 'Settings',     label: 'Settings',     component: Settings },
];

// ─── Available Colors ───────────────────────────────────────────────────
const COLOR_OPTIONS = [
    { key: 'blue',    label: 'Blue',    bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100',    iconBg: 'bg-blue-100/50',    preview: 'bg-blue-500' },
    { key: 'emerald', label: 'Emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', iconBg: 'bg-emerald-100/50', preview: 'bg-emerald-500' },
    { key: 'amber',   label: 'Amber',   bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   iconBg: 'bg-amber-100/50',   preview: 'bg-amber-500' },
    { key: 'rose',    label: 'Rose',    bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100',    iconBg: 'bg-rose-100/50',    preview: 'bg-rose-500' },
    { key: 'purple',  label: 'Purple',  bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100',  iconBg: 'bg-purple-100/50',  preview: 'bg-purple-500' },
    { key: 'slate',   label: 'Slate',   bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-100',   iconBg: 'bg-slate-100/50',   preview: 'bg-slate-500' },
    { key: 'indigo',  label: 'Indigo',  bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100',  iconBg: 'bg-indigo-100/50',  preview: 'bg-indigo-500' },
    { key: 'cyan',    label: 'Cyan',    bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-100',    iconBg: 'bg-cyan-100/50',    preview: 'bg-cyan-500' },
    { key: 'orange',  label: 'Orange',  bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-100',  iconBg: 'bg-orange-100/50',  preview: 'bg-orange-500' },
    { key: 'teal',    label: 'Teal',    bg: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-100',    iconBg: 'bg-teal-100/50',    preview: 'bg-teal-500' },
];

// ─── Size Options ────────────────────────────────────────────────────────
export const SIZE_OPTIONS = [
    { key: 'xs',  label: 'XS',  px: 14, boxW: 'w-8',  boxH: 'h-8',  boxR: 'rounded-lg' },
    { key: 'sm',  label: 'SM',  px: 16, boxW: 'w-10', boxH: 'h-10', boxR: 'rounded-xl' },
    { key: 'md',  label: 'MD',  px: 20, boxW: 'w-12', boxH: 'h-12', boxR: 'rounded-xl' },
    { key: 'lg',  label: 'LG',  px: 26, boxW: 'w-14', boxH: 'h-14', boxR: 'rounded-2xl' },
    { key: 'xl',  label: 'XL',  px: 32, boxW: 'w-16', boxH: 'h-16', boxR: 'rounded-2xl' },
    { key: '2xl', label: '2XL', px: 40, boxW: 'w-20', boxH: 'h-20', boxR: 'rounded-3xl' },
];

// ─── Background Presets ──────────────────────────────────────────────────
export const BG_PRESETS = [
    // Solids
    { key: 'default',     label: 'Default',      style: { background: '#F0F2F5' } },
    { key: 'white',       label: 'White',         style: { background: '#FFFFFF' } },
    { key: 'gray900',     label: 'Dark',          style: { background: '#111827' } },
    { key: 'slate800',    label: 'Slate',         style: { background: '#1e293b' } },
    { key: 'blue50',      label: 'Ice Blue',      style: { background: '#EFF6FF' } },
    { key: 'emerald50',   label: 'Mint',          style: { background: '#ECFDF5' } },
    { key: 'rose50',      label: 'Blush',         style: { background: '#FFF1F2' } },
    { key: 'amber50',     label: 'Warm',          style: { background: '#FFFBEB' } },
    // Gradients
    { key: 'grad_sky',    label: 'Sky',           style: { background: 'linear-gradient(135deg,#e0f2fe 0%,#f0fdfa 100%)' } },
    { key: 'grad_sunset', label: 'Sunset',        style: { background: 'linear-gradient(135deg,#fdf4ff 0%,#fff1f2 100%)' } },
    { key: 'grad_ocean',  label: 'Ocean',         style: { background: 'linear-gradient(135deg,#eff6ff 0%,#ecfdf5 100%)' } },
    { key: 'grad_dusk',   label: 'Dusk',          style: { background: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)' } },
    { key: 'grad_purple', label: 'Purple Haze',   style: { background: 'linear-gradient(135deg,#faf5ff 0%,#eff6ff 100%)' } },
    { key: 'grad_peach',  label: 'Peach',         style: { background: 'linear-gradient(135deg,#fff7ed 0%,#fdf4ff 100%)' } },
    { key: 'custom',      label: 'Custom Color',  style: null },
];

export const DEFAULT_BG = { preset: 'default', custom: '#F0F2F5' };

export const loadBgConfig = () => {
    try {
        const saved = localStorage.getItem('dashboard_bg_config');
        return saved ? { ...DEFAULT_BG, ...JSON.parse(saved) } : DEFAULT_BG;
    } catch {
        return DEFAULT_BG;
    }
};

export const getBgStyle = (bgConfig) => {
    if (bgConfig.preset === 'custom') return { background: bgConfig.custom || '#F0F2F5' };
    const found = BG_PRESETS.find(p => p.key === bgConfig.preset);
    return found?.style || { background: '#F0F2F5' };
};

// ─── Default Config ─────────────────────────────────────────────────────
export const DEFAULT_CARD_CONFIG = {
    // Stat Cards (3 big ones)
    students:  { color: 'blue',    icon: 'Users',        iconSize: 'xl',  label: 'TOTAL STUDENTS' },
    teachers:  { color: 'emerald', icon: 'UserCheck',    iconSize: 'xl',  label: 'TOTAL TEACHER' },
    classes:   { color: 'purple',  icon: 'BookOpen',     iconSize: 'xl',  label: 'TOTAL CLASSES' },
    // Finance Cards (6 small ones)
    totalFees: { color: 'blue',    icon: 'DollarSign',   iconSize: 'sm',  label: 'Total Fees' },
    collected: { color: 'emerald', icon: 'CheckCircle2', iconSize: 'sm',  label: 'Collected' },
    pending:   { color: 'amber',   icon: 'Clock',        iconSize: 'sm',  label: 'Pending' },
    expenses:  { color: 'rose',    icon: 'TrendingDown', iconSize: 'sm',  label: 'Expenses' },
    salary:    { color: 'slate',   icon: 'Wallet',       iconSize: 'sm',  label: 'Salary' },
    netIncome: { color: 'emerald', icon: 'TrendingUp',   iconSize: 'sm',  label: 'Net Income' },
};

export const loadCardConfig = () => {
    try {
        const saved = localStorage.getItem('dashboard_card_config');
        if (!saved) return DEFAULT_CARD_CONFIG;
        const parsed = JSON.parse(saved);
        // Merge per-key so new fields (iconSize) have defaults
        const merged = {};
        Object.keys(DEFAULT_CARD_CONFIG).forEach(k => {
            merged[k] = { ...DEFAULT_CARD_CONFIG[k], ...(parsed[k] || {}) };
        });
        return merged;
    } catch {
        return DEFAULT_CARD_CONFIG;
    }
};

const getColorObj  = (key) => COLOR_OPTIONS.find(c => c.key === key) || COLOR_OPTIONS[0];
const getSizeObj   = (key) => SIZE_OPTIONS.find(s => s.key === key)  || SIZE_OPTIONS[2];
const getIconComp  = (key) => { const f = ICON_OPTIONS.find(i => i.key === key); return f ? f.component : Users; };

// ─── Single Card Editor ──────────────────────────────────────────────────
const CardEditor = ({ cardKey, config, onChange }) => {
    const colorObj = getColorObj(config.color);
    const sizeObj  = getSizeObj(config.iconSize || 'md');
    const IconComp = getIconComp(config.icon);

    const sizeIdx      = SIZE_OPTIONS.findIndex(s => s.key === (config.iconSize || 'md'));
    const canDecrease  = sizeIdx > 0;
    const canIncrease  = sizeIdx < SIZE_OPTIONS.length - 1;

    const stepSize = (dir) => {
        const newIdx = sizeIdx + dir;
        if (newIdx >= 0 && newIdx < SIZE_OPTIONS.length) {
            onChange(cardKey, 'iconSize', SIZE_OPTIONS[newIdx].key);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Live Preview */}
            <div className={`${colorObj.bg} p-5 flex items-center gap-4 border-b ${colorObj.border}`}>
                <div className={`${sizeObj.boxW} ${sizeObj.boxH} ${sizeObj.boxR} ${colorObj.iconBg} ${colorObj.text} flex items-center justify-center shrink-0 transition-all duration-300`}>
                    <IconComp size={sizeObj.px} strokeWidth={2.5} />
                </div>
                <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${colorObj.text} opacity-60`}>{config.label}</p>
                    <p className={`text-lg font-black ${colorObj.text}`}>Preview</p>
                    <p className={`text-[9px] font-bold ${colorObj.text} opacity-50 mt-0.5`}>
                        Icon Size: <span className="font-black">{sizeObj.label}</span> · {sizeObj.px}px
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* ── Color Picker ── */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                        Background Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map(c => (
                            <button
                                key={c.key}
                                onClick={() => onChange(cardKey, 'color', c.key)}
                                title={c.label}
                                className={`w-7 h-7 rounded-lg ${c.preview} transition-all hover:scale-110 ${config.color === c.key ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Icon Picker ── */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                        Icon
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {ICON_OPTIONS.map(ic => {
                            const Ic = ic.component;
                            return (
                                <button
                                    key={ic.key}
                                    onClick={() => onChange(cardKey, 'icon', ic.key)}
                                    title={ic.label}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                                        config.icon === ic.key
                                            ? `${colorObj.bg} ${colorObj.text} ring-2 ring-offset-1 ${colorObj.border}`
                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                                >
                                    <Ic size={16} strokeWidth={2.5} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Icon Size ── */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                        Icon Size
                    </label>
                    {/* Step buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => stepSize(-1)}
                            disabled={!canDecrease}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all font-black ${
                                canDecrease
                                    ? `${colorObj.bg} ${colorObj.text} hover:opacity-80`
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <Minus size={14} strokeWidth={3} />
                        </button>

                        {/* Size chips */}
                        <div className="flex gap-1.5 flex-1 justify-between">
                            {SIZE_OPTIONS.map((s, i) => (
                                <button
                                    key={s.key}
                                    onClick={() => onChange(cardKey, 'iconSize', s.key)}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                        (config.iconSize || 'md') === s.key
                                            ? `${colorObj.bg} ${colorObj.text} shadow-sm ring-1 ${colorObj.border}`
                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => stepSize(1)}
                            disabled={!canIncrease}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all font-black ${
                                canIncrease
                                    ? `${colorObj.bg} ${colorObj.text} hover:opacity-80`
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Visual size preview strip */}
                    <div className="flex items-end gap-2 mt-3 px-1">
                        {SIZE_OPTIONS.map((s) => (
                            <button
                                key={s.key}
                                onClick={() => onChange(cardKey, 'iconSize', s.key)}
                                title={`${s.label} — ${s.px}px`}
                                className={`flex flex-col items-center gap-1 flex-1 group transition-all`}
                            >
                                <div
                                    className={`rounded-lg ${colorObj.iconBg} flex items-center justify-center mx-auto transition-all duration-300 ${
                                        (config.iconSize || 'md') === s.key
                                            ? `ring-2 ${colorObj.border} ${colorObj.text} opacity-100`
                                            : 'text-gray-300 opacity-50 hover:opacity-80'
                                    }`}
                                    style={{ width: s.px + 12, height: s.px + 12 }}
                                >
                                    <IconComp size={s.px * 0.6} strokeWidth={2.5} />
                                </div>
                                <span className={`text-[8px] font-black uppercase ${
                                    (config.iconSize || 'md') === s.key ? colorObj.text : 'text-gray-300'
                                }`}>
                                    {s.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Settings Page ─────────────────────────────────────────────────
const DashboardSettings = () => {
    const [config, setConfig] = useState(loadCardConfig);
    const [bgConfig, setBgConfig] = useState(loadBgConfig);
    const [saved, setSaved]   = useState(false);

    const handleChange = (cardKey, field, value) => {
        setConfig(prev => ({ ...prev, [cardKey]: { ...prev[cardKey], [field]: value } }));
        setSaved(false);
    };

    const handleBgChange = (field, value) => {
        setBgConfig(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem('dashboard_card_config', JSON.stringify(config));
        localStorage.setItem('dashboard_bg_config', JSON.stringify(bgConfig));
        window.dispatchEvent(new Event('cardConfigUpdate'));
        window.dispatchEvent(new Event('bgConfigUpdate'));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleReset = () => {
        setConfig(DEFAULT_CARD_CONFIG);
        setBgConfig(DEFAULT_BG);
        localStorage.removeItem('dashboard_card_config');
        localStorage.removeItem('dashboard_bg_config');
        window.dispatchEvent(new Event('cardConfigUpdate'));
        window.dispatchEvent(new Event('bgConfigUpdate'));
        setSaved(false);
    };

    const statCards    = [
        { key: 'students', title: 'Students Card' },
        { key: 'teachers', title: 'Teachers Card' },
        { key: 'classes',  title: 'Classes Card'  },
    ];
    const financeCards = [
        { key: 'totalFees', title: 'Total Fees'  },
        { key: 'collected', title: 'Collected'   },
        { key: 'pending',   title: 'Pending'     },
        { key: 'expenses',  title: 'Expenses'    },
        { key: 'salary',    title: 'Salary'      },
        { key: 'netIncome', title: 'Net Income'  },
    ];

    return (
        <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
                            <Palette className="h-5 w-5 text-white" />
                        </span>
                        Dashboard Card Settings
                    </h1>
                    <p className="text-sm font-bold text-gray-400 mt-2">
                        Beddel <span className="text-gray-700">color</span>,{' '}
                        <span className="text-gray-700">icon</span>, <span className="text-gray-700">cabbirka</span> iyo{' '}
                        <span className="text-gray-700">background</span>-ka dashboard-ka
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <RotateCcw className="h-4 w-4" /> Reset Default
                    </button>
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg ${
                            saved
                                ? 'bg-emerald-500 text-white shadow-emerald-100'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                        }`}
                    >
                        <Save className="h-4 w-4" />
                        {saved ? '✓ Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* ── Background Section ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Monitor className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Dashboard Background</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Solid colors · Gradients · Custom</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    {/* Live mini preview */}
                    <div
                        className="w-full h-16 rounded-xl border border-gray-200 flex items-center justify-center transition-all duration-500 shadow-inner"
                        style={getBgStyle(bgConfig)}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Preview</span>
                    </div>

                    {/* Preset grid */}
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                        {BG_PRESETS.filter(p => p.key !== 'custom').map(p => (
                            <button
                                key={p.key}
                                onClick={() => handleBgChange('preset', p.key)}
                                title={p.label}
                                className={`h-10 rounded-xl border-2 transition-all hover:scale-105 ${
                                    bgConfig.preset === p.key
                                        ? 'border-blue-500 scale-105 shadow-md'
                                        : 'border-transparent hover:border-gray-300'
                                }`}
                                style={p.style}
                            />
                        ))}
                    </div>

                    {/* Preset labels row */}
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                        {BG_PRESETS.filter(p => p.key !== 'custom').map(p => (
                            <p key={p.key} className={`text-center text-[8px] font-black uppercase tracking-wide truncate ${
                                bgConfig.preset === p.key ? 'text-blue-600' : 'text-gray-400'
                            }`}>{p.label}</p>
                        ))}
                    </div>

                    {/* Custom color */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                            Custom Color
                        </label>
                        <div className="flex items-center gap-3 flex-1">
                            <input
                                type="color"
                                value={bgConfig.custom || '#F0F2F5'}
                                onChange={e => {
                                    handleBgChange('custom', e.target.value);
                                    handleBgChange('preset', 'custom');
                                }}
                                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                            />
                            <input
                                type="text"
                                value={bgConfig.preset === 'custom' ? (bgConfig.custom || '#F0F2F5') : ''}
                                onChange={e => {
                                    handleBgChange('custom', e.target.value);
                                    handleBgChange('preset', 'custom');
                                }}
                                placeholder="#F0F2F5 ama preset dooro"
                                className="flex-1 text-xs font-black text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            {bgConfig.preset === 'custom' && (
                                <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">ACTIVE</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Stat Cards (3)</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Students · Teachers · Classes</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {statCards.map(({ key, title }) => (
                        <div key={key}>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">{title}</p>
                            <CardEditor cardKey={key} config={config[key]} onChange={handleChange} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Finance Cards ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Finance Cards (6)</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Total Fees · Collected · Pending · Expenses · Salary · Net Income</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {financeCards.map(({ key, title }) => (
                        <div key={key}>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">{title}</p>
                            <CardEditor cardKey={key} config={config[key]} onChange={handleChange} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                <Eye className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-black text-blue-700">Real-time Preview</p>
                    <p className="text-xs font-bold text-blue-400 mt-1">
                        Beddelka <strong>color</strong>, <strong>icon</strong> iyo <strong>cabbirka</strong> ayaa si toos ah ku muuqda preview-ga.
                        Ka dib markaad riixdo <strong>"Save Changes"</strong>, waxay is-cusbooneysiiyaan Dashboard-ka.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardSettings;
