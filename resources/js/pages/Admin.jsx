import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { formatDate } from '../utils/date';
import StatusBadge from '../components/UI/StatusBadge';
import { useToast } from '../context/ToastContext';
import {
    LuPlus,
    LuCircleCheck,
    LuShieldCheck,
    LuLayers,
    LuSearch,
    LuExternalLink,
    LuDownload,
    LuRefreshCw,
    LuMapPin,
    LuX,
    LuUsers,
    LuUserPlus,
    LuPencil,
    LuTrash2,
    LuCheck,
    LuClipboardCheck,
    LuListChecks,
    LuArrowLeft,
    LuChevronRight,
    LuClock,
    LuArchive,
    LuRotateCcw,
} from 'react-icons/lu';

export default function Admin({ user: currentUser }) {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'assets';
    const setTab = (newTab) => {
        if (newTab !== 'checklists') {
            setSelectedChecklistTypeId(null);
        }
        setSearchParams({ tab: newTab });
    };

    const [areas, setAreas] = useState([]);
    const [types, setTypes] = useState([]);
    const [assets, setAssets] = useState([]);
    const [users, setUsers] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [assetSearch, setAssetSearch] = useState('');
    const [assetStatusFilter, setAssetStatusFilter] = useState('active'); // 'active' | 'archived' | 'ALL'
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('ALL');
    const [selectedChecklistTypeId, setSelectedChecklistTypeId] = useState(null);

    // Modals
    const [showAddAssetModal, setShowAddAssetModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingChecklist, setEditingChecklist] = useState(null);

    // Forms
    const [assetForm, setAssetForm] = useState({
        code: '',
        asset_type_id: '',
        area_id: '',
        location_note: '',
        expiry_date: '',
    });
    const [areaForm, setAreaForm] = useState({ name: '' });
    const [typeForm, setTypeForm] = useState({ name: '', inspection_interval_days: 30 });
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'officer',
    });
    const [editUserForm, setEditUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'officer',
        is_active: true,
    });
    const [checklistForm, setChecklistForm] = useState({
        asset_type_id: '',
        label: '',
        input_type: 'yes_no',
        ok_value: 'ya',
        sort_order: 1,
        required: true,
    });
    const [editChecklistForm, setEditChecklistForm] = useState({
        asset_type_id: '',
        label: '',
        input_type: 'yes_no',
        ok_value: 'ya',
        sort_order: 1,
        required: true,
        is_active: true,
    });

    const refreshData = () => {
        setLoading(true);
        Promise.all([
            api.get('/areas').then((res) => setAreas(res.data)),
            api.get('/asset-types').then((res) => setTypes(res.data)),
            api.get('/assets').then((res) => setAssets(res.data.data || [])),
            api.get('/users').then((res) => setUsers(res.data || [])),
            api.get('/checklist-items').then((res) => setChecklists(res.data || [])),
        ])
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refreshData();
    }, []);

    // Create Asset
    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assets', assetForm);
            toast.success('Alat keselamatan baru berhasil didaftarkan!');
            setShowAddAssetModal(false);
            setAssetForm({ code: '', asset_type_id: '', area_id: '', location_note: '', expiry_date: '' });
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menambahkan alat.');
        }
    };

    // Create Area
    const handleAddArea = async (e) => {
        e.preventDefault();
        try {
            await api.post('/areas', areaForm);
            setAreaForm({ name: '' });
            refreshData();
            toast.success('Area baru berhasil ditambahkan!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menambahkan area.');
        }
    };

    // Create Type
    const handleAddType = async (e) => {
        e.preventDefault();
        try {
            await api.post('/asset-types', typeForm);
            setTypeForm({ name: '', inspection_interval_days: 30 });
            refreshData();
            toast.success('Jenis alat baru berhasil ditambahkan!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menambahkan jenis alat.');
        }
    };

    // Create User / Petugas
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', userForm);
            toast.success(`Petugas / Pengguna "${userForm.name}" berhasil didaftarkan!`);
            setShowAddUserModal(false);
            setUserForm({ name: '', email: '', password: '', role: 'officer' });
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menambahkan pengguna.');
        }
    };

    // Open Edit User Modal
    const startEditUser = (u) => {
        setEditingUser(u);
        setEditUserForm({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            is_active: Boolean(u.is_active),
        });
    };

    // Submit Edit User
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            await api.put(`/users/${editingUser.id}`, editUserForm);
            toast.success(`Data pengguna "${editUserForm.name}" berhasil diperbarui!`);
            setEditingUser(null);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui pengguna.');
        }
    };

    // Toggle User Active Status
    const handleToggleStatus = async (targetUser) => {
        if (targetUser.id === currentUser?.id) {
            toast.warning('Anda tidak dapat menonaktifkan akun Anda sendiri.');
            return;
        }
        const newStatus = !targetUser.is_active;
        try {
            await api.put(`/users/${targetUser.id}`, {
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role,
                is_active: newStatus,
            });
            toast.success(`Status akun "${targetUser.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengubah status pengguna.');
        }
    };

    // Delete User
    const handleDeleteUser = async (targetUser) => {
        if (targetUser.id === currentUser?.id) {
            toast.warning('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }
        if (!confirm(`Konfirmasi hapus akun pengguna "${targetUser.name}" (${targetUser.email})?`)) return;
        try {
            await api.delete(`/users/${targetUser.id}`);
            toast.success(`Akun "${targetUser.name}" berhasil dihapus.`);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus pengguna.');
        }
    };

    // Create Checklist Item
    const handleAddChecklist = async (e) => {
        e.preventDefault();
        try {
            await api.post('/checklist-items', checklistForm);
            toast.success('Poin checklist baru berhasil ditambahkan!');
            setShowAddChecklistModal(false);
            const currentTypeId = checklistForm.asset_type_id;
            if (currentTypeId) {
                setSelectedChecklistTypeId(currentTypeId);
            }
            setChecklistForm({
                asset_type_id: currentTypeId || types[0]?.id || '',
                label: '',
                input_type: 'yes_no',
                ok_value: 'ya',
                sort_order: (checklists.length + 1),
                required: true,
            });
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menambahkan poin checklist.');
        }
    };

    // Open Edit Checklist Modal
    const startEditChecklist = (item) => {
        setEditingChecklist(item);
        setEditChecklistForm({
            asset_type_id: item.asset_type_id,
            label: item.label,
            input_type: item.input_type,
            ok_value: item.ok_value || '',
            sort_order: item.sort_order,
            required: Boolean(item.required),
            is_active: Boolean(item.is_active),
        });
    };

    // Submit Edit Checklist
    const handleUpdateChecklist = async (e) => {
        e.preventDefault();
        if (!editingChecklist) return;
        try {
            await api.put(`/checklist-items/${editingChecklist.id}`, editChecklistForm);
            toast.success('Poin checklist berhasil diperbarui!');
            setEditingChecklist(null);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui poin checklist.');
        }
    };

    // Toggle Checklist Status
    const handleToggleChecklistStatus = async (item) => {
        const newStatus = !item.is_active;
        try {
            await api.put(`/checklist-items/${item.id}`, {
                ...item,
                is_active: newStatus,
            });
            toast.success(`Poin checklist "${item.label}" sekarang ${newStatus ? 'Aktif' : 'Nonaktif'}.`);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengubah status checklist.');
        }
    };

    // Delete Checklist Item
    const handleDeleteChecklist = async (item) => {
        if (!confirm(`Konfirmasi hapus poin checklist "${item.label}"?`)) return;
        try {
            await api.delete(`/checklist-items/${item.id}`);
            toast.success(`Poin checklist "${item.label}" berhasil dihapus.`);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus poin checklist.');
        }
    };

    // Reset Token
    const handleResetToken = async (assetId, assetCode) => {
        if (!confirm(`Konfirmasi reset QR Token untuk alat ${assetCode}? QR stiker lama tidak akan lagi berlaku.`)) return;
        try {
            await api.post(`/assets/${assetId}/reset-token`);
            refreshData();
            toast.success(`QR Token untuk ${assetCode} berhasil diperbarui.`);
        } catch (err) {
            toast.error('Gagal mereset token.');
        }
    };

    // Archive / Decommission Asset (Soft Delete)
    const handleDeactivateAsset = async (targetAsset) => {
        if (!confirm(`Konfirmasi nonaktifkan (afkir) alat "${targetAsset.code}" (${targetAsset.asset_type?.name || 'Alat'})?\n\nAlat tidak akan muncul di dashboard dan jadwal patroli, namun seluruh riwayat inspeksi masa lalu tetap tersimpan utuh untuk bukti audit.`)) return;
        try {
            await api.delete(`/assets/${targetAsset.id}`);
            toast.success(`Alat keselamatan "${targetAsset.code}" berhasil dinonaktifkan (diarsipkan).`);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menonaktifkan alat keselamatan.');
        }
    };

    // Restore Asset
    const handleRestoreAsset = async (targetAsset) => {
        if (!confirm(`Aktifkan kembali alat keselamatan "${targetAsset.code}" ke daftar operasional aktif?`)) return;
        try {
            await api.post(`/assets/${targetAsset.id}/restore`);
            toast.success(`Alat keselamatan "${targetAsset.code}" berhasil diaktifkan kembali.`);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengaktifkan kembali alat.');
        }
    };

    // Delete Area
    const handleDeleteArea = async (targetArea) => {
        const areaAssetsCount = assets.filter((asset) => asset.area_id === targetArea.id).length;
        if (areaAssetsCount > 0) {
            toast.warning(`Area "${targetArea.name}" tidak dapat dihapus karena masih digunakan oleh ${areaAssetsCount} alat keselamatan.`);
            return;
        }
        if (!confirm(`Konfirmasi hapus area penempatan "${targetArea.name}"?`)) return;
        try {
            await api.delete(`/areas/${targetArea.id}`);
            toast.success(`Area "${targetArea.name}" berhasil dihapus.`);
            refreshData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus area.');
        }
    };

    const filteredAssets = assets.filter((item) => {
        const matchesActive =
            assetStatusFilter === 'ALL'
                ? true
                : assetStatusFilter === 'active'
                ? item.is_active
                : !item.is_active;

        if (!matchesActive) return false;

        if (!assetSearch) return true;
        return (
            item.code?.toLowerCase().includes(assetSearch.toLowerCase()) ||
            item.area?.name?.toLowerCase().includes(assetSearch.toLowerCase()) ||
            item.location_note?.toLowerCase().includes(assetSearch.toLowerCase())
        );
    });

    const filteredUsers = users.filter((u) => {
        const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter || (userRoleFilter === 'inactive' && !u.is_active);
        const matchesSearch =
            !userSearch ||
            u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(userSearch.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const selectedAssetType = types.find((t) => String(t.id) === String(selectedChecklistTypeId));

    const filteredChecklists = checklists.filter((item) => {
        if (!selectedChecklistTypeId) return true;
        return String(item.asset_type_id) === String(selectedChecklistTypeId);
    });

    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Administrasi Sistem</h1>
                    <p className="text-xs sm:text-sm text-slate-600">
                        Kelola checklist, akun petugas, inventaris alat keselamatan, dan master area
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {activeTab === 'users' && (
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition shadow-xs"
                        >
                            <LuUserPlus className="w-4 h-4" />
                            <span>Tambah Petugas</span>
                        </button>
                    )}
                    {activeTab === 'checklists' && selectedAssetType && (
                        <button
                            onClick={() => {
                                setChecklistForm({
                                    asset_type_id: selectedAssetType.id,
                                    label: '',
                                    input_type: 'yes_no',
                                    ok_value: 'ya',
                                    sort_order: filteredChecklists.length + 1,
                                    required: true,
                                });
                                setShowAddChecklistModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition shadow-xs"
                        >
                            <LuPlus className="w-4 h-4" />
                            <span>Tambah Poin Checklist</span>
                        </button>
                    )}
                    {activeTab === 'assets' && (
                        <button
                            onClick={() => setShowAddAssetModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition shadow-xs"
                        >
                            <LuPlus className="w-4 h-4" />
                            <span>Tambah Alat Baru</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
                {/* 1. Daftar Alat */}
                <button
                    onClick={() => setTab('assets')}
                    className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'assets'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <LuShieldCheck className="w-4 h-4" />
                    <span>Daftar Alat ({assets.length})</span>
                </button>

                {/* 2. Area & Jenis Alat */}
                <button
                    onClick={() => setTab('masters')}
                    className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'masters'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <LuLayers className="w-4 h-4" />
                    <span>Area & Jenis Alat</span>
                </button>

                {/* 3. Poin Checklist */}
                <button
                    onClick={() => setTab('checklists')}
                    className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'checklists'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <LuClipboardCheck className="w-4 h-4" />
                    <span>Poin Checklist ({checklists.length})</span>
                </button>

                {/* 4. Manajemen Petugas */}
                <button
                    onClick={() => setTab('users')}
                    className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'users'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <LuUsers className="w-4 h-4" />
                    <span>Manajemen Petugas ({users.length})</span>
                </button>
            </div>

            {/* TAB 1: ASSETS LIST */}
            {activeTab === 'assets' && (
                <div className="space-y-4">
                    {/* Search bar & Active Filter Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <LuSearch className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={assetSearch}
                                onChange={(e) => setAssetSearch(e.target.value)}
                                placeholder="Cari berdasarkan kode alat, area, atau catatan..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { key: 'active', label: 'Alat Aktif', count: assets.filter((a) => a.is_active).length },
                                { key: 'archived', label: 'Diarsipkan / Afkir', count: assets.filter((a) => !a.is_active).length },
                                { key: 'ALL', label: 'Semua', count: assets.length },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setAssetStatusFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                                        assetStatusFilter === f.key
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <span>{f.label}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                                            assetStatusFilter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        {f.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Table / Mobile Cards */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        {filteredAssets.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm text-slate-600">Tidak ada data alat ditemukan.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredAssets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition ${
                                            !asset.is_active ? 'bg-slate-50/40 opacity-75' : ''
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/a/${asset.qr_token}`}
                                                    className="font-extrabold text-base text-slate-900 hover:text-blue-600 transition flex items-center gap-1"
                                                >
                                                    <span>{asset.code}</span>
                                                    <LuExternalLink className="w-3.5 h-3.5 text-slate-600" />
                                                </Link>
                                                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                    {asset.asset_type?.name || 'APAR'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <span>Area: <strong>{asset.area?.name}</strong></span>
                                                <span>Lokasi: {asset.location_note || '-'}</span>
                                                <span>Jadwal: {formatDate(asset.next_due_date)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-2 pt-2.5 md:pt-0 border-t border-slate-100 md:border-t-0">
                                            {asset.is_active ? (
                                                <>
                                                    <StatusBadge status={asset.status} size="sm" />
                                                    <div className="flex items-center gap-1.5 ml-auto">
                                                        <a
                                                            href={`/api/assets/${asset.id}/label`}
                                                            download
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                                                        >
                                                            <LuDownload className="w-3.5 h-3.5" />
                                                            <span>Unduh QR</span>
                                                        </a>
                                                        <button
                                                            onClick={() => handleResetToken(asset.id, asset.code)}
                                                            title="Reset QR Token"
                                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                        >
                                                            <LuRefreshCw className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeactivateAsset(asset)}
                                                            title="Nonaktifkan/Arsipkan"
                                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                                                        >
                                                            <LuArchive className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border bg-slate-100 text-slate-600 border-slate-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        <span>Diarsipkan / Afkir</span>
                                                    </span>
                                                    <button
                                                        onClick={() => handleRestoreAsset(asset)}
                                                        title="Aktifkan kembali alat keselamatan"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition cursor-pointer ml-auto"
                                                    >
                                                        <LuRotateCcw className="w-3.5 h-3.5" />
                                                        <span>Aktifkan Kembali</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: MANAJEMEN POIN CHECKLIST (PILIH JENIS ALAT -> DAFTAR CHECKLIST -> CRUD) */}
            {activeTab === 'checklists' && (
                <div className="space-y-5">
                    {!selectedAssetType ? (
                        /* STEP 1: CARD GRID PILIH JENIS ALAT */
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                        <LuLayers className="w-5 h-5 text-blue-600" />
                                        <span>Pilih Jenis Alat Keselamatan</span>
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                                        Klik jenis alat di bawah ini untuk melihat dan mengelola daftar poin checklist pemeriksaan fisiknya.
                                    </p>
                                </div>
                                <span className="text-xs font-bold px-3 py-1.5 bg-white text-blue-700 rounded-xl border border-blue-200 shrink-0 self-start sm:self-auto shadow-xs">
                                    {types.length} Jenis Alat Terdaftar
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {types.map((type) => {
                                    const typeItems = checklists.filter((c) => String(c.asset_type_id) === String(type.id));
                                    const activeCount = typeItems.filter((c) => c.is_active).length;
                                    const assetCount = assets.filter((a) => String(a.asset_type_id) === String(type.id)).length;

                                    return (
                                        <div
                                            key={type.id}
                                            onClick={() => setSelectedChecklistTypeId(type.id)}
                                            className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer p-5 flex flex-col justify-between space-y-4"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition">
                                                        <LuShieldCheck className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                        ID #{type.id}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                                                        <span>{type.name}</span>
                                                        <LuChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                                                    </h3>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                        <LuClock className="w-3.5 h-3.5" />
                                                        <span>Inspeksi berkala tiap <strong>{type.inspection_interval_days} hari</strong></span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                                <div className="space-y-0.5">
                                                    <span className="font-bold text-slate-900 block">
                                                        {typeItems.length} Poin Pertanyaan
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                        {activeCount} aktif · {assetCount} unit terpasang
                                                    </span>
                                                </div>

                                                <span className="text-xs font-bold text-blue-600 group-hover:underline">
                                                    Kelola →
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* STEP 2 & 3: LIHAT DAFTAR CHECKLIST & CRUD CHECKLIST UNTUK ALAT TERPILIH */
                        <div className="space-y-4">
                            {/* Breadcrumb & Navigation Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedChecklistTypeId(null)}
                                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer"
                                        title="Kembali ke pilihan jenis alat"
                                    >
                                        <LuArrowLeft className="w-4 h-4" />
                                        <span>Kembali</span>
                                    </button>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                                                Checklist {selectedAssetType.name}
                                            </h2>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                {filteredChecklists.length} Pertanyaan
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Daftar poin pengecekan yang harus diperiksa petugas saat inspeksi {selectedAssetType.name}.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setChecklistForm({
                                            asset_type_id: selectedAssetType.id,
                                            label: '',
                                            input_type: 'yes_no',
                                            ok_value: 'ya',
                                            sort_order: filteredChecklists.length + 1,
                                            required: true,
                                        });
                                        setShowAddChecklistModal(true);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition shadow-xs shrink-0 cursor-pointer"
                                >
                                    <LuPlus className="w-4 h-4" />
                                    <span>Tambah Poin Checklist</span>
                                </button>
                            </div>

                            {/* Checklist Items Table / List */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                                {filteredChecklists.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <LuListChecks className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-slate-800">
                                            Belum ada pertanyaan checklist untuk {selectedAssetType.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                            Tambahkan poin pengecekan fisik (seperti tekanan, kondisi selang, segel, dsb.) untuk jenis alat ini.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setChecklistForm({
                                                    asset_type_id: selectedAssetType.id,
                                                    label: '',
                                                    input_type: 'yes_no',
                                                    ok_value: 'ya',
                                                    sort_order: 1,
                                                    required: true,
                                                });
                                                setShowAddChecklistModal(true);
                                            }}
                                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                                        >
                                            <LuPlus className="w-4 h-4" />
                                            <span>Tambah Poin Pertama</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {filteredChecklists.map((item, idx) => {
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                            {item.sort_order || idx + 1}
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                                                                    {item.label}
                                                                </span>
                                                                {item.required && (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                                                        Wajib Diisi
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                                <span>Tipe Input: <strong>{item.input_type === 'yes_no' ? 'Ya / Tidak' : item.input_type}</strong></span>
                                                                <span>·</span>
                                                                <span>Kondisi Normal (OK): <strong className="text-emerald-700">{item.ok_value || 'ya'}</strong></span>
                                                                <span>·</span>
                                                                <span>Urutan: #{item.sort_order}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                                                        {/* Active Toggle Button */}
                                                        <button
                                                            onClick={() => handleToggleChecklistStatus(item)}
                                                            title="Klik untuk mengaktifkan / menonaktifkan poin pertanyaan"
                                                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border transition cursor-pointer ${
                                                                item.is_active
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                            <span>{item.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                                        </button>

                                                        {/* Edit Button */}
                                                        <button
                                                            onClick={() => startEditChecklist(item)}
                                                            title="Ubah pertanyaan checklist"
                                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                        >
                                                            <LuPencil className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => handleDeleteChecklist(item)}
                                                            title="Hapus pertanyaan checklist"
                                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                        >
                                                            <LuTrash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: MANAJEMEN PETUGAS / USER (CRUD) */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                        <div className="relative flex-1">
                            <LuSearch className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Cari nama atau email petugas..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { key: 'ALL', label: 'Semua Akun' },
                                { key: 'officer', label: 'Petugas' },
                                { key: 'admin', label: 'Admin' },
                                { key: 'inactive', label: 'Nonaktif' },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setUserRoleFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                                        userRoleFilter === f.key
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <LuUsers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-800">Tidak ada petugas ditemukan</p>
                                <p className="text-xs text-slate-600 mt-0.5">Ubah kata kunci pencarian atau daftarkan petugas baru.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredUsers.map((u) => {
                                    const isSelf = u.id === currentUser?.id;
                                    const isAdmin = u.role === 'admin';
                                    return (
                                        <div
                                            key={u.id}
                                            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                                        isAdmin
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}
                                                >
                                                    {u.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>

                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                                                            {u.name}
                                                        </span>
                                                        {isSelf && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                                                Anda
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                        <span>{u.email}</span>
                                                        {u.created_at && (
                                                            <>
                                                                <span>·</span>
                                                                <span>Dibuat: {formatDate(u.created_at)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                                                {/* Role Pill */}
                                                <span
                                                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                                                        isAdmin
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}
                                                >
                                                    {isAdmin ? 'Administrator' : 'Petugas Lapangan'}
                                                </span>

                                                {/* Active Status Pill */}
                                                <button
                                                    onClick={() => handleToggleStatus(u)}
                                                    title={isSelf ? 'Tidak dapat mengubah status sendiri' : 'Klik untuk mengubah status aktif/nonaktif'}
                                                    disabled={isSelf}
                                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border transition ${
                                                        u.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                    } ${isSelf ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    <span>{u.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => startEditUser(u)}
                                                    title="Ubah data atau reset password"
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                                                >
                                                    <LuPencil className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Delete Button */}
                                                {!isSelf && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u)}
                                                        title="Hapus akun pengguna"
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    >
                                                        <LuTrash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: MASTER AREA & JENIS ALAT */}
            {activeTab === 'masters' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Area Management */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <LuMapPin className="w-4 h-4 text-blue-600" />
                            <span>Master Area Penempatan</span>
                        </h2>

                        <form onSubmit={handleAddArea} className="flex gap-2">
                            <input
                                type="text"
                                required
                                value={areaForm.name}
                                onChange={(e) => setAreaForm({ name: e.target.value })}
                                placeholder="Nama Area baru (misal: Gedung B Lantai 2)..."
                                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition shrink-0"
                            >
                                Simpan
                            </button>
                        </form>

                        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                            {areas.map((a) => {
                                const areaAssetsCount = assets.filter((asset) => asset.area_id === a.id).length;
                                return (
                                    <div key={a.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                                        <div className="space-y-0.5">
                                            <span className="font-semibold text-slate-800">{a.name}</span>
                                            <span className="text-[11px] text-slate-500 block">
                                                ID #{a.id} · {areaAssetsCount} alat terpasang
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteArea(a)}
                                            title="Hapus area penempatan"
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                        >
                                            <LuTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Asset Types Management */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <LuShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Master Jenis Alat Keselamatan</span>
                        </h2>

                        <form onSubmit={handleAddType} className="space-y-2">
                            <input
                                type="text"
                                required
                                value={typeForm.name}
                                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                placeholder="Nama jenis (misal: Hydrant Box, Kotak P3K)..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={typeForm.inspection_interval_days}
                                    onChange={(e) => setTypeForm({ ...typeForm, inspection_interval_days: parseInt(e.target.value) || 30 })}
                                    placeholder="Interval cek (hari)"
                                    className="w-40 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition"
                                >
                                    Tambah Jenis
                                </button>
                            </div>
                        </form>

                        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                            {types.map((t) => (
                                <div key={t.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                                    <div>
                                        <span className="font-semibold text-slate-800">{t.name}</span>
                                        <span className="text-[11px] text-slate-600 block">Inspeksi tiap {t.inspection_interval_days} hari</span>
                                    </div>
                                    <span className="text-[11px] text-slate-600">ID #{t.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 1: TAMBAH ALAT BARU */}
            {showAddAssetModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-base">Registrasi Alat Keselamatan Baru</h3>
                            <button
                                onClick={() => setShowAddAssetModal(false)}
                                className="p-1 text-slate-600 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            >
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAsset} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Unik Alat *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: APAR-A1-002"
                                    value={assetForm.code}
                                    onChange={(e) => setAssetForm({ ...assetForm, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Alat *</label>
                                    <select
                                        required
                                        value={assetForm.asset_type_id}
                                        onChange={(e) => setAssetForm({ ...assetForm, asset_type_id: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Pilih Jenis</option>
                                        {types.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Area Penempatan *</label>
                                    <select
                                        required
                                        value={assetForm.area_id}
                                        onChange={(e) => setAssetForm({ ...assetForm, area_id: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Pilih Area</option>
                                        {areas.map((a) => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Lokasi Spesifik</label>
                                <input
                                    type="text"
                                    placeholder="Misal: Dekat tangga darurat barat / samping panel listrik"
                                    value={assetForm.location_note}
                                    onChange={(e) => setAssetForm({ ...assetForm, location_note: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kedaluwarsa / Isi Ulang</label>
                                <input
                                    type="date"
                                    value={assetForm.expiry_date}
                                    onChange={(e) => setAssetForm({ ...assetForm, expiry_date: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddAssetModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
                                >
                                    Daftarkan Alat
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: TAMBAH POIN CHECKLIST BARU */}
            {showAddChecklistModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <LuClipboardCheck className="w-5 h-5 text-blue-600" />
                                    <span>Tambah Poin Checklist</span>
                                </h3>
                                <p className="text-xs text-slate-600 mt-0.5">Pertanyaan pemeriksaan terikat dengan jenis alat</p>
                            </div>
                            <button
                                onClick={() => setShowAddChecklistModal(false)}
                                className="p-1 text-slate-600 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            >
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddChecklist} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Berlaku untuk Jenis Alat *</label>
                                <select
                                    required
                                    value={checklistForm.asset_type_id}
                                    onChange={(e) => setChecklistForm({ ...checklistForm, asset_type_id: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="">Pilih Jenis Alat</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Label / Pertanyaan Pemeriksaan *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Selang tidak retak / tersumbat"
                                    value={checklistForm.label}
                                    onChange={(e) => setChecklistForm({ ...checklistForm, label: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Input *</label>
                                    <select
                                        required
                                        value={checklistForm.input_type}
                                        onChange={(e) => setChecklistForm({ ...checklistForm, input_type: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    >
                                        <option value="yes_no">Pilihan Ya / Tidak</option>
                                        <option value="number">Angka (Nilai Ukur)</option>
                                        <option value="text">Teks Bebas</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Standar (OK)</label>
                                    <input
                                        type="text"
                                        placeholder="ya"
                                        value={checklistForm.ok_value}
                                        onChange={(e) => setChecklistForm({ ...checklistForm, ok_value: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 items-center pt-1">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Urut Tampil</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={checklistForm.sort_order}
                                        onChange={(e) => setChecklistForm({ ...checklistForm, sort_order: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div className="pt-5">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={checklistForm.required}
                                            onChange={(e) => setChecklistForm({ ...checklistForm, required: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span>Wajib Diisi Petugas</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddChecklistModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
                                >
                                    Tambahkan Poin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: EDIT POIN CHECKLIST */}
            {editingChecklist && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <LuPencil className="w-5 h-5 text-blue-600" />
                                    <span>Ubah Poin Checklist</span>
                                </h3>
                                <p className="text-xs text-slate-600 mt-0.5">Edit pertanyaan atau ubah standar kondisi OK</p>
                            </div>
                            <button
                                onClick={() => setEditingChecklist(null)}
                                className="p-1 text-slate-600 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            >
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateChecklist} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Berlaku untuk Jenis Alat *</label>
                                <select
                                    required
                                    value={editChecklistForm.asset_type_id}
                                    onChange={(e) => setEditChecklistForm({ ...editChecklistForm, asset_type_id: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Label / Pertanyaan Pemeriksaan *</label>
                                <input
                                    type="text"
                                    required
                                    value={editChecklistForm.label}
                                    onChange={(e) => setEditChecklistForm({ ...editChecklistForm, label: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Input *</label>
                                    <select
                                        required
                                        value={editChecklistForm.input_type}
                                        onChange={(e) => setEditChecklistForm({ ...editChecklistForm, input_type: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    >
                                        <option value="yes_no">Pilihan Ya / Tidak</option>
                                        <option value="number">Angka (Nilai Ukur)</option>
                                        <option value="text">Teks Bebas</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Standar (OK)</label>
                                    <input
                                        type="text"
                                        value={editChecklistForm.ok_value}
                                        onChange={(e) => setEditChecklistForm({ ...editChecklistForm, ok_value: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 items-center pt-1">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Urut Tampil</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editChecklistForm.sort_order}
                                        onChange={(e) => setEditChecklistForm({ ...editChecklistForm, sort_order: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Poin</label>
                                    <select
                                        value={editChecklistForm.is_active ? '1' : '0'}
                                        onChange={(e) => setEditChecklistForm({ ...editChecklistForm, is_active: e.target.value === '1' })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    >
                                        <option value="1">Aktif</option>
                                        <option value="0">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={editChecklistForm.required}
                                        onChange={(e) => setEditChecklistForm({ ...editChecklistForm, required: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span>Wajib Diisi Petugas</span>
                                </label>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingChecklist(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: TAMBAH PETUGAS / PENGGUNA BARU */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <LuUserPlus className="w-5 h-5 text-blue-600" />
                                    <span>Tambah Petugas / Pengguna Baru</span>
                                </h3>
                                <p className="text-xs text-slate-600 mt-0.5">Daftarkan personel yang memiliki akses ke sistem FEMS</p>
                            </div>
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                className="p-1 text-slate-600 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            >
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Budi Santoso"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email Login *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="budi@perusahaan.com"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Role Akun *</label>
                                <select
                                    required
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="officer">Petugas Lapangan</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password) *</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    placeholder="Minimal 8 karakter"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
                                >
                                    Daftarkan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: EDIT PETUGAS / USER */}
            {editingUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <LuPencil className="w-5 h-5 text-blue-600" />
                                    <span>Ubah Data Pengguna</span>
                                </h3>
                                <p className="text-xs text-slate-600 mt-0.5">Edit detail akun, role, atau ganti kata sandi</p>
                            </div>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="p-1 text-slate-600 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            >
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    value={editUserForm.name}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={editUserForm.email}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Role *</label>
                                    <select
                                        required
                                        value={editUserForm.role}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    >
                                        <option value="officer">Petugas Lapangan</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
                                    <select
                                        value={editUserForm.is_active ? '1' : '0'}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, is_active: e.target.value === '1' })}
                                        disabled={editingUser.id === currentUser?.id}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white disabled:opacity-60"
                                    >
                                        <option value="1">Aktif</option>
                                        <option value="0">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-1">
                                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                                    <span>Ganti Kata Sandi (Opsional)</span>
                                    <span className="text-[11px] font-normal text-slate-600">Kosongkan jika tidak diubah</span>
                                </label>
                                <input
                                    type="password"
                                    minLength={8}
                                    placeholder="Ketik password baru (min 8 karakter)..."
                                    value={editUserForm.password}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
