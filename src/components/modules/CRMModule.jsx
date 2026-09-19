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

export const CRMModule = ({ crmLeads = [], setCrmLeads, followUpTasks = [], setFollowUpTasks, userId, showToast }) => {
    const [crmSearch, setCrmSearch] = useState('');
    const [crmStatusFilter, setCrmStatusFilter] = useState('Semua');
    const [crmSortOption, setCrmSortOption] = useState('terbaru');

    const [newLeadName, setNewLeadName] = useState('');
    const [newLeadPhone, setNewLeadPhone] = useState('');
    const [newLeadProject, setNewLeadProject] = useState('');
    const [newLeadValue, setNewLeadValue] = useState('');
    const [newLeadStatus, setNewLeadStatus] = useState('Prospek / Survey');

    const [crmError, setCrmError] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isAddingLead, setIsAddingLead] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeletingLead, setIsDeletingLead] = useState(false);
    const [editingLead, setEditingLead] = useState(null);

    useEffect(() => {
        const norm = normalizePhone(newLeadPhone);
        if (norm && norm.length >= 8) {
            const match = crmLeads.find(l => l.phoneNormalized === norm);
            if (match) {
                setDuplicateWarning(`Perhatian: Nomor WhatsApp ini sudah terdaftar atas nama klien "${match.name}".`);
            } else {
                setDuplicateWarning(null);
            }
        } else {
            setDuplicateWarning(null);
        }
    }, [newLeadPhone, crmLeads]);

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
            name: trimmedName,
            phoneRaw: phoneRaw,
            phoneNormalized: phoneNormalized,
            project: newLeadProject.trim().slice(0, 200),
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
                showToast("Prospek berhasil ditambahkan & disinkronkan ke Cloud!");
            } catch (e) {
                console.warn("[CRM] Cloud save failed:", e);
                showToast("Tersimpan di perangkat lokal. (Sinkronisasi cloud tertunda)", "warning");
            }
        } else {
            showToast("Prospek berhasil ditambahkan ke database lokal!");
        }

        setNewLeadName('');
        setNewLeadPhone('');
        setNewLeadProject('');
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
                showToast("Data klien berhasil diperbarui di cloud!");
            } catch (e) {
                console.warn("[CRM] Cloud update failed:", e);
                showToast("Diperbarui lokal. (Cloud sync tertunda: " + e.message + ")", "warning");
            }
        } else {
            showToast("Data klien berhasil diperbarui.");
        }
        setEditingLead(null);
    };

    const confirmDeleteLead = async () => {
        if (!deleteTargetId) return;
        const leadId = deleteTargetId;
        setIsDeletingLead(true);

        // Putuskan tautan tugas follow-up yang terhubung (TIDAK menghapus tugas secara sepihak!)
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
                showToast("Dihapus lokal. (Cloud delete tertunda: " + e.message + ")", "warning");
            }
        } else {
            showToast("Data klien dihapus. Tugas follow-up terkait dilepas (standalone).");
        }

        setIsDeletingLead(false);
        setDeleteTargetId(null);
    };

    const filteredLeads = useMemo(() => {
        return crmLeads.filter(l => {
            const searchLower = crmSearch.toLowerCase();
            const matchesSearch = 
                (l.name || '').toLowerCase().includes(searchLower) || 
                (l.project || '').toLowerCase().includes(searchLower) ||
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
    }, [crmLeads, crmSearch, crmStatusFilter, crmSortOption]);

    const totalLeadsCount = crmLeads.length;
    // Active Pipeline: Hanya status Prospek / Survey & Design Review
    const activeLeads = useMemo(() => crmLeads.filter(l => l.status === 'Prospek / Survey' || l.status === 'Design Review'), [crmLeads]);
    const activePipelineValue = useMemo(() => activeLeads.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0), [activeLeads]);
    // Closing Revenue: Hanya status Closing / DP Masuk
    const closingLeads = useMemo(() => crmLeads.filter(l => l.status === 'Closing / DP Masuk'), [crmLeads]);
    const closingRevenueValue = useMemo(() => closingLeads.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0), [closingLeads]);
    const closingCount = closingLeads.length;

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Metrik Finansial Eksplisit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-[#26262d] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#202028] text-[#c5a059] flex items-center justify-center font-bold text-lg">
                        <Icons.Users />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Prospek</p>
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
                    <Icons.Plus /> Tambah Prospek Klien Baru
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    <input 
                        type="text" 
                        placeholder="Nama Klien..." 
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <input 
                        type="text" 
                        placeholder="No WA (08... / +62... / +65...)" 
                        value={newLeadPhone}
                        onChange={(e) => setNewLeadPhone(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <input 
                        type="text" 
                        placeholder="Proyek (mis. Kitchen Set Minimalis)" 
                        value={newLeadProject}
                        onChange={(e) => setNewLeadProject(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <input 
                        type="number" 
                        placeholder="Estimasi Nilai Rp (opsional)" 
                        value={newLeadValue}
                        onChange={(e) => setNewLeadValue(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white shadow-inner placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />
                    <select 
                        value={newLeadStatus}
                        onChange={(e) => setNewLeadStatus(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    >
                        {LEAD_STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleAddLead}
                        disabled={isAddingLead}
                        className="gold-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#c5a059]/20"
                    >
                        {isAddingLead ? 'Menyimpan...' : <React.Fragment><Icons.Plus /> Simpan Prospek</React.Fragment>}
                    </button>
                </div>
            </div>

            {/* Filter, Pencarian & Ekspor */}
            <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-[#26262d] space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 flex-wrap">
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                            <Icons.Search />
                        </span>
                        <input 
                            type="text"
                            placeholder="Cari nama, proyek, atau nomor WhatsApp..."
                            value={crmSearch}
                            onChange={(e) => setCrmSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#15151a] border border-[#26262d] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 text-white placeholder:text-zinc-600"
                        />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <select 
                            value={crmStatusFilter}
                            onChange={(e) => setCrmStatusFilter(e.target.value)}
                            className="bg-[#15151a] border border-[#26262d] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        >
                            <option value="Semua">Semua Status</option>
                            {LEAD_STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>

                        <select 
                            value={crmSortOption}
                            onChange={(e) => setCrmSortOption(e.target.value)}
                            className="bg-[#15151a] border border-[#26262d] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        >
                            <option value="terbaru">Terbaru</option>
                            <option value="terlama">Terlama</option>
                            <option value="nilai_tinggi">Nilai: Tertinggi</option>
                            <option value="nilai_rendah">Nilai: Terendah</option>
                            <option value="nama_az">Nama A-Z</option>
                        </select>

                        <button 
                            onClick={() => {
                                const res = ExportService.exportToCsv(crmLeads);
                                if (res.success) {
                                    showToast("Data prospek berhasil diekspor ke CSV!");
                                } else {
                                    showToast("Tidak ada data prospek untuk diekspor.", "warning");
                                }
                            }}
                            className="px-4 py-2 bg-[#202028] hover:bg-[#282832] text-xs font-bold text-zinc-300 rounded-xl border border-[#2e2e38] flex items-center gap-2 transition-colors"
                        >
                            <Icons.FileSpreadsheet /> Ekspor CSV
                        </button>
                    </div>
                </div>

                {/* Tabel Data Prospek */}
                <div className="overflow-x-auto rounded-2xl border border-[#26262d]">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-[#26262d] bg-[#121216] text-xs font-bold uppercase tracking-wider text-zinc-400">
                                <th className="py-4 px-6">Nama Klien & WA</th>
                                <th className="py-4 px-6">Proyek Interior</th>
                                <th className="py-4 px-6">Estimasi Nilai</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6">Tgl Masuk</th>
                                <th className="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#202028]">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-zinc-500 font-medium">
                                        {crmLeads.length === 0 ? 'Belum ada data prospek klien.' : 'Tidak ada prospek yang sesuai filter pencarian.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const displayPhone = formatDisplayPhone(lead.phoneRaw, lead.phoneNormalized);
                                    const waLink = buildWaLink(lead.phoneNormalized, lead.name);

                                    return (
                                        <tr key={lead.id} className="hover:bg-[#18181e]/60 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-white">{lead.name}</div>
                                                <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                                                    <span>{displayPhone}</span>
                                                    {waLink && (
                                                        <a 
                                                            href={waLink} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="text-emerald-400 hover:underline font-bold text-[11px]"
                                                        >
                                                            (Chat WA)
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-zinc-300 font-medium">
                                                {lead.project || <span className="italic text-zinc-600">Belum diisi</span>}
                                            </td>
                                            <td className="py-4 px-6 font-semibold">
                                                {lead.value !== null && lead.value !== undefined ? (
                                                    <span className="text-emerald-400">Rp {lead.value.toLocaleString('id-ID')}</span>
                                                ) : (
                                                    <span className="italic text-zinc-600 text-xs">Belum diestimasi</span>
                                                )}
                                                {lead.isLegacyFallbackCandidate && (
                                                    <span className="block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 w-max">
                                                        ⚠️ Perlu Verifikasi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <StatusBadge status={lead.status} />
                                            </td>
                                            <td className="py-4 px-6 text-zinc-500 text-xs font-medium">
                                                {lead.createdAt ? lead.createdAt.slice(0, 10) : <span className="italic text-zinc-600">Tidak tercatat</span>}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => setEditingLead(lead)}
                                                        className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-[#202028] transition-colors"
                                                        aria-label={`Edit prospek klien ${lead.name}`}
                                                    >
                                                        <Icons.Edit />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteTargetId(lead.id)}
                                                        className="text-zinc-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-950/40 transition-colors"
                                                        aria-label={`Hapus prospek klien ${lead.name}`}
                                                    >
                                                        <Icons.Trash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditLeadModal 
                isOpen={!!editingLead}
                lead={editingLead}
                allLeads={crmLeads}
                onSave={handleUpdateLead}
                onCancel={() => setEditingLead(null)}
            />

            <ConfirmModal 
                isOpen={!!deleteTargetId}
                title="Hapus Data Prospek"
                message={(() => {
                    const linkedCount = followUpTasks ? followUpTasks.filter(t => t.leadId === deleteTargetId).length : 0;
                    return `Hapus data klien ini? ${linkedCount > 0 ? `${linkedCount} tugas follow-up akan dilepas (tidak dihapus) dan tetap bisa diakses di Follow-Up Flow.` : 'Data tidak dapat dikembalikan setelah dihapus.'}`;
                })()}
                onConfirm={confirmDeleteLead}
                onCancel={() => setDeleteTargetId(null)}
                isLoading={isDeletingLead}
            />
        </div>
    );
};
