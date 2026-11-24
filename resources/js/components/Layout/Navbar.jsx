import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LuShieldCheck,
    LuLayoutDashboard,
    LuSettings,
    LuUser,
    LuLogOut,
    LuLogIn,
    LuUsers,
    LuLayers,
    LuClipboardCheck,
} from 'react-icons/lu';

export default function Navbar({ user, onLogout }) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
        { path: '/admin?tab=assets', label: 'Alat & QR', icon: LuShieldCheck, adminOnly: true },
        { path: '/admin?tab=checklists', label: 'Checklist K3', icon: LuClipboardCheck, adminOnly: true },
        { path: '/admin?tab=users', label: 'Petugas K3', icon: LuUsers, adminOnly: true },
        { path: '/admin?tab=masters', label: 'Master Area', icon: LuLayers, adminOnly: true },
    ];

    const isActive = (path) => {
        if (path.includes('?')) {
            const currentFull = location.pathname + location.search;
            if (currentFull === path) return true;
            if (location.pathname === '/admin' && location.search === '' && path.includes('tab=assets')) return true;
            return false;
        }
        return location.pathname === path;
    };

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition">
                        <LuShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-lg tracking-tight text-slate-900">FEMS</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wide">
                                Yahata
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium hidden sm:block">Facilities & Equipment Monitoring System</span>
                    </div>
                </Link>

                {/* Desktop Navigation (Hidden on /login) */}
                {location.pathname !== '/login' && (
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            if (item.adminOnly && user?.role !== 'admin') return null;
                            const active = isActive(item.path);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                                        active
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Desktop User Section */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                            <div className="text-right">
                                <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                                <div className="text-[11px] text-slate-600 capitalize font-medium">{user.role}</div>
                            </div>
                            <button
                                onClick={onLogout}
                                title="Keluar"
                                className="p-2 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition"
                            >
                                <LuLogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : location.pathname !== '/login' ? (
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
                        >
                            <LuLogIn className="w-4 h-4" />
                            <span>Masuk</span>
                        </Link>
                    ) : null}
                </div>

                {/* Mobile User button */}
                <div className="flex md:hidden items-center gap-2">
                    {user ? (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700"
                        >
                            <LuUser className="w-3.5 h-3.5" />
                            <span>{user.name.split(' ')[0]}</span>
                        </button>
                    ) : location.pathname !== '/login' ? (
                        <Link
                            to="/login"
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                        >
                            Masuk
                        </Link>
                    ) : null}
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && user && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-600 capitalize font-medium">{user.email} · {user.role}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-700 text-xs font-medium"
                        >
                            <LuLogOut className="w-3.5 h-3.5" />
                            <span>Keluar</span>
                        </button>
                    </div>

                    {/* Navigation Links in Mobile Dropdown */}
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            if (item.adminOnly && user?.role !== 'admin') return null;
                            const active = isActive(item.path);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                        active
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
}
