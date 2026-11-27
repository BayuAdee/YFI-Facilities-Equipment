import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LuShieldCheck,
    LuLayoutDashboard,
    LuClipboardCheck,
    LuUsers,
    LuLayers,
    LuScanQrCode,
    LuLogOut,
    LuLogIn,
} from 'react-icons/lu';

export default function Sidebar({ user, onLogout, onOpenScanner }) {
    const location = useLocation();

    const isActive = (path) => {
        if (path.includes('?')) {
            const currentFull = location.pathname + location.search;
            if (currentFull === path) return true;
            if (location.pathname === '/admin' && location.search === '' && path.includes('tab=assets')) return true;
            return false;
        }
        return location.pathname === path;
    };

    const isAdmin = user?.role === 'admin';

    const operationalLinks = [
        { path: '/dashboard', label: 'Dashboard Utama', icon: LuLayoutDashboard },
    ];

    const adminLinks = [
        { path: '/admin?tab=assets', label: 'Daftar Alat & QR', icon: LuShieldCheck },
        { path: '/admin?tab=masters', label: 'Area & Jenis Alat', icon: LuLayers },
        { path: '/admin?tab=checklists', label: 'Poin Checklist', icon: LuClipboardCheck },
        { path: '/admin?tab=users', label: 'Manajemen Petugas', icon: LuUsers },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200/80 shrink-0 z-30 select-none">
            {/* Header / Brand */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <img
                        src="/logo.jpg"
                        alt="Logo FEMS Yahata"
                        className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200/80 shadow-2xs p-0.5 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-base tracking-tight text-slate-900">FEMS</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-300 uppercase tracking-wide">
                                Yahata
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium truncate" title="Facilities & Equipment Monitoring System">
                            Facilities & Equipment Monitoring
                        </span>
                    </div>
                </Link>
            </div>

            {/* Quick Action Button: Scan QR */}
            <div className="p-4 pb-2">
                <button
                    type="button"
                    onClick={onOpenScanner}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
                >
                    <LuScanQrCode className="w-4 h-4" />
                    <span>Scan Barcode / QR</span>
                </button>
            </div>

            {/* Navigation Menus */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
                {/* Operasional Section */}
                <div>
                    <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                        Operasional
                    </span>
                    <nav className="space-y-1">
                        {operationalLinks.map((item) => {
                            const active = isActive(item.path);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                                        active
                                            ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-slate-900' : 'text-slate-500'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Administrasi Section */}
                {isAdmin && (
                    <div>
                        <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                            Administrasi
                        </span>
                        <nav className="space-y-1">
                            {adminLinks.map((item) => {
                                const active = isActive(item.path);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                                            active
                                                ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-slate-900' : 'text-slate-500'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>

            {/* Footer / User Profile Card */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                {user ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-800'
                            }`}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user.name}</p>
                                <p className="text-[10px] text-slate-500 capitalize truncate">
                                    {isAdmin ? 'Administrator' : 'Petugas'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            title="Keluar dari sistem"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                        >
                            <LuLogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                    >
                        <LuLogIn className="w-4 h-4" />
                        <span>Masuk ke Akun</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}
