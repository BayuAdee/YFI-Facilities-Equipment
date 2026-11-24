import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
    LuScanQrCode,
    LuX,
    LuCamera,
    LuCircleAlert,
    LuLoaderCircle,
    LuSearch,
    LuArrowRight,
} from 'react-icons/lu';

export default function QrScannerModal({ isOpen, onClose, user }) {
    const navigate = useNavigate();
    const [scannerError, setScannerError] = useState('');
    const [isStarting, setIsStarting] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const html5QrCodeRef = useRef(null);

    // Parse scanned text to extract token
    const handleScanSuccess = (decodedText) => {
        let token = decodedText.trim();
        if (token.includes('/a/')) {
            token = token.split('/a/')[1].split('?')[0].split('#')[0];
        } else if (token.includes('/inspeksi/')) {
            token = token.split('/inspeksi/')[1].split('?')[0].split('#')[0];
        }

        // Haptic feedback if supported on mobile
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate(60);
            } catch {
                // Ignore if not permitted
            }
        }

        stopScanner();
        onClose();

        // If user is a Petugas (officer), directly navigate to the inspection form!
        if (user?.role === 'officer') {
            navigate(`/inspeksi/${token}`);
        } else {
            navigate(`/a/${token}`);
        }
    };

    const stopScanner = () => {
        if (html5QrCodeRef.current) {
            try {
                if (html5QrCodeRef.current.isScanning) {
                    html5QrCodeRef.current.stop().catch(() => {});
                }
                html5QrCodeRef.current.clear();
            } catch {
                // Ignore cleanup errors
            }
            html5QrCodeRef.current = null;
        }
    };

    useEffect(() => {
        if (!isOpen) {
            stopScanner();
            return;
        }

        setScannerError('');
        setIsStarting(true);

        const timer = setTimeout(() => {
            const element = document.getElementById('qr-reader-container');
            if (!element) return;

            const qrCode = new Html5Qrcode('qr-reader-container');
            html5QrCodeRef.current = qrCode;

            const config = {
                fps: 15,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            };

            qrCode
                .start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        handleScanSuccess(decodedText);
                    },
                    () => {
                        // Scan failure callback on each frame - silent
                    }
                )
                .then(() => {
                    setIsStarting(false);
                })
                .catch((err) => {
                    setIsStarting(false);
                    const msg = String(err);
                    if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
                        setScannerError(
                            'Izin akses kamera ditolak. Silakan berikan izin kamera pada pengaturan browser Anda.'
                        );
                    } else if (msg.includes('NotFoundError')) {
                        setScannerError('Kamera tidak ditemukan pada perangkat Anda.');
                    } else {
                        setScannerError(
                            'Tidak dapat membuka kamera. Pastikan browser memiliki izin atau masukkan kode alat secara manual di bawah.'
                        );
                    }
                });
        }, 150);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [isOpen]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        const code = manualCode.trim();
        if (!code) return;
        stopScanner();
        onClose();

        if (user?.role === 'officer') {
            navigate(`/inspeksi/${code}`);
        } else {
            navigate(`/a/${code}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <LuScanQrCode className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                                Scan QR Alat
                            </h3>
                            <p className="text-[11px] text-slate-600">Arahkan kamera ke stiker QR APAR</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Camera Viewfinder View */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200">
                    {/* Camera Feed Target */}
                    <div id="qr-reader-container" className="w-full h-full object-cover" />

                    {/* Loading State */}
                    {isStarting && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white p-4 text-center z-10">
                            <LuLoaderCircle className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                            <p className="text-xs font-semibold">Mengaktifkan kamera...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {scannerError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white p-5 text-center z-10 space-y-2">
                            <LuCircleAlert className="w-8 h-8 text-rose-500 mb-1" />
                            <p className="text-xs text-rose-200 leading-relaxed">{scannerError}</p>
                            <p className="text-[11px] text-slate-400">
                                Anda dapat memasukkan kode token secara manual di bawah.
                            </p>
                        </div>
                    )}
                </div>

                {/* Manual Input Fallback */}
                <form onSubmit={handleManualSubmit} className="space-y-2 pt-1 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Atau Masukkan Kode / Token Manual
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ketik token atau URL..."
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1 shrink-0"
                        >
                            <span>Buka</span>
                            <LuArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
