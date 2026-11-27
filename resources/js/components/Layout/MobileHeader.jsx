import React from 'react';
import { Link } from 'react-router-dom';

export default function MobileHeader({ user }) {
    return (
        <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
            <div className="px-4 h-14 flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img
                        src="/logo.jpg"
                        alt="Logo FEMS Yahata"
                        className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200/80 shadow-2xs p-0.5 shrink-0"
                    />
                    <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-base tracking-tight text-slate-900">FEMS</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-300 uppercase">
                            Yahata
                        </span>
                    </div>
                </Link>

                {/* User Info (Logout button disembunyikan di header mobile karena sudah ada di Bottom Navigation) */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <span className="text-xs font-bold text-slate-700 max-w-[140px] truncate bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                            {user.name}
                        </span>
                    ) : (
                        <Link
                            to="/login"
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold"
                        >
                            Masuk
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
