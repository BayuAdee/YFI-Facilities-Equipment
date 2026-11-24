import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api/client';
import Shell from './components/Layout/Shell';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import PublicAsset from './pages/PublicAsset';
import Inspection from './pages/Inspection';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';

export default function MainApp() {
    const [user, setUser] = useState(null);
    const [initialCheck, setInitialCheck] = useState(true);

    const checkMe = () => {
        api
            .get('/me')
            .then(({ data }) => setUser(data.user))
            .catch(() => setUser(null))
            .finally(() => setInitialCheck(false));
    };

    useEffect(() => {
        checkMe();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            setUser(null);
            window.location.href = '/login';
        } catch {
            setUser(null);
            window.location.href = '/login';
        }
    };

    if (initialCheck) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingSpinner text="Memeriksa sesi pengguna..." />
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Shell user={user} onLogout={handleLogout}>
                <Routes>
                    <Route path="/a/:token" element={<PublicAsset user={user} />} />
                    <Route path="/inspeksi/:token" element={<Inspection user={user} />} />
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/admin" element={<Admin user={user} />} />
                    <Route path="/login" element={<Login onLoginSuccess={(u) => setUser(u)} />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Shell>
        </BrowserRouter>
    );
}
