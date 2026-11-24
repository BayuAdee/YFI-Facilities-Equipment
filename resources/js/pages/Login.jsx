import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import {
    LuShieldCheck,
    LuEye,
    LuEyeOff,
    LuLogIn,
    LuLoaderCircle,
    LuCircleAlert,
} from 'react-icons/lu';

export default function Login({ onLoginSuccess }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ login: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const redirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/login', form);
            if (onLoginSuccess) onLoginSuccess(data.user);
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (login, password) => {
        setForm({ login, password });
    };

    return (
        <div className="max-w-md mx-auto py-8 sm:py-14 px-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/25">
                        <LuShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Masuk FEMS</h1>
                    <p className="text-xs sm:text-sm text-slate-600">Facilities & Equipment Monitoring System — PT Yahata</p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                        <LuCircleAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <div>{error}</div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Email atau Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={form.login}
                                onChange={(e) => setForm({ ...form, login: e.target.value })}
                                placeholder="nama@perusahaan.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata Sandi</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-700"
                            >
                                {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition shadow-sm shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <LuLoaderCircle className="w-4 h-4 animate-spin" /> : <LuLogIn className="w-4 h-4" />}
                        <span>Masuk ke Akun</span>
                    </button>
                </form>

                {/* Demo Quick Login Helper */}
                <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                        Akun Demo Cepat
                    </span>
                    <div className="flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fillDemo('admin@safecheck.local', 'password')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                        >
                            Masuk sbg Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('petugas@safecheck.local', 'password')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                        >
                            Masuk sbg Petugas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
