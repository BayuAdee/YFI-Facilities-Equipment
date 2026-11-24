import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LuLayoutDashboard,
    LuSettings,
    LuScanQrCode,
    LuLogOut,
    LuLogIn,
} from 'react-icons/lu';

export default function BottomNav({ user, onLogout, onOpenScanner }) {
    const location = useLocation();
    const isActive = (path) =>
        location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    const isAdmin = user?.role === 'admin';

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
            <div className={`grid ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} h-16 items-center px-1`}>
                {/* 1. Dashboard */}
                <Link
                    to="/dashboard"
                    className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
                        isActive('/dashboard') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <LuLayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {/* 2. Scan QR Button (Interactive camera scanner) */}
                <button
                    type="button"
                    onClick={onOpenScanner}
                    className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition"
                >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80 shadow-2xs">
                        <LuScanQrCode className="w-4 h-4" />
                    </div>
                    <span>Scan QR</span>
                </button>

                {/* 3. Admin (Only for admin) */}
                {isAdmin && (
                    <Link
                        to="/admin"
                        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
                            isActive('/admin') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <LuSettings className="w-5 h-5" />
                        <span>Admin</span>
                    </Link>
                )}

                {/* 4. Logout / Login */}
                {user ? (
                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-slate-600 hover:text-rose-700 transition"
                    >
                        <LuLogOut className="w-5 h-5" />
                        <span>Keluar</span>
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
                            isActive('/login') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <LuLogIn className="w-5 h-5" />
                        <span>Masuk</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
