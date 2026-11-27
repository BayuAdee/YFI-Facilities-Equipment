import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LuCircleCheck, LuCircleAlert, LuTriangleAlert, LuInfo, LuX } from 'react-icons/lu';

const ToastContext = createContext(null);

let globalToastInstance = null;

export const toast = {
    success: (message, duration = 3500) => globalToastInstance?.success(message, duration),
    error: (message, duration = 4000) => globalToastInstance?.error(message, duration),
    warning: (message, duration = 4000) => globalToastInstance?.warning(message, duration),
    info: (message, duration = 3500) => globalToastInstance?.info(message, duration),
};

export function ToastProvider({ children, hasSidebar = false }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'success', duration = 3500) => {
        if (!message) return null;
        const id = Date.now() + Math.random().toString(36).substring(2, 6);
        const newToast = { id, message, type };

        setToasts((prev) => {
            // Keep at most 3 toasts to avoid clutter
            const trimmed = prev.length >= 3 ? prev.slice(1) : prev;
            return [...trimmed, newToast];
        });

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        return id;
    }, [removeToast]);

    const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
    const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
    const warning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast]);
    const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);

    useEffect(() => {
        globalToastInstance = { success, error, warning, info };
        return () => {
            globalToastInstance = null;
        };
    }, [success, error, warning, info]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
            {children}

            {/* Floating Toast Popup Container:
                - Mobile: Top screen (inset-x-4 top-4)
                - Desktop: Kanan atas (md:top-5 md:right-6 md:left-auto)
                - Floating (fixed z-50), does NOT push or shift any layout elements!
            */}
            <div
                className="fixed top-4 inset-x-4 md:inset-x-auto md:top-5 md:right-6 md:left-auto z-50 pointer-events-none flex flex-col gap-2.5 max-w-sm sm:max-w-md items-center md:items-end"
                aria-live="polite"
            >
                {toasts.map((t) => {
                    const isError = t.type === 'error';
                    const isWarning = t.type === 'warning';
                    const isSuccess = t.type === 'success';

                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border bg-white shadow-md text-slate-800 transition-opacity duration-200 ${
                                isError
                                    ? 'border-slate-200 border-l-4 border-l-rose-600'
                                    : isWarning
                                    ? 'border-slate-200 border-l-4 border-l-amber-500'
                                    : 'border-slate-200 border-l-4 border-l-emerald-600'
                            }`}
                        >
                            <div className="shrink-0 mt-0.5">
                                {isError && <LuCircleAlert className="w-5 h-5 text-rose-600" />}
                                {isWarning && <LuTriangleAlert className="w-5 h-5 text-amber-500" />}
                                {isSuccess && <LuCircleCheck className="w-5 h-5 text-emerald-600" />}
                                {t.type === 'info' && <LuInfo className="w-5 h-5 text-slate-700" />}
                            </div>

                            <div className="flex-1 text-sm text-slate-700 leading-snug">
                                {t.message}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeToast(t.id)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition cursor-pointer shrink-0"
                                title="Tutup"
                            >
                                <LuX className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        return toast;
    }
    return ctx;
}
