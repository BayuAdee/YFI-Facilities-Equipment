import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
    LuArrowLeft,
    LuMapPin,
    LuClipboardCheck,
    LuCamera,
    LuCheck,
    LuX,
    LuLoaderCircle,
    LuCircleCheck,
    LuTriangleAlert,
    LuCircleAlert,
} from 'react-icons/lu';

export default function Inspection({ user }) {
    const toast = useToast();
    const { token } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        api
            .get(`/assets/by-token/${token}`)
            .then(({ data }) => {
                setData(data);
                // Pre-fill default answers with "tidak" so officer must actively verify and mark "ya"
                const initial = {};
                (data.checklist || []).forEach((item) => {
                    if (item.input_type === 'yes_no') {
                        initial[item.id] = 'tidak';
                    }
                });
                setAnswers(initial);
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    navigate(`/login?redirect=/inspeksi/${token}`);
                } else {
                    setErrorMessage('Gagal memuat formulir inspeksi. Pastikan akun Anda memiliki izin petugas.');
                }
            })
            .finally(() => setLoading(false));
    }, [token, navigate]);

    // Handle photo selection & generate object URL previews
    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (photos.length + files.length > 5) {
            alert('Maksimal 5 foto per inspeksi.');
            return;
        }
        const updatedFiles = [...photos, ...files].slice(0, 5);
        setPhotos(updatedFiles);

        // Previews
        const previews = updatedFiles.map((file) => URL.createObjectURL(file));
        setPhotoPreviews(previews);
    };

    const removePhoto = (index) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        setPhotos(updatedPhotos);
        const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
        setPhotoPreviews(updatedPreviews);
    };

    // Check if any answer is not OK
    const hasIssues = useMemo(() => {
        if (!data?.checklist) return false;
        return data.checklist.some((item) => {
            const val = answers[item.id];
            if (item.ok_value !== null && val !== undefined) {
                return String(val) !== String(item.ok_value);
            }
            return false;
        });
    }, [data, answers]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (hasIssues && !notes.trim()) {
            toast.warning('Catatan wajib diisi jika terdapat indikator checklist yang tidak sesuai.');
            return;
        }

        setSubmitting(true);
        const payload = new FormData();
        payload.append('asset_id', data.asset.id);
        payload.append('client_uuid', crypto.randomUUID());
        payload.append('notes', notes);

        data.checklist.forEach((item) => {
            payload.append(`answers[${item.id}][checklist_item_id]`, item.id);
            payload.append(`answers[${item.id}][value]`, answers[item.id] ?? '');
        });

        photos.forEach((photo) => {
            payload.append('photos[]', photo);
        });

        try {
            const res = await api.post('/inspections', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(`Inspeksi berhasil disimpan! Status terbaru alat: ${res.data.status}`);
            setTimeout(() => {
                navigate(`/a/${token}`);
            }, 1800);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan hasil inspeksi. Silakan periksa kembali.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <LoadingSpinner text="Menyiapkan checklist inspeksi..." />;
    }

    if (!data?.asset) {
        return (
            <div className="max-w-md mx-auto py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <LuTriangleAlert className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Form Tidak Tersedia</h2>
                <p className="text-sm text-slate-600 mb-4">{errorMessage || 'Silakan masuk terlebih dahulu sebagai petugas.'}</p>
                <Link
                    to={`/login?redirect=/inspeksi/${token}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition"
                >
                    Masuk Sekarang
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            {/* Header info bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <Link
                    to={`/a/${token}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                    <LuArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Info Alat</span>
                </Link>
                <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Inspeksi Lapangan</span>
                </div>
            </div>

            {/* Asset Brief Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center justify-between">
                <div>
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {data.asset.asset_type?.name || 'APAR'}
                    </span>
                    <h1 className="text-xl font-extrabold text-slate-900 mt-1">{data.asset.code}</h1>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                        <LuMapPin className="w-3.5 h-3.5" />
                        <span>{data.asset.area?.name} · {data.asset.location_note || 'Lokasi standar'}</span>
                    </p>
                </div>
                <StatusBadge status={data.asset.status} size="sm" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Checklist Section */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <LuClipboardCheck className="w-5 h-5 text-slate-700" />
                            <span>Checklist Fisik & Kondisi</span>
                        </h2>
                        <p className="text-xs text-slate-600 mt-0.5">
                            Periksa setiap poin dengan teliti sesuai standar K3.
                        </p>
                    </div>

                    <div className="space-y-3 pt-1">
                        {data.checklist.map((item, idx) => {
                            const val = answers[item.id] ?? '';
                            const isYes = val === 'ya';
                            const isNo = val === 'tidak';

                            return (
                                <div
                                    key={item.id}
                                    className={`p-3.5 rounded-xl border transition ${
                                        isNo
                                            ? 'bg-amber-50/70 border-amber-200'
                                            : isYes
                                            ? 'bg-slate-50/60 border-slate-200/80'
                                            : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="text-sm font-semibold text-slate-900 mb-2.5">
                                        <span className="text-slate-600 mr-1.5">{idx + 1}.</span>
                                        {item.label}
                                        {item.required && <span className="text-rose-500 ml-1">*</span>}
                                    </div>

                                    {item.input_type === 'yes_no' ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAnswers({ ...answers, [item.id]: 'ya' })}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                                                    isYes
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                <LuCheck className="w-3.5 h-3.5" />
                                                <span>Sesuai (OK)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAnswers({ ...answers, [item.id]: 'tidak' })}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                                                    isNo
                                                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                <LuTriangleAlert className="w-3.5 h-3.5" />
                                                <span>Tidak Sesuai</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            required={item.required}
                                            value={answers[item.id] ?? ''}
                                            onChange={(e) => setAnswers({ ...answers, [item.id]: e.target.value })}
                                            placeholder="Ketik nilai pengamatan..."
                                            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Evidence Photo Upload Section */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <LuCamera className="w-5 h-5 text-slate-700" />
                                <span>Foto Bukti Inspeksi</span>
                            </h2>
                            <p className="text-xs text-slate-600 mt-0.5">Ambil foto manometer, pin, atau kondisi fisik (maks. 5 foto)</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{photos.length}/5 foto</span>
                    </div>

                    {/* Previews grid */}
                    {photoPreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                            {photoPreviews.map((src, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                    <img src={src} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition"
                                    >
                                        <LuX className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {photos.length < 5 && (
                        <label className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-slate-100/60">
                            <LuCamera className="w-7 h-7 text-slate-600 mb-2" />
                            <span className="text-xs font-bold text-slate-700">Sentuh untuk Ambil / Pilih Foto</span>
                            <span className="text-[11px] text-slate-600 mt-0.5">JPG, PNG, atau WEBP</span>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* Notes Section */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                        <span>Catatan Temuan & Rekomendasi</span>
                        {hasIssues && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Wajib Diisi
                            </span>
                        )}
                    </h2>
                    <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={
                            hasIssues
                                ? 'Jelaskan temuan ketidaksesuaian secara rinci (wajib)...'
                                : 'Tuliskan catatan tambahan kondisi alat (opsional)...'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
                    />
                </div>

                {/* Submit Action */}
                <div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800 text-white font-bold text-base hover:bg-slate-900 transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                        {submitting ? (
                            <>
                                <LuLoaderCircle className="w-5 h-5 animate-spin" />
                                <span>Menyimpan Laporan...</span>
                            </>
                        ) : (
                            <>
                                <LuCircleCheck className="w-5 h-5" />
                                <span>Simpan Hasil Inspeksi</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
