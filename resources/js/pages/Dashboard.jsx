import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api/client';
import { formatDate } from '../utils/date';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
    LuCircleCheck,
    LuTriangleAlert,
    LuClock,
    LuCircleAlert,
    LuSearch,
    LuChevronRight,
    LuShieldCheck,
    LuLayers,
    LuX,
} from 'react-icons/lu';

export default function Dashboard({ user }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [repairNotes, setRepairNotes] = useState('');
    const [resolving, setResolving] = useState(false);
    const [actionMsg, setActionMsg] = useState('');

    const refreshDashboard = () => {
        api.get('/dashboard')
            .then(({ data }) => setData(data))
            .catch(() => {});
    };

    useEffect(() => {
        setLoading(true);
        api
            .get('/dashboard')
            .then(({ data }) => setData(data))
            .catch((err) => {
                if (err.response?.status === 401) {
                    setData(false);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleResolveRepair = async () => {
        if (!selectedAsset) return;
        setResolving(true);
        try {
            const res = await api.post(`/assets/${selectedAsset.id}/resolve`, {
                notes: repairNotes,
            });
            setActionMsg(res.data.message || `Alat ${selectedAsset.code} berhasil diperbaiki dan kembali OK.`);
            setSelectedAsset(null);
            setRepairNotes('');
            refreshDashboard();
            setTimeout(() => setActionMsg(''), 4000);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menandai alat selesai diperbaiki.');
        } finally {
            setResolving(false);
        }
    };

    if (data === false) {
        return <Navigate to="/login?redirect=/dashboard" replace />;
    }

    if (loading) {
        return <LoadingSpinner text="Memuat statistik monitoring fasilitas & peralatan..." />;
    }

    const counts = data.counts || { OK: 0, 'Perlu Tindak Lanjut': 0, Overdue: 0, Expired: 0 };
    const allAssets = data.assets || data.attention || [];

    const filteredAssets = allAssets.filter((item) => {
        const matchesFilter = activeFilter === 'ALL' || item.status === activeFilter;
        const matchesSearch =
            !searchQuery ||
            item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.area?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location_note?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filterInfo = {
        ALL: {
            title: 'Daftar Seluruh Alat Keselamatan',
            icon: LuShieldCheck,
            iconBg: 'bg-blue-50 text-blue-600',
            emptyText: 'Belum ada data alat keselamatan terdaftar.',
        },
        OK: {
            title: 'Daftar Alat Kondisi OK / Normal',
            icon: LuCircleCheck,
            iconBg: 'bg-emerald-50 text-emerald-600',
            emptyText: 'Tidak ada alat keselamatan dengan status Kondisi OK.',
        },
        'Perlu Tindak Lanjut': {
            title: 'Daftar Alat Perlu Perbaikan',
            icon: LuTriangleAlert,
            iconBg: 'bg-amber-50 text-amber-600',
            emptyText: 'Hebat! Tidak ada alat yang memerlukan perbaikan saat ini.',
        },
        Overdue: {
            title: 'Daftar Alat Terlambat Inspeksi',
            icon: LuClock,
            iconBg: 'bg-orange-50 text-orange-600',
            emptyText: 'Bagus! Semua alat diperiksa tepat waktu, tidak ada yang terlambat.',
        },
        Expired: {
            title: 'Daftar Alat Kedaluwarsa',
            icon: LuCircleAlert,
            iconBg: 'bg-rose-50 text-rose-600',
            emptyText: 'Aman! Tidak ada alat keselamatan yang kedaluwarsa.',
        },
    }[activeFilter] || {
        title: 'Daftar Alat Keselamatan',
        icon: LuShieldCheck,
        iconBg: 'bg-slate-100 text-slate-600',
        emptyText: 'Tidak ada alat ditemukan.',
    };

    const FilterIcon = filterInfo.icon;

    return (
        <div className="space-y-6">
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Facilities & Equipment Monitoring System</h1>
                    <p className="text-xs sm:text-sm text-slate-600">
                        Monitoring berkala APAR, Hydrant & Fasilitas Kerja PT Yahata
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            {/* Feedback notification */}
            {actionMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
                    <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{actionMsg}</span>
                </div>
            )}

            {/* Stat Cards 4 Columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* OK */}
                <div
                    onClick={() => setActiveFilter(activeFilter === 'OK' ? 'ALL' : 'OK')}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs cursor-pointer transition hover:border-emerald-300 ${
                        activeFilter === 'OK' ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kondisi OK</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <LuCircleCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{counts['OK'] || 0}</div>
                    <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Siap digunakan</span>
                </div>

                {/* Perlu Tindak Lanjut */}
                <div
                    onClick={() => setActiveFilter(activeFilter === 'Perlu Tindak Lanjut' ? 'ALL' : 'Perlu Tindak Lanjut')}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs cursor-pointer transition hover:border-amber-300 ${
                        activeFilter === 'Perlu Tindak Lanjut' ? 'ring-2 ring-amber-500 border-amber-300' : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Perlu Perbaikan</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                            <LuTriangleAlert className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{counts['Perlu Tindak Lanjut'] || 0}</div>
                    <span className="text-[11px] text-amber-700 font-medium mt-1 block">Temuan inspeksi</span>
                </div>

                {/* Overdue */}
                <div
                    onClick={() => setActiveFilter(activeFilter === 'Overdue' ? 'ALL' : 'Overdue')}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs cursor-pointer transition hover:border-orange-300 ${
                        activeFilter === 'Overdue' ? 'ring-2 ring-orange-500 border-orange-300' : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Terlambat</span>
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
                            <LuClock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{counts['Overdue'] || 0}</div>
                    <span className="text-[11px] text-orange-700 font-medium mt-1 block">Lewat jadwal cek</span>
                </div>

                {/* Expired */}
                <div
                    onClick={() => setActiveFilter(activeFilter === 'Expired' ? 'ALL' : 'Expired')}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs cursor-pointer transition hover:border-rose-300 ${
                        activeFilter === 'Expired' ? 'ring-2 ring-rose-500 border-rose-300' : 'border-slate-200/80'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kedaluwarsa</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                            <LuCircleAlert className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{counts['Expired'] || 0}</div>
                    <span className="text-[11px] text-rose-700 font-medium mt-1 block">Perlu isi ulang/ganti</span>
                </div>
            </div>

            {/* Assets List Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${filterInfo.iconBg}`}>
                            <FilterIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">
                                {filterInfo.title}
                            </h2>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {filteredAssets.length} Alat
                            </span>
                        </div>
                    </div>

                    {/* Search Bar & Reset Filter samping judul */}
                    <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[300px]">
                        <div className="relative flex-1">
                            <LuSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari kode alat, jenis, area..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        {activeFilter !== 'ALL' && (
                            <button
                                onClick={() => setActiveFilter('ALL')}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition shrink-0 cursor-pointer"
                                title="Reset filter ke Semua Alat"
                            >
                                <LuX className="w-3.5 h-3.5" />
                                <span>Reset Filter</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Assets List */}
                {filteredAssets.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl px-4">
                        <FilterIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-900">
                            {searchQuery ? 'Tidak ada alat yang cocok dengan pencarian' : filterInfo.emptyText}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {searchQuery
                                ? `Hasil pencarian untuk "${searchQuery}" tidak ditemukan.`
                                : 'Gunakan filter lain di atas atau daftarkan alat baru di menu Admin.'}
                        </p>
                        {(activeFilter !== 'ALL' || searchQuery) && (
                            <button
                                onClick={() => {
                                    setActiveFilter('ALL');
                                    setSearchQuery('');
                                }}
                                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                            >
                                Tampilkan Semua Alat
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredAssets.map((asset) => {
                            const hasIssues = asset.status === 'Perlu Tindak Lanjut';
                            return (
                                <div
                                    key={asset.id}
                                    className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition ${
                                        hasIssues ? 'bg-amber-50/30' : ''
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/a/${asset.qr_token}`} className="font-bold text-slate-900 hover:text-blue-600 transition">
                                                {asset.code}
                                            </Link>
                                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                {asset.asset_type?.name || 'APAR'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 flex items-center gap-2">
                                            <span>Area: <strong>{asset.area?.name}</strong></span>
                                            <span>·</span>
                                            <span>{asset.location_note || 'Tidak ada posisi spesifik'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                                        <StatusBadge status={asset.status} size="sm" />
                                        {hasIssues && (
                                            <button
                                                onClick={() => {
                                                    setSelectedAsset(asset);
                                                    setRepairNotes('');
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                            >
                                                <LuTriangleAlert className="w-3.5 h-3.5" />
                                                <span>Lihat Catatan & Perbaiki</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Expiring Soon Section */}
            {data.expiring?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <LuClock className="w-4 h-4 text-orange-500" />
                        <span>Mendekati Tanggal Kedaluwarsa (30 Hari ke Depan)</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {data.expiring.map((asset) => (
                            <Link
                                key={asset.id}
                                to={`/a/${asset.qr_token}`}
                                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-bold text-sm text-slate-900">{asset.code}</div>
                                    <div className="text-xs text-slate-600">{asset.area?.name}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold text-rose-700">Exp: {formatDate(asset.expiry_date)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal Detail Temuan & Selesai Perbaikan */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-extrabold text-slate-900 text-lg">
                                        {selectedAsset.code}
                                    </h3>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                        {selectedAsset.asset_type?.name}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Area: <strong>{selectedAsset.area?.name}</strong> {selectedAsset.location_note ? `· ${selectedAsset.location_note}` : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedAsset(null);
                                    setRepairNotes('');
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            >
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Status Alert Banner */}
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5">
                            <LuTriangleAlert className="w-5 h-5 text-amber-600 shrink-0" />
                            <span className="font-bold text-amber-900 text-xs sm:text-sm">
                                Status Saat Ini: Perlu Tindak Lanjut / Temuan Rusak
                            </span>
                        </div>

                        {/* Catatan Temuan Petugas */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Catatan Temuan Petugas:
                            </label>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                                {selectedAsset.latest_inspection?.notes || (
                                    <span className="text-slate-400 italic">Tidak ada catatan teks tambahan dari petugas.</span>
                                )}
                            </div>
                            {selectedAsset.latest_inspection && (
                                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 pt-0.5">
                                    <span>Dilaporkan oleh: <strong>{selectedAsset.latest_inspection.user?.name || 'Petugas'}</strong></span>
                                    <span>·</span>
                                    <span>Waktu: {formatDate(selectedAsset.latest_inspection.inspected_at)}</span>
                                </div>
                            )}
                        </div>

                        {/* Poin Checklist Yang Tidak Sesuai */}
                        {selectedAsset.latest_inspection?.answers?.some((a) => !a.is_ok) && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Poin Checklist Tidak Sesuai:
                                </label>
                                <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 divide-y divide-rose-100 space-y-2">
                                    {selectedAsset.latest_inspection.answers
                                        .filter((a) => !a.is_ok)
                                        .map((ans, idx) => (
                                            <div key={idx} className={`flex items-start justify-between text-xs gap-2 ${idx > 0 ? 'pt-2' : ''}`}>
                                                <span className="text-slate-800 font-medium">• {ans.label_snapshot}</span>
                                                <span className="text-rose-700 font-bold shrink-0 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                                                    {ans.value === 'tidak' ? 'Tidak Sesuai' : ans.value}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Foto Temuan jika ada */}
                        {selectedAsset.latest_inspection?.photos?.length > 0 && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Foto Bukti Temuan:
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedAsset.latest_inspection.photos.map((p) => (
                                        <a
                                            key={p.id}
                                            href={`/storage/${p.path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block rounded-xl overflow-hidden border border-slate-200 aspect-video hover:opacity-90"
                                        >
                                            <img src={`/storage/${p.path}`} alt="Bukti temuan" className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Form Tindakan Perbaikan */}
                        <div className="space-y-1.5 pt-1">
                            <label className="block text-xs font-bold text-slate-700">
                                Catatan Tindakan Perbaikan (Opsional):
                            </label>
                            <textarea
                                rows="2"
                                value={repairNotes}
                                onChange={(e) => setRepairNotes(e.target.value)}
                                placeholder="Contoh: Selang telah diganti baru dan jarum tekanan sudah diisi ulang normal."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        {/* Modal Actions */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedAsset(null);
                                    setRepairNotes('');
                                }}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                disabled={resolving}
                                onClick={handleResolveRepair}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <LuCircleCheck className="w-4 h-4" />
                                <span>{resolving ? 'Memperbarui...' : 'Tandai Selesai'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
