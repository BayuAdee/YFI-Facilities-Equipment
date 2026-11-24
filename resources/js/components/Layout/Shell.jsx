import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import BottomNav from './BottomNav';
import QrScannerModal from '../UI/QrScannerModal';

export default function Shell({ children, user, onLogout }) {
    const location = useLocation();
    const [scannerOpen, setScannerOpen] = useState(false);
    const isLoginPage = location.pathname === '/login';

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-900">
            {/* Desktop Sidebar (navbar samping jika posisi desktop) */}
            <Sidebar
                user={user}
                onLogout={onLogout}
                onOpenScanner={() => setScannerOpen(true)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
                {/* Mobile Top Header (hanya muncul di mobile) */}
                <MobileHeader
                    user={user}
                    onLogout={onLogout}
                />

                {/* Content Container */}
                <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex-1">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav
                user={user}
                onLogout={onLogout}
                onOpenScanner={() => setScannerOpen(true)}
            />

            <QrScannerModal
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                user={user}
            />
        </div>
    );
}
