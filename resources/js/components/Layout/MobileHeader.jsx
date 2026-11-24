import React from 'react';
import { Link } from 'react-router-dom';
import { LuShieldCheck, LuLogOut, LuLogIn } from 'react-icons/lu';

export default function MobileHeader({ user, onLogout }) {
    return (
        <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
            <div className="px-4 h-14 flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                        <LuShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-base tracking-tight text-slate-900">FEMS</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                            Yahata
                        </span>
                    </div>
                </Link>

                {/* User Info / Logout Button */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate">
                                {user.name}
                            </span>
                            <button
                                type="button"
                                onClick={onLogout}
                                title="Keluar"
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            >
                                <LuLogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                        >
                            Masuk
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
