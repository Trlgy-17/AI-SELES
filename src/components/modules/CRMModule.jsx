// File: src/components/modules/CRMModule.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../Icons.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { ConfirmModal } from '../common/ConfirmModal.jsx';
import { EditLeadModal } from '../modals/EditLeadModal.jsx';
import { ExportService } from '../../js/services/export.js';
import { normalizePhone, formatDisplayPhone, buildWaLink } from '../../js/utils/phone.js';
import { generateId } from '../../js/utils/id.js';
import { getAsiaJakartaIso } from '../../js/utils/date.js';
import { addTombstone } from '../../js/services/migration.js';
import { LEAD_STATUS_OPTIONS } from '../../js/constants.js';

export const CRMModule = ({ 
    crmLeads = [], 
    setCrmLeads, 
    followUpTasks = [], 
    setFollowUpTasks, 
    userId, 
    showToast,
    activeBrand,
    currentUser,
    onConsultLeadInAI
}) => {
    const currentBrandId = activeBrand?.id || 'brand_nacira';
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    const [showAllBrands, setShowAllBrands] = useState(false);
    const [crmSearch, setCrmSearch] = useState('');
    const [crmStatusFilter, setCrmStatusFilter] = useState('Semua');
    const [crmSortOption, setCrmSortOption] = useState('terbaru');

    const [newLeadName, setNewLeadName] = useState('');
    const [newLeadPhone, setNewLeadPhone] = useState('');
    const [newLeadProject, setNewLeadProject] = useState('');
    const [newLeadLocation, setNewLeadLocation] = useState('');
    const [newLeadValue, setNewLeadValue] = useState('');
    const [newLeadStatus, setNewLeadStatus] = useState('Prospek / Survey');

    const [crmError, setCrmError] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isAddingLead, setIsAddingLead] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeletingLead, setIsDeletingLead] = useState(false);
    const [editingLead, setEditingLead] = useState(null);

    // Filter Leads Berdasarkan Brand Sesi Aktif (Multi-Tenant Isolation)
    const brandScopedLeads = useMemo(() => {
        return crmLeads.filter(l => {
            const leadBrand = l.brandId || 'brand_nacira'; // Data warisan otomatis dianggap milik Nacira Studio
            if (isSuperAdmin && showAllBrands) return true;
            return leadBrand === currentBrandId;
        });
    }, [crmLeads, isSuperAdmin, showAllBrands, currentBrandId]);

    useEffect(() => {
        const norm = normalizePhone(newLeadPhone);
        if (norm && norm.length >= 8) {
            const match = brandScopedLeads.find(l => l.phoneNormalized === norm);
            if (match) {
                setDuplicateWarning(`Perhatian: Nomor WhatsApp ini sudah terdaftar di brand ${activeBrand?.brandName || 'ini'} atas nama "${match.name}".`);
            } else {
                setDuplicateWarning(null);
            }
        } else {
            setDuplicateWarning(null);
        }
    }, [newLeadPhone, brandScopedLeads, activeBrand]);

    const handleAddLead = async () => {
        const trimmedName = newLeadName.trim().slice(0, 100);
        if (!trimmedName) {
            setCrmError("Mohon masukkan nama klien.");
            return;
        }

        let cleanVal = null;
        if (newLeadValue.trim() !== '') {
            const num = Number(newLeadValue);
            if (isNaN(num) || !isFinite(num) || num < 0) {
                setCrmError("Nilai proyek tidak boleh negatif atau berupa karakter tidak valid.");
                return;
            }
            cleanVal = num;
        }

        setCrmError(null);
        setIsAddingLead(true);

        const phoneRaw = newLeadPhone.trim().slice(0, 30);
        const phoneNormalized = normalizePhone(phoneRaw);
        const docId = generateId('lead');

        const leadData = {
            id: docId,
            schemaVersion: 2,
            brandId: currentBrandId, // Wajib terikat ke brand aktif
            name: trimmedName,
            phoneRaw: phoneRaw,
            phoneNormalized: phoneNormalized,
            project: newLeadProject.trim().slice(0, 200),
            location: newLeadLocation.trim().slice(0, 150),
            dimensions: '',
            notes: '',
            value: cleanVal,
            status: newLeadStatus,
            createdAt: getAsiaJakartaIso(),
            updatedAt: getAsiaJakartaIso(),
            isLegacyFallbackCandidate: false,
            syncStatus: 'synced'
        };

        setCrmLeads(prev => [leadData, ...prev]);

        if (window.firebaseServices?.db && userId) {
            try {
                const { db, appId, doc, setDoc } = window.firebaseServices;
                await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'crmLeads', docId), leadData);
                showToast(`Prospek ${trimmedName} berhasil ditambahkan ke ${activeBrand?.brandName}!`);
            } catch (e) {
                console.warn("[CRM] Cloud save failed:", e);
                showToast("Tersimpan di perangkat lokal. (Sinkronisasi cloud tertunda)", "warning");
            }
        } else {
            showToast(`Prospek berhasil ditambahkan ke ${activeBrand?.brandName}!`);
        }

        setNewLeadName('');
        setNewLeadPhone('');
        setNewLeadProject('');
        setNewLeadLocation('');
        setNewLeadValue('');
        setNewLeadStatus('Prospek / Survey');
        setIsAddingLead(false);
    };

    const handleUpdateLead = async (updatedLead) => {
        setCrmLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));

        if (window.firebaseServices?.db && userId) {
            try {
                const { db, appId, doc, setDoc } = window.firebaseServices;
                await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'crmLeads', updatedLead.id), updatedLead);
                showToast("Data klien berhasil diperbarui!");
            } catch (e) {
                console.warn("[CRM] Cloud update failed:", e);
                showToast("Diperbarui lokal. (Cloud sync tertunda: " + e.message + ")", "warning");
            }
        } else {
            showToast("Data klien & memori berhasil diperbarui.");
        }
        setEditingLead(null);
    };

    const confirmDeleteLead = async () => {
        if (!deleteTargetId) return;
        const leadId = deleteTargetId;
        setIsDeletingLead(true);

        if (setFollowUpTasks) {
            setFollowUpTasks(prev => prev.map(t => {
                if (t.leadId === leadId) {
                    return { ...t, leadId: null, isDetachedFromDeletedLead: true, updatedAt: getAsiaJakartaIso() };
                }
                return t;
            }));
        }

        addTombstone('leads', leadId, userId);
        setCrmLeads(prev => prev.filter(l => l.id !== String(leadId)));

        if (window.firebaseServices?.db && userId) {
            try {
                const { db, appId, doc, deleteDoc } = window.firebaseServices;
                await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'crmLeads', String(leadId)));
                showToast("Data klien dihapus. Tugas terkait dipertahankan.");
            } catch (e) {
                console.warn("[CRM] Cloud delete failed:", e);
                showToast("Dihapus lokal.", "warning");
            }
        } else {
            showToast("Data klien dihapus.");
        }

        setIsDeletingLead(false);
        setDeleteTargetId(null);
    };

    const filteredLeads = useMemo(() => {
        return brandScopedLeads.filter(l => {
            const searchLower = crmSearch.toLowerCase();
            const matchesSearch = 
                (l.name || '').toLowerCase().includes(searchLower) || 
                (l.project || '').toLowerCase().includes(searchLower) ||
                (l.location || '').toLowerCase().includes(searchLower) ||
                (l.status || '').toLowerCase().includes(searchLower) ||
                (l.phoneRaw || '').toLowerCase().includes(searchLower) ||
                (l.phoneNormalized || '').toLowerCase().includes(searchLower);

            const matchesStatus = crmStatusFilter === 'Semua' || l.status === crmStatusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => {
            if (crmSortOption === 'terbaru') return (b.createdAt || '').localeCompare(a.createdAt || '');
            if (crmSortOption === 'terlama') return (a.createdAt || '').localeCompare(b.createdAt || '');
            if (crmSortOption === 'nilai_tinggi') return (b.value || 0) - (a.value || 0);
            if (crmSortOption === 'nilai_rendah') return (a.value || 0) - (b.value || 0);
            if (crmSortOption === 'nama_az') return (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' });
            return 0;
        });
    }, [brandScopedLeads, crmSearch, crmStatusFilter, crmSortOption]);

    const totalLeadsCount = brandScopedLeads.length;
    const activeLeads = useMemo(() => brandScopedLeads.filter(l => l.status === 'Prospek / Survey' || l.status === 'Design Review'), [brandScopedLeads]);
    const activePipelineValue = useMemo(() => activeLeads.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0), [activeLeads]);
    const closingLeads = useMemo(() => brandScopedLeads.filter(l => l.status === 'Closing / DP Masuk'), [brandScopedLeads]);
    const closingRevenueValue = useMemo(() => closingLeads.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0), [closingLeads]);
    const closingCount = closingLeads.length;

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header Brand Bar & Super Admin Scope Control */}
            <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-[#26262d] flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#202028] text-[#c5a059] flex items-center justify-center font-bold text-lg border border-[#33333d]">
                        <Icons.Users />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="serif-font text-xl font-extrabold text-white">
                                CRM Leads Pipeline
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                                {activeBrand?.brandName || 'Nacira'}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Data prospek terisolasi untuk brand ini · Memori lokasi & preferensi material terintegrasi.
                        </p>
                    </div>
                </div>

                {isSuperAdmin && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAllBrands(!showAllBrands)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                showAllBrands 
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                                    : 'bg-[#1b1b22] text-zinc-400 border-[#2e2e38] hover:text-white'
                            }`}
                        >
                            👑 {showAllBrands ? 'Menampilkan Semua Brand' : 'Filter Brand Aktif Saja'}
                        </button>
                    </div>
                )}
            </div>

            {/* Metrik Finansial Eksplisit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-[#26262d] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#202028] text-[#c5a059] flex items-center justify-center font-bold text-lg">
                        <Icons.Users />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Prospek ({activeBrand?.brandName})</p>
                        <h3 className="serif-font text-2xl font-extrabold text-white mt-0.5">{totalLeadsCount} Klien</h3>
                    </div>
                </div>
                <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-[#26262d] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#202028] text-blue-400 flex items-center justify-center font-bold text-lg">
                        <Icons.Sparkles />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active Pipeline ({activeLeads.length})</p>
                        <h3 className="serif-font text-xl font-extrabold text-white mt-0.5">Rp {activePipelineValue.toLocaleString('id-ID')}</h3>
                    </div>
                </div>
                <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-[#26262d] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#202028] text-emerald-400 flex items-center justify-center font-bold text-lg">
                        <Icons.CheckCircle />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Closing Revenue ({closingCount})</p>
                        <h3 className="serif-font text-xl font-extrabold text-emerald-400 mt-0.5">Rp {closingRevenueValue.toLocaleString('id-ID')}</h3>
                    </div>
                </div>
            </div>

            {/* Form Tambah Prospek Baru */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-[#26262d]">
                <h3 className="serif-font font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <Icons.Plus /> Tambah Prospek Klien Baru ({activeBrand?.brandName})
                </h3>

                {crmError && (
                    <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold" role="alert">
                        ⚠️ {crmError}
                    </div>
                )}

                {duplicateWarning && (
                    <div className="mb-4 p-3 bg-amber-950/80 border border-amber-800 text-amber-200 rounded-xl text-xs font-semibold" role="alert">
                        ⚠️ {duplicateWarning}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <input 
                        type="text" 
                        placeholder="Nama Klien..." 
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-base sm:text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <input 
                        type="text" 
                        placeholder="WhatsApp (08... / +62...)" 
                        value={newLeadPhone}
                        onChange={(e) => setNewLeadPhone(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-base sm:text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <input 
                        type="text" 
                        placeholder="Proyek (Kitchen/Wardrobe)" 
                        value={newLeadProject}
                        onChange={(e) => setNewLeadProject(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-base sm:text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <input 
                        type="text" 
                        placeholder="Lokasi (e.g. Bandung Kota)" 
                        value={newLeadLocation}
                        onChange={(e) => setNewLeadLocation(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-base sm:text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <input 
                        type="number" 
                        placeholder="Estimasi Nilai (Rp)" 
                        value={newLeadValue}
                        onChange={(e) => setNewLeadValue(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-base sm:text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <button 
                        onClick={handleAddLead}
                        disabled={isAddingLead}
                        className="gold-btn rounded-xl py-3 px-4 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#c5a059]/20 min-h-[44px] touch-manipulation active:scale-95"
                    >
                        {isAddingLead ? 'Menyimpan...' : <React.Fragment><Icons.Plus /> Simpan Prospek</React.Fragment>}
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-[#15151a] p-3.5 sm:p-4 rounded-3xl border border-[#26262d]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <input 
                            type="text" 
                            placeholder="Cari nama, proyek, lokasi..." 
                            value={crmSearch}
                            onChange={(e) => setCrmSearch(e.target.value)}
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-2xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a059] min-h-[44px]"
                        />
                        <div className="absolute left-3.5 top-3.5 text-zinc-500 pointer-events-none">
                            <Icons.Search />
                        </div>
                    </div>

                    <select
                        value={crmStatusFilter}
                        onChange={(e) => setCrmStatusFilter(e.target.value)}
                        className="bg-[#1b1b22] border border-[#26262d] rounded-2xl px-3 py-2.5 text-base sm:text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] min-h-[44px]"
                    >
                        <option value="Semua">Semua Status</option>
                        {LEAD_STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                    <select
                        value={crmSortOption}
                        onChange={(e) => setCrmSortOption(e.target.value)}
                        className="flex-1 sm:flex-initial bg-[#1b1b22] border border-[#26262d] rounded-2xl px-3 py-2.5 text-base sm:text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] min-h-[44px]"
                    >
                        <option value="terbaru">Terbaru Masuk</option>
                        <option value="terlama">Terlama Masuk</option>
                        <option value="nilai_tinggi">Nilai Tertinggi</option>
                        <option value="nilai_rendah">Nilai Terendah</option>
                        <option value="nama_az">Nama A - Z</option>
                    </select>

                    <button
                        onClick={() => ExportService.exportLeadsToCsv(filteredLeads)}
                        className="px-4 py-2.5 bg-[#202028] hover:bg-[#282834] text-zinc-300 rounded-2xl border border-[#33333d] text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px] touch-manipulation active:scale-95"
                        title="Ekspor daftar klien ke file CSV"
                    >
                        <Icons.FileSpreadsheet /> <span>Ekspor CSV</span>
                    </button>
                </div>
            </div>

            {/* TABEL DATA PROSPEK (DESKTOP md:block) & CARD LIST (MOBILE md:hidden) */}
            <div className="bg-[#15151a] rounded-3xl border border-[#26262d] overflow-hidden shadow-2xl">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                        <thead className="bg-[#1b1b22] text-zinc-400 uppercase tracking-wider font-bold border-b border-[#26262d]">
                            <tr>
                                <th className="p-4">Klien & Memori</th>
                                <th className="p-4">WhatsApp</th>
                                <th className="p-4">Proyek & Lokasi</th>
                                <th className="p-4">Estimasi Nilai</th>
                                <th className="p-4">Status Pipeline</th>
                                {isSuperAdmin && showAllBrands && <th className="p-4">Brand</th>}
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#202028]">
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-[#1a1a24] transition-colors group">
                                        <td className="p-4 font-bold text-white">
                                            <div className="flex items-center gap-2">
                                                <span>{lead.name}</span>
                                                {lead.location && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-[#202028] text-[#c5a059] rounded border border-[#2e2e38]" title={`Lokasi terkonfirmasi: ${lead.location}`}>
                                                        📍
                                                    </span>
                                                )}
                                                {lead.dimensions && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-[#202028] text-purple-400 rounded border border-[#2e2e38]" title={`Dimensi: ${lead.dimensions}`}>
                                                        📐
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {lead.phoneRaw ? (
                                                <a 
                                                    href={buildWaLink(lead.phoneNormalized || lead.phoneRaw)} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-emerald-400 hover:underline font-medium flex items-center gap-1"
                                                >
                                                    <Icons.MessageSquare />
                                                    {formatDisplayPhone(lead.phoneRaw)}
                                                </a>
                                            ) : (
                                                <span className="text-zinc-600">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-zinc-200">{lead.project || 'Interior Custom'}</div>
                                            {lead.location && <div className="text-[11px] text-zinc-500 mt-0.5">📍 {lead.location}</div>}
                                        </td>
                                        <td className="p-4 font-bold text-white">
                                            {lead.value ? `Rp ${Number(lead.value).toLocaleString('id-ID')}` : '-'}
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        {isSuperAdmin && showAllBrands && (
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#202028] text-[#c5a059] border border-[#2e2e38]">
                                                    {lead.brandId ? lead.brandId.replace('brand_', '') : 'nacira'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {onConsultLeadInAI && (
                                                    <button
                                                        onClick={() => onConsultLeadInAI(lead)}
                                                        className="px-2.5 py-1.5 rounded-xl bg-[#202028] hover:bg-[#c5a059] hover:text-[#0d0d0d] text-[#c5a059] font-bold text-[11px] border border-[#33333d] transition-all flex items-center gap-1 min-h-[36px]"
                                                        title="Konsultasikan chat klien ini dengan AI Copilot"
                                                    >
                                                        <Icons.Brain /> Copilot
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setEditingLead(lead)}
                                                    className="p-2 rounded-xl hover:bg-[#202028] text-zinc-400 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                    title="Edit Klien & Memori"
                                                >
                                                    <Icons.Edit />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTargetId(lead.id)}
                                                    className="p-2 rounded-xl hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                    title="Hapus Klien"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isSuperAdmin && showAllBrands ? 7 : 6} className="p-8 text-center text-zinc-500">
                                        Tidak ada data prospek ditemukan untuk brand ini. Tambahkan prospek baru di atas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile / Tablet Card List (< md) */}
                <div className="md:hidden divide-y divide-[#202028]">
                    {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => (
                            <div key={lead.id} className="p-4 space-y-3 hover:bg-[#1a1a24] transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-bold text-white text-base flex items-center gap-1.5 flex-wrap">
                                            <span>{lead.name}</span>
                                            {lead.location && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-[#202028] text-[#c5a059] rounded border border-[#2e2e38]" title={`Lokasi: ${lead.location}`}>
                                                    📍 {lead.location}
                                                </span>
                                            )}
                                            {lead.dimensions && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-[#202028] text-purple-400 rounded border border-[#2e2e38]" title={`Dimensi: ${lead.dimensions}`}>
                                                    📐 {lead.dimensions}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-400 mt-1 font-medium">
                                            {lead.project || 'Interior Custom'}
                                        </div>
                                    </div>
                                    <StatusBadge status={lead.status} />
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#202028]/60">
                                    <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Estimasi Nilai</span>
                                    <span className="font-extrabold text-white">
                                        {lead.value ? `Rp ${Number(lead.value).toLocaleString('id-ID')}` : '-'}
                                    </span>
                                </div>

                                {lead.phoneRaw && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">WhatsApp</span>
                                        <a 
                                            href={buildWaLink(lead.phoneNormalized || lead.phoneRaw)} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-emerald-400 hover:underline font-semibold flex items-center gap-1 py-1"
                                        >
                                            <Icons.MessageSquare />
                                            {formatDisplayPhone(lead.phoneRaw)}
                                        </a>
                                    </div>
                                )}

                                {isSuperAdmin && showAllBrands && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Brand</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#202028] text-[#c5a059] border border-[#2e2e38]">
                                            {lead.brandId ? lead.brandId.replace('brand_', '') : 'nacira'}
                                        </span>
                                    </div>
                                )}

                                {/* Action Toolbar Mobile */}
                                <div className="flex items-center gap-2 pt-2 border-t border-[#202028]">
                                    {onConsultLeadInAI && (
                                        <button
                                            onClick={() => onConsultLeadInAI(lead)}
                                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#202028] hover:bg-[#c5a059] hover:text-[#0d0d0d] text-[#c5a059] font-bold text-xs border border-[#33333d] transition-all flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation active:scale-95"
                                        >
                                            <Icons.Brain /> <span>Sales Ary</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setEditingLead(lead)}
                                        className="py-2.5 px-4 rounded-xl bg-[#202028] hover:bg-[#282834] text-zinc-300 font-bold text-xs border border-[#33333d] transition-colors flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation active:scale-95"
                                        title="Edit Data"
                                    >
                                        <Icons.Edit /> <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => setDeleteTargetId(lead.id)}
                                        className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-300 font-bold text-xs border border-rose-800/40 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation active:scale-95"
                                        title="Hapus Prospek"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-zinc-500 text-xs">
                            Tidak ada data prospek ditemukan untuk brand ini. Tambahkan prospek baru di atas.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Edit Lead */}
            <EditLeadModal 
                isOpen={Boolean(editingLead)}
                lead={editingLead}
                allLeads={crmLeads}
                onSave={handleUpdateLead}
                onCancel={() => setEditingLead(null)}
            />

            {/* Modal Konfirmasi Hapus */}
            <ConfirmModal 
                isOpen={Boolean(deleteTargetId)}
                title="Hapus Data Prospek Klien?"
                message="Tindakan ini akan menghapus data klien dari pipeline. Tugas follow-up yang terhubung akan tetap disimpan sebagai tugas mandiri."
                confirmText="Hapus Prospek"
                isDestructive={true}
                isLoading={isDeletingLead}
                onConfirm={confirmDeleteLead}
                onCancel={() => setDeleteTargetId(null)}
            />
        </div>
    );
};
