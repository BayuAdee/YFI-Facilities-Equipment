import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/client';
import { formatDate } from '../utils/date';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
    LuClipboardCheck,
    LuClock,
    LuCircleCheck,
    LuMapPin,
    LuCopy,
    LuCheck,
    LuQrCode,
    LuX,
    LuCircleAlert,
    LuTriangleAlert,
} from 'react-icons/lu';

export default function PublicAsset({ user }) {
    const toast = useToast();
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/public/assets/${token}`).then((res) => setData(res.data.asset)),
            api.get(`/public/assets/${token}/inspections`).then((res) => setHistory(res.data)),
        ])
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [token]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Tautan alat berhasil disalin ke clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <LoadingSpinner text="Memuat data alat keselamatan..." />;
    }

    if (error || !data) {
        return (
            <div className="max-w-md mx-auto py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-4 border border-rose-200">
                    <LuCircleAlert className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Alat Tidak Ditemukan</h1>
                <p className="text-sm text-slate-600 mb-6">
                    Kode QR tidak dikenali atau alat keselamatan ini sudah dinonaktifkan oleh administrator.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                    Kembali ke Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Hero Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                                {data.type || 'Alat Keselamatan'}
                            </span>
                            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                <LuMapPin className="w-3.5 h-3.5" /> {data.area}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <span>{data.code}</span>
                            <button
                                onClick={copyLink}
                                title="Salin Link Publik"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                                {copied ? <LuCheck className="w-4 h-4 text-emerald-600" /> : <LuCopy className="w-4 h-4" />}
                            </button>
                        </h1>
                        <p className="text-sm text-slate-600 mt-1">
                            {data.location_note || 'Tidak ada catatan posisi spesifik'}
                        </p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                        <StatusBadge status={data.status} size="lg" />
                        <button
                            onClick={() => setShowQrModal(true)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-700 transition"
                        >
                            <LuQrCode className="w-3.5 h-3.5" />
                            <span>Lihat Kode QR</span>
                        </button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                            Pemeriksaan Terakhir
                        </span>
                        <div className="text-sm sm:text-base font-bold text-slate-800">
                            {formatDate(data.last_inspected_at, true)}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                            Jadwal Berikutnya
                        </span>
                        <div className="text-sm sm:text-base font-bold text-slate-800">
                            {formatDate(data.next_due_date)}
                        </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                            Kedaluwarsa Tabung
                        </span>
                        <div className="text-sm sm:text-base font-bold text-slate-800">
                            {formatDate(data.expiry_date)}
                        </div>
                    </div>
                </div>

                {/* Primary Action Button (Mulai Inspeksi) */}
                <div className="mt-6">
                    <Link
                        to={`/inspeksi/${token}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition shadow-sm shadow-blue-500/25 active:scale-[0.99]"
                    >
                        <LuClipboardCheck className="w-5 h-5" />
                        <span>Mulai Inspeksi Alat Ini</span>
                    </Link>
                </div>
            </div>

            {/* Riwayat Inspeksi (History Timeline) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <LuClock className="w-5 h-5 text-slate-600" />
                        <span>Riwayat Inspeksi Rutin</span>
                    </h2>
                    <span className="text-xs text-slate-600 font-medium">
                        {history?.data?.length || 0} catatan
                    </span>
                </div>

                {!history?.data?.length ? (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                        <p className="text-sm text-slate-600 font-medium">Belum ada riwayat inspeksi tercatat untuk alat ini.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.data.map((item, index) => {
                            const isOk = item.result === 'ok';
                            return (
                                <div
                                    key={index}
                                    className="p-3.5 sm:p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}
                                        >
                                            {isOk ? <LuCircleCheck className="w-5 h-5" /> : <LuTriangleAlert className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{item.officer}</div>
                                            <div className="text-xs text-slate-600">{formatDate(item.inspected_at, true)}</div>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                                            isOk
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}
                                    >
                                        {isOk ? 'OK' : 'Perlu Tindak Lanjut'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal: Tampilkan QR Code */}
            {showQrModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">QR Code Alat</h3>
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="p-1 text-slate-600 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            >
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-center">
                            <QRCodeSVG value={window.location.href} size={200} />
                        </div>
                        <div className="text-xs text-slate-600 font-mono">{data.code}</div>
                        <button
                            onClick={() => setShowQrModal(false)}
                            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
