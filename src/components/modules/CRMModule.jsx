// File: src/components/modules/CRMModule.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Plus, UsersRound, TrendingUp, Ruler, Handshake, Download, Table2, SquareKanban, EllipsisVertical, Pencil,
    MessageSquareText, Trash2, MessageCircle, UserPlus, CircleAlert, TriangleAlert
} from 'lucide-react';
import { StatusBadge, STATUS_TONES, getStatusTone } from '../common/StatusBadge.jsx';
import { FormField } from '../common/FormField.jsx';
import { Button, IconButton } from '../ui/Button.jsx';
import { Input, Select, SearchInput, Switch } from '../ui/Input.jsx';
import { Panel, PageHeader, MetricCard, EmptyState, SegmentedControl, Badge } from '../ui/Surface.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Menu } from '../ui/Menu.jsx';
import { cn } from '../../js/utils/cn.js';
import { ConfirmModal } from '../common/ConfirmModal.jsx';
import { EditLeadModal } from '../modals/EditLeadModal.jsx';
import { ExportService } from '../../js/services/export.js';
import { normalizePhone, formatDisplayPhone, buildWaLink } from '../../js/utils/phone.js';
import { LeadsApi, LOST_REASON_OPTIONS } from '../../js/services/api.js';
import { LEAD_STATUS_OPTIONS } from '../../js/constants.js';

export const CRMModule = ({
    crmLeads = [],
    setCrmLeads,
    isLoading = false,
    can = () => false,
    showToast,
    activeBrand,
    currentUser,
    onConsultLeadInAI,
    autoOpenAddLead = false,
    onAutoOpenAddLeadHandled
}) => {
    const isSuperAdmin = can('brand.switch');
    const canDelete = can('client.delete');

    const [showAllBrands, setShowAllBrands] = useState(false);
    const [allBrandLeads, setAllBrandLeads] = useState([]);
    const [crmSearch, setCrmSearch] = useState('');
    const [crmStatusFilter, setCrmStatusFilter] = useState('Semua');
    const [crmSortOption, setCrmSortOption] = useState('terbaru');

    const [newLeadName, setNewLeadName] = useState('');
    const [newLeadPhone, setNewLeadPhone] = useState('');
    const [newLeadProject, setNewLeadProject] = useState('');
    const [newLeadLocation, setNewLeadLocation] = useState('');
    const [newLeadValue, setNewLeadValue] = useState('');
    const [newLeadStatus, setNewLeadStatus] = useState('Prospek / Survey');
    const [newLeadLostReason, setNewLeadLostReason] = useState('');

    const [crmError, setCrmError] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [confirmDuplicate, setConfirmDuplicate] = useState(false);
    const [isAddingLead, setIsAddingLead] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeletingLead, setIsDeletingLead] = useState(false);
    const [editingLead, setEditingLead] = useState(null);

    // Cross-brand view is an explicit server query (scope=all), only for users with brand.switch.
    useEffect(() => {
        if (!showAllBrands) return;
        LeadsApi.list({ scope: 'all' })
            .then((res) => setAllBrandLeads(res.data))
            .catch((err) => {
                showToast(err.message, 'error');
                setShowAllBrands(false);
            });
    }, [showAllBrands, crmLeads, showToast]);

    const brandScopedLeads = showAllBrands ? allBrandLeads : crmLeads;

    // Instant hint while typing; the server's 409 response remains the authoritative duplicate check.
    useEffect(() => {
        setConfirmDuplicate(false);
        const norm = normalizePhone(newLeadPhone);
        if (norm && norm.length >= 8) {
            const match = crmLeads.find(l => l.phoneNormalized === norm);
            setDuplicateWarning(match ? `Perhatian: Nomor WhatsApp ini sudah terdaftar di brand ${activeBrand?.brandName || 'ini'} atas nama "${match.name}".` : null);
        } else {
            setDuplicateWarning(null);
        }
    }, [newLeadPhone, crmLeads, activeBrand]);

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
            cleanVal = Math.round(num);
        }
        if (newLeadStatus === 'Batal' && !newLeadLostReason) {
            setCrmError("Pilih alasan lead batal.");
            return;
        }

        setCrmError(null);
        setIsAddingLead(true);
        try {
            const res = await LeadsApi.create({
                name: trimmedName,
                phone: newLeadPhone.trim().slice(0, 30) || undefined,
                project: newLeadProject.trim().slice(0, 200),
                location: newLeadLocation.trim().slice(0, 150),
                value: cleanVal,
                status: newLeadStatus,
                lostReason: newLeadStatus === 'Batal' ? newLeadLostReason : undefined,
                confirmDuplicate: confirmDuplicate || undefined
            });
            setCrmLeads(prev => [res.data, ...prev]);
            showToast(`Prospek ${trimmedName} berhasil ditambahkan ke ${activeBrand?.brandName}.`);
            setNewLeadName('');
            setNewLeadPhone('');
            setNewLeadProject('');
            setNewLeadLocation('');
            setNewLeadValue('');
            setNewLeadStatus('Prospek / Survey');
            setNewLeadLostReason('');
            setConfirmDuplicate(false);
        } catch (err) {
            if (err.code === 'POTENTIAL_DUPLICATE') {
                const first = err.details?.potentialDuplicates?.[0];
                setDuplicateWarning(`Kemungkinan duplikat dengan "${first?.name}" (${first?.reason === 'phone' ? 'nomor sama' : first?.reason === 'email' ? 'email sama' : 'nama & lokasi mirip'}). Tekan Simpan lagi untuk tetap menyimpan.`);
                setConfirmDuplicate(true);
            } else {
                setCrmError(err.message);
            }
        } finally {
            setIsAddingLead(false);
        }
    };

    const handleUpdateLead = async (updatedLead) => {
        try {
            const payload = {
                project: updatedLead.project,
                location: updatedLead.isSourceLocked ? undefined : updatedLead.location,
                dimensions: updatedLead.dimensions,
                notes: updatedLead.notes,
                value: updatedLead.value,
                status: updatedLead.status,
                lostReason: updatedLead.status === 'Batal' ? updatedLead.lostReason : undefined
            };
            if (!updatedLead.isSourceLocked) {
                payload.name = updatedLead.name;
                payload.phone = updatedLead.phoneRaw;
            }
            const res = await LeadsApi.update(updatedLead.id, payload);
            setCrmLeads(prev => prev.map(l => l.id === res.data.id ? res.data : l));
            showToast("Data klien berhasil diperbarui.");
            setEditingLead(null);
        } catch (err) {
            showToast(err.message, 'error');
            throw err;
        }
    };

    const confirmDeleteLead = async () => {
        if (!deleteTargetId) return;
        setIsDeletingLead(true);
        try {
            await LeadsApi.archive(deleteTargetId);
            setCrmLeads(prev => prev.filter(l => l.id !== deleteTargetId));
            showToast("Lead diarsipkan. Riwayat tetap tersimpan di audit log.");
            setDeleteTargetId(null);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsDeletingLead(false);
        }
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

    const surveyCount = useMemo(() => brandScopedLeads.filter(l => l.status === 'Prospek / Survey').length, [brandScopedLeads]);
    const showBrandColumn = isSuperAdmin && showAllBrands;
    const formatRp = (v) => (v ? `Rp ${Number(v).toLocaleString('id-ID')}` : '—');
    const formatDate = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const [showAddLead, setShowAddLead] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const pendingAddCountRef = useRef(null);

    // Close the add-lead sheet once the new lead lands in the list (validation failures never add one).
    useEffect(() => {
        if (pendingAddCountRef.current !== null && brandScopedLeads.length > pendingAddCountRef.current) {
            pendingAddCountRef.current = null;
            setShowAddLead(false);
        }
    }, [brandScopedLeads.length]);

    useEffect(() => {
        if (autoOpenAddLead) {
            setShowAddLead(true);
            onAutoOpenAddLeadHandled?.();
        }
    }, [autoOpenAddLead, onAutoOpenAddLeadHandled]);

    const leadMenuItems = (lead) => [
        { id: 'edit', label: 'Edit lead', icon: Pencil, onSelect: () => setEditingLead(lead) },
        ...(onConsultLeadInAI ? [{ id: 'ai', label: 'Konsultasi di Sales AI', icon: MessageSquareText, onSelect: () => onConsultLeadInAI(lead) }] : []),
        ...(canDelete && !lead.isSourceLocked ? [{ type: 'separator' }, { id: 'delete', label: 'Arsipkan lead', icon: Trash2, danger: true, onSelect: () => setDeleteTargetId(lead.id) }] : [])
    ];

    const renderWaLink = (lead, compact = false) =>
        lead.phoneRaw ? (
            <a
                href={buildWaLink(lead.phoneNormalized || lead.phoneRaw)}
                target="_blank"
                rel="noreferrer"
                title={`Chat WhatsApp ${formatDisplayPhone(lead.phoneRaw)}`}
                aria-label={`Chat WhatsApp ${lead.name}`}
                className={cn(
                    'inline-flex items-center justify-center gap-1.5 rounded-sm text-emerald-400 transition-colors hover:bg-success/10',
                    compact ? 'h-11 w-11 sm:h-9 sm:w-9' : 'h-11 flex-1 border border-border px-3 text-body-sm font-medium'
                )}
            >
                <MessageCircle size={16} aria-hidden="true" />
                {!compact && 'WhatsApp'}
            </a>
        ) : null;

    const emptyState = (
        <EmptyState
            icon={UsersRound}
            title={brandScopedLeads.length === 0 ? 'Belum ada lead' : 'Tidak ada lead yang cocok'}
            description={
                brandScopedLeads.length === 0
                    ? 'Tambahkan prospek pertama untuk mulai membangun pipeline.'
                    : 'Ubah kata kunci pencarian atau filter status.'
            }
            action={
                brandScopedLeads.length === 0 ? (
                    <Button variant="primary" icon={Plus} onClick={() => setShowAddLead(true)}>
                        Tambah lead
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => { setCrmSearch(''); setCrmStatusFilter('Semua'); }}>
                        Reset filter
                    </Button>
                )
            }
        />
    );

    return (
        <div className="space-y-5 pb-8 animate-fade-in">
            <PageHeader
                title="CRM Leads"
                description={`Kelola peluang penjualan untuk ${activeBrand?.brandName ? activeBrand.brandName.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : 'brand aktif'}.`}
                actions={
                    <>
                        {isSuperAdmin && (
                            <Switch
                                id="crm-all-brands"
                                checked={showAllBrands}
                                onChange={setShowAllBrands}
                                label="Semua brand"
                            />
                        )}
                        {can('client.create') && (
                            <Button variant="primary" icon={Plus} onClick={() => setShowAddLead(true)}>
                                Tambah lead
                            </Button>
                        )}
                    </>
                }
            />

            {isLoading && crmLeads.length === 0 && (
                <div className="text-body-sm text-fg-muted" role="status">Memuat data lead…</div>
            )}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard label="Total lead" value={totalLeadsCount.toLocaleString('id-ID')} hint={showAllBrands ? 'Semua brand' : 'Brand aktif'} icon={UsersRound} />
                <MetricCard label="Nilai pipeline" value={formatRp(activePipelineValue)} hint={`${activeLeads.length} lead aktif`} icon={TrendingUp} tone="primary" />
                <MetricCard label="Tahap survei" value={surveyCount.toLocaleString('id-ID')} hint="Prospek / Survey" icon={Ruler} />
                <MetricCard label="Nilai closing" value={formatRp(closingRevenueValue)} hint={`${closingCount} closing / DP`} icon={Handshake} tone="success" />
            </div>

            <Panel padded={false}>
                {/* Toolbar */}
                <div className="flex flex-col gap-2.5 border-b border-border p-3 sm:p-4 lg:flex-row lg:items-center">
                    <SearchInput
                        wrapperClassName="flex-1 lg:max-w-sm"
                        placeholder="Cari nama, proyek, lokasi, nomor…"
                        aria-label="Cari lead"
                        value={crmSearch}
                        onChange={(e) => setCrmSearch(e.target.value)}
                        onClear={() => setCrmSearch('')}
                        className="text-base sm:text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
                        <Select aria-label="Filter status" value={crmStatusFilter} onChange={(e) => setCrmStatusFilter(e.target.value)} wrapperClassName="sm:w-48">
                            <option value="Semua">Semua status</option>
                            {LEAD_STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </Select>
                        <Select aria-label="Urutkan" value={crmSortOption} onChange={(e) => setCrmSortOption(e.target.value)} wrapperClassName="sm:w-44">
                            <option value="terbaru">Terbaru</option>
                            <option value="terlama">Terlama</option>
                            <option value="nilai_tinggi">Nilai tertinggi</option>
                            <option value="nilai_rendah">Nilai terendah</option>
                            <option value="nama_az">Nama A–Z</option>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 lg:ml-auto">
                        <SegmentedControl
                            label="Tampilan"
                            size="sm"
                            value={viewMode}
                            onChange={setViewMode}
                            className="hidden md:inline-flex"
                            options={[
                                { value: 'table', label: 'Tabel', icon: Table2 },
                                { value: 'pipeline', label: 'Pipeline', icon: SquareKanban }
                            ]}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={Download}
                            onClick={() => ExportService.exportLeadsToCsv(filteredLeads)}
                            title="Ekspor daftar lead ke CSV"
                        >
                            Ekspor CSV
                        </Button>
                    </div>
                </div>

                {filteredLeads.length === 0 ? (
                    emptyState
                ) : viewMode === 'pipeline' ? (
                    /* Pipeline (read-only kanban; stage changes happen via Edit) */
                    <div className="hidden md:block overflow-x-auto p-3 sm:p-4">
                        <div className="flex min-w-max gap-3">
                            {LEAD_STATUS_OPTIONS.map((status) => {
                                const items = filteredLeads.filter((l) => l.status === status);
                                const total = items.reduce((acc, l) => acc + (typeof l.value === 'number' ? l.value : 0), 0);
                                const tone = STATUS_TONES[getStatusTone(status)];
                                return (
                                    <section key={status} className="w-64 shrink-0 rounded-md bg-surface-2 p-2" aria-label={status}>
                                        <header className="flex items-center justify-between gap-2 px-1.5 pb-2 pt-1">
                                            <span className="flex min-w-0 items-center gap-1.5 text-label font-medium text-fg-2">
                                                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', tone.dot)} aria-hidden="true" />
                                                <span className="truncate">{status}</span>
                                            </span>
                                            <span className="text-caption text-fg-muted tabular">{items.length}</span>
                                        </header>
                                        {total > 0 && <div className="px-1.5 pb-2 text-caption text-fg-muted tabular">{formatRp(total)}</div>}
                                        <div className="space-y-1.5">
                                            {items.map((lead) => (
                                                <button
                                                    key={lead.id}
                                                    type="button"
                                                    onClick={() => setEditingLead(lead)}
                                                    className="block w-full rounded-sm border border-border bg-surface p-2.5 text-left transition-colors hover:border-border-strong"
                                                >
                                                    <div className="truncate text-body-sm font-medium text-fg">{lead.name}</div>
                                                    <div className="mt-0.5 truncate text-caption text-fg-3">{lead.project || 'Interior custom'}</div>
                                                    <div className="mt-1.5 flex items-center justify-between gap-2 text-caption text-fg-muted">
                                                        <span className="truncate">{lead.location || '—'}</span>
                                                        <span className="shrink-0 tabular text-fg-2">{lead.value ? formatRp(lead.value) : ''}</span>
                                                    </div>
                                                </button>
                                            ))}
                                            {items.length === 0 && <div className="rounded-sm border border-dashed border-border px-2 py-4 text-center text-caption text-fg-muted">Kosong</div>}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Desktop table */
                    <div className="hidden md:block max-h-[70dvh] overflow-auto">
                        <table className="w-full min-w-[860px] text-left text-body-sm">
                            <thead className="sticky top-0 z-10 bg-surface-2 text-label font-medium text-fg-3">
                                <tr className="border-b border-border">
                                    <th scope="col" className="px-4 py-2.5 font-medium">Klien</th>
                                    <th scope="col" className="px-4 py-2.5 font-medium">Telepon</th>
                                    <th scope="col" className="px-4 py-2.5 font-medium">Proyek</th>
                                    <th scope="col" className="px-4 py-2.5 font-medium">Lokasi</th>
                                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Nilai</th>
                                    <th scope="col" className="px-4 py-2.5 font-medium">Tahap</th>
                                    {showBrandColumn && <th scope="col" className="px-4 py-2.5 font-medium">Brand</th>}
                                    <th scope="col" className="px-4 py-2.5 font-medium">Aktivitas</th>
                                    <th scope="col" className="w-24 px-4 py-2.5 text-right font-medium"><span className="sr-only">Aksi</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="transition-colors hover:bg-surface-hover">
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <button type="button" onClick={() => setEditingLead(lead)} className="text-left font-medium text-fg hover:text-primary-text">
                                                    {lead.name}
                                                </button>
                                                {lead.externalSource === 'ereport' && <Badge variant="primary" title={lead.externalStatus ? `Status e-report: ${lead.externalStatus}` : 'Dari e-report'}>e-report</Badge>}
                                                {lead.potentialDuplicateOf && <Badge variant="warning" title="Nomor/nama mirip dengan klien lain">Duplikat?</Badge>}
                                            </div>
                                            {lead.dimensions && <div className="text-caption text-fg-muted">{lead.dimensions}</div>}
                                        </td>
                                        <td className="px-4 py-2.5 text-fg-2 tabular">{lead.phoneRaw ? formatDisplayPhone(lead.phoneRaw) : <span className="text-fg-muted">—</span>}</td>
                                        <td className="max-w-[200px] truncate px-4 py-2.5 text-fg-2">{lead.project || 'Interior custom'}</td>
                                        <td className="max-w-[160px] truncate px-4 py-2.5 text-fg-3">{lead.location || '—'}</td>
                                        <td className="px-4 py-2.5 text-right font-medium text-fg tabular">{formatRp(lead.value)}</td>
                                        <td className="px-4 py-2.5"><StatusBadge status={lead.status} /></td>
                                        {showBrandColumn && (
                                            <td className="px-4 py-2.5 text-caption text-fg-3">{lead.brandId ? lead.brandId.replace('brand_', '') : 'nacira'}</td>
                                        )}
                                        <td className="px-4 py-2.5 text-caption text-fg-muted tabular">{formatDate(lead.updatedAt || lead.createdAt)}</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center justify-end gap-0.5">
                                                {renderWaLink(lead, true)}
                                                <Menu
                                                    items={leadMenuItems(lead)}
                                                    trigger={({ props }) => (
                                                        <IconButton icon={EllipsisVertical} label={`Aksi untuk ${lead.name}`} {...props} />
                                                    )}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Mobile cards */}
                {filteredLeads.length > 0 && (
                    <ul className="md:hidden divide-y divide-border">
                        {filteredLeads.map((lead) => (
                            <li key={lead.id} className="space-y-3 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-body font-semibold text-fg">{lead.name}</div>
                                        <div className="mt-0.5 truncate text-body-sm text-fg-3">{lead.project || 'Interior custom'}</div>
                                    </div>
                                    <StatusBadge status={lead.status} />
                                </div>
                                <dl className="grid grid-cols-2 gap-2 text-body-sm">
                                    <div className="min-w-0">
                                        <dt className="text-caption text-fg-muted">Nilai</dt>
                                        <dd className="truncate font-medium text-fg tabular">{formatRp(lead.value)}</dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="text-caption text-fg-muted">Lokasi</dt>
                                        <dd className="truncate text-fg-2">{lead.location || '—'}</dd>
                                    </div>
                                    {showBrandColumn && (
                                        <div className="min-w-0">
                                            <dt className="text-caption text-fg-muted">Brand</dt>
                                            <dd className="truncate text-fg-2">{lead.brandId ? lead.brandId.replace('brand_', '') : 'nacira'}</dd>
                                        </div>
                                    )}
                                </dl>
                                <div className="flex items-center gap-2">
                                    {renderWaLink(lead)}
                                    <Button variant="secondary" className="flex-1" icon={Pencil} onClick={() => setEditingLead(lead)}>
                                        Buka
                                    </Button>
                                    <Menu
                                        items={leadMenuItems(lead)}
                                        trigger={({ props }) => <IconButton icon={EllipsisVertical} label={`Aksi untuk ${lead.name}`} variant="outline" {...props} />}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            {/* Add lead sheet */}
            <Modal
                isOpen={showAddLead}
                onClose={() => setShowAddLead(false)}
                closeDisabled={isAddingLead}
                variant="sheet"
                size="md"
                icon={UserPlus}
                title="Tambah lead"
                description={`Lead akan tersimpan di ${activeBrand?.brandName || 'brand aktif'}.`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowAddLead(false)} disabled={isAddingLead}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" form="add-lead-form" loading={isAddingLead}>
                            {isAddingLead ? 'Menyimpan…' : confirmDuplicate ? 'Tetap simpan' : 'Simpan lead'}
                        </Button>
                    </>
                }
            >
                <form
                    id="add-lead-form"
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        pendingAddCountRef.current = brandScopedLeads.length;
                        handleAddLead();
                    }}
                >
                    {crmError && (
                        <div className="flex items-start gap-2 rounded-sm border border-danger/25 bg-danger/10 px-3 py-2.5 text-body-sm text-red-300" role="alert">
                            <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                            {crmError}
                        </div>
                    )}
                    <FormField label="Nama klien" htmlFor="lead-name" required>
                        <Input id="lead-name" data-autofocus value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} placeholder="Ibu Rina" maxLength={100} />
                    </FormField>
                    <FormField label="Nomor WhatsApp" htmlFor="lead-phone" helperText="Format 08… atau +62…">
                        <Input id="lead-phone" type="tel" inputMode="tel" value={newLeadPhone} onChange={(e) => setNewLeadPhone(e.target.value)} placeholder="0812 3456 7890" invalid={Boolean(duplicateWarning)} />
                    </FormField>
                    {duplicateWarning && (
                        <div className="flex items-start gap-2 rounded-sm border border-warning/25 bg-warning/10 px-3 py-2.5 text-body-sm text-amber-300" role="alert">
                            <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                            {duplicateWarning}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField label="Proyek" htmlFor="lead-project">
                            <Input id="lead-project" value={newLeadProject} onChange={(e) => setNewLeadProject(e.target.value)} placeholder="Kitchen set" />
                        </FormField>
                        <FormField label="Lokasi" htmlFor="lead-location">
                            <Input id="lead-location" value={newLeadLocation} onChange={(e) => setNewLeadLocation(e.target.value)} placeholder="Bandung Kota" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField label="Estimasi nilai" htmlFor="lead-value">
                            <Input id="lead-value" type="number" inputMode="numeric" min="0" prefix="Rp" value={newLeadValue} onChange={(e) => setNewLeadValue(e.target.value)} placeholder="25000000" className="text-base sm:text-sm" />
                        </FormField>
                        <FormField label="Tahap" htmlFor="lead-status">
                            <Select id="lead-status" value={newLeadStatus} onChange={(e) => setNewLeadStatus(e.target.value)}>
                                {LEAD_STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Select>
                        </FormField>
                    </div>
                    {newLeadStatus === 'Batal' && (
                        <FormField label="Alasan batal" htmlFor="lead-lost-reason" required>
                            <Select id="lead-lost-reason" value={newLeadLostReason} onChange={(e) => setNewLeadLostReason(e.target.value)}>
                                <option value="">Pilih alasan</option>
                                {LOST_REASON_OPTIONS.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </Select>
                        </FormField>
                    )}
                </form>
            </Modal>

            <EditLeadModal
                isOpen={Boolean(editingLead)}
                lead={editingLead}
                allLeads={crmLeads}
                onSave={handleUpdateLead}
                onCancel={() => setEditingLead(null)}
            />

            <ConfirmModal
                isOpen={Boolean(deleteTargetId)}
                title="Hapus lead ini?"
                message="Lead akan dihapus dari pipeline. Tugas follow-up yang terhubung tetap disimpan sebagai tugas mandiri."
                confirmText="Hapus lead"
                isLoading={isDeletingLead}
                onConfirm={confirmDeleteLead}
                onCancel={() => setDeleteTargetId(null)}
            />
        </div>
    );
};
