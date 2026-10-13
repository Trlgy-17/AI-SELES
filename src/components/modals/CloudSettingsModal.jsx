// File: src/components/modals/CloudSettingsModal.jsx
// Pengaturan: integrasi e-report (read-only) dan impor data lokal lama ke database.
import React, { useCallback, useEffect, useState } from 'react';
import { Settings2, RefreshCw, Upload, CircleAlert, CircleCheck, ShieldCheck, Link2 } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Select, Switch } from '../ui/Input.jsx';
import { Badge, SegmentedControl } from '../ui/Surface.jsx';
import { EreportApi, MigrationApi } from '../../js/services/api.js';
import { collectLegacyData, markLegacyImported, getLegacyImportedAt } from '../../js/services/legacyExport.js';

const STAGE_OPTIONS = [
    { value: 'PROSPECT_SURVEY', label: 'Prospek / Survey' },
    { value: 'DESIGN_REVIEW', label: 'Design Review' },
    { value: 'QUOTATION', label: 'Penawaran RAB' },
    { value: 'CLOSING_DP', label: 'Closing / DP Masuk' },
    { value: 'COMPLETED', label: 'Selesai / Terpasang' },
    { value: 'LOST', label: 'Batal' }
];

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const Notice = ({ tone = 'danger', children }) => (
    <div className={`flex items-start gap-2 rounded-sm border px-3 py-2.5 text-body-sm ${tone === 'danger' ? 'border-danger/25 bg-danger/10 text-red-300' : 'border-success/25 bg-success/10 text-emerald-300'}`} role={tone === 'danger' ? 'alert' : 'status'}>
        {tone === 'danger' ? <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> : <CircleCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
        <div className="min-w-0">{children}</div>
    </div>
);

const EreportPanel = ({ brands, showToast, onDataChanged }) => {
    const [status, setStatus] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState('');
    const [lastResult, setLastResult] = useState(null);
    // null = belum dicoba. false = e-report tidak terjangkau, jadi daftar kosong di bawah
    // berarti "gagal dimuat", bukan "token tanpa akun".
    const [reachable, setReachable] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const st = await EreportApi.status();
            setStatus(st.data);
            if (!st.data.configured) return;
            const [acc, sts] = await Promise.all([EreportApi.accounts(), EreportApi.statusMappings()]);
            setAccounts(acc.data);
            setStatuses(sts.data.map((s) => ({ ...s, stage: s.stage || 'PROSPECT_SURVEY' })));
            setReachable(true);
        } catch (err) {
            setReachable(false);
            setError(err.message);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const saveMappings = async () => {
        setBusy('save');
        setError(null);
        try {
            await EreportApi.saveMappings(accounts.map((a) => ({ ereportAccountId: a.id, ereportAccountName: a.name, brandId: a.brandId || null, enabled: Boolean(a.enabled && a.brandId) })));
            await EreportApi.saveStatusMappings(statuses.map((s) => ({ ereportStatusId: s.id, ereportStatusName: s.name, stage: s.stage })));
            showToast('Pemetaan e-report disimpan.', 'success');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const sync = async () => {
        setBusy('sync');
        setError(null);
        try {
            const res = await EreportApi.sync();
            setLastResult(res.data);
            showToast(`Sinkron selesai: ${res.data.created} baru, ${res.data.updated} diperbarui.`, res.data.failed ? 'warning' : 'success');
            onDataChanged?.();
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    if (!status) {
        return error
            ? (
                <div className="space-y-3">
                    <Notice>{error}</Notice>
                    <Button variant="secondary" onClick={load} icon={RefreshCw}>Coba lagi</Button>
                </div>
            )
            : <div className="text-body-sm text-fg-muted" role="status">Memuat status integrasi…</div>;
    }

    if (!status.configured) {
        return (
            <div className="space-y-3 text-body-sm text-fg-2">
                <Notice>Integrasi belum dikonfigurasi di server.</Notice>
                <ol className="list-decimal space-y-1 pl-5 text-fg-3">
                    <li>Di server e-report: <code className="rounded-xs bg-surface-3 px-1">php artisan integration:client create "Nacira CRM" --accounts=1,9</code></li>
                    <li>Isi <code className="rounded-xs bg-surface-3 px-1">EREPORT_API_URL</code> dan <code className="rounded-xs bg-surface-3 px-1">EREPORT_API_TOKEN</code> di env backend aplikasi ini, lalu restart API.</li>
                </ol>
            </div>
        );
    }

    const run = lastResult || status.lastRun;

    return (
        <div className="space-y-5">
            {error && <Notice>{error}</Notice>}
            <div className="flex flex-wrap items-center gap-2 rounded-md bg-surface-2 px-3.5 py-3 text-body-sm">
                {reachable === false
                    ? <CircleAlert size={16} className="text-red-400" aria-hidden="true" />
                    : <ShieldCheck size={16} className="text-emerald-400" aria-hidden="true" />}
                <span className="text-fg">{reachable === false ? 'Tidak terhubung ke' : 'Terhubung ke'} {status.baseUrl}</span>
                <Badge variant={reachable === false ? 'danger' : 'success'}>{reachable === false ? 'Offline' : 'Hanya baca'}</Badge>
                <span className="ml-auto text-caption text-fg-muted">
                    {status.intervalMinutes > 0 ? `Sinkron otomatis tiap ${status.intervalMinutes} menit` : 'Sinkron otomatis nonaktif'}
                </span>
            </div>

            <section>
                <h3 className="mb-2 text-label font-medium text-fg-2">Akun e-report → brand</h3>
                <div className="divide-y divide-border rounded-md border border-border">
                    {accounts.length === 0 && (
                        <div className="px-3 py-3 text-body-sm text-fg-muted">
                            {reachable === false
                                ? 'Daftar akun tidak dapat dimuat karena e-report tidak terhubung.'
                                : 'Token ini belum diberi akses ke akun mana pun.'}
                        </div>
                    )}
                    {accounts.map((a, i) => (
                        <div key={a.id} className="grid grid-cols-1 items-center gap-2 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_200px_auto]">
                            <div className="min-w-0">
                                <div className="truncate text-body-sm font-medium text-fg">{a.name}</div>
                                <div className="text-caption text-fg-muted">ID akun {a.id}{a.city ? ` · ${a.city}` : ''}</div>
                            </div>
                            <Select aria-label={`Brand untuk ${a.name}`} value={a.brandId || ''} onChange={(e) => setAccounts((prev) => prev.map((x, j) => (j === i ? { ...x, brandId: e.target.value || null, enabled: e.target.value ? x.enabled : false } : x)))}>
                                <option value="">Tidak dipetakan</option>
                                {brands.map((b) => <option key={b.id} value={b.id}>{b.brandName}</option>)}
                            </Select>
                            <Switch id={`ereport-enable-${a.id}`} checked={Boolean(a.enabled)} disabled={!a.brandId} onChange={(v) => setAccounts((prev) => prev.map((x, j) => (j === i ? { ...x, enabled: v } : x)))} label="Aktif" />
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="mb-2 text-label font-medium text-fg-2">Status e-report → tahap CRM</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {statuses.map((s, i) => (
                        <label key={s.id} className="flex items-center gap-2 rounded-sm border border-border px-3 py-2">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color || 'var(--fg-muted)' }} aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate text-body-sm text-fg-2">{s.name}</span>
                            <Select aria-label={`Tahap untuk status ${s.name}`} wrapperClassName="w-44" value={s.stage} onChange={(e) => setStatuses((prev) => prev.map((x, j) => (j === i ? { ...x, stage: e.target.value } : x)))}>
                                {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </Select>
                        </label>
                    ))}
                </div>
            </section>

            <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={saveMappings} loading={busy === 'save'} icon={Link2}>Simpan pemetaan</Button>
                <Button variant="primary" onClick={sync} loading={busy === 'sync'} icon={RefreshCw}>Sinkron sekarang</Button>
                {reachable === false && <Button variant="secondary" onClick={load} icon={RefreshCw}>Coba lagi</Button>}
            </div>

            {run && (
                <div className="rounded-md bg-surface-2 px-3.5 py-3 text-body-sm">
                    <div className="mb-1 flex items-center gap-2">
                        <span className="font-medium text-fg">Sinkron terakhir</span>
                        <Badge variant={run.status === 'SUCCESS' ? 'success' : run.status === 'FAILED' ? 'danger' : 'warning'}>{run.status}</Badge>
                        <span className="ml-auto text-caption text-fg-muted">{fmtDate(run.finishedAt || run.startedAt)}</span>
                    </div>
                    <div className="text-fg-3 tabular">
                        Diambil {run.fetched} · baru {run.created} · diperbarui {run.updated} · tetap {run.unchanged} · diarsipkan {run.archived} · duplikat ditandai {run.duplicateFlags} · gagal {run.failed}
                    </div>
                </div>
            )}
        </div>
    );
};

const LegacyImportPanel = ({ showToast, onDataChanged }) => {
    const [preview] = useState(() => collectLegacyData());
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const importedAt = getLegacyImportedAt();

    const runImport = async () => {
        setBusy(true);
        setError(null);
        try {
            const res = await MigrationApi.legacyImport(preview.payload);
            setReport(res.data);
            markLegacyImported();
            showToast(`Impor selesai: ${res.data.imported} data masuk.`, res.data.failed ? 'warning' : 'success');
            onDataChanged?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4 text-body-sm">
            <p className="text-fg-3">
                Memindahkan lead & tugas yang dulu tersimpan di browser ini ke database pusat. Data di browser <strong className="text-fg-2">tidak dihapus</strong>, dan impor ulang tidak membuat duplikat.
            </p>
            <div className="grid grid-cols-3 gap-2">
                {[['Lead', preview.payload.leads.length], ['Tugas', preview.payload.tasks.length], ['Dihapus (tombstone)', (preview.payload.tombstones.leads?.length || 0) + (preview.payload.tombstones.tasks?.length || 0)]].map(([label, n]) => (
                    <div key={label} className="rounded-md bg-surface-2 px-3 py-2.5">
                        <div className="text-caption text-fg-muted">{label}</div>
                        <div className="text-h3 font-semibold text-fg tabular">{n}</div>
                    </div>
                ))}
            </div>
            {preview.sources.length > 0 && <div className="text-caption text-fg-muted">Sumber: {preview.sources.join(', ')}</div>}
            {importedAt && <div className="text-caption text-fg-muted">Terakhir diimpor dari browser ini: {fmtDate(importedAt)}</div>}
            {error && <Notice>{error}</Notice>}
            <Button variant="primary" icon={Upload} onClick={runImport} loading={busy} disabled={!preview.payload.leads.length && !preview.payload.tasks.length}>
                Impor ke database
            </Button>
            {report && (
                <Notice tone={report.failed ? 'danger' : 'success'}>
                    <div className="font-medium">Total {report.totalRecords}: {report.imported} diimpor, {report.duplicates} duplikat, {report.skipped} dilewati, {report.invalid} tidak valid, {report.failed} gagal.</div>
                    {report.brandDefaulted > 0 && <div>{report.brandDefaulted} lead tanpa brand dimasukkan ke brand aktif.</div>}
                    {report.flaggedDuplicates > 0 && <div>{report.flaggedDuplicates} lead ditandai kemungkinan duplikat (perlu dicek manual).</div>}
                    {report.issues?.length > 0 && (
                        <details className="mt-1">
                            <summary className="cursor-pointer">Rincian ({report.issues.length})</summary>
                            <ul className="mt-1 max-h-40 list-disc overflow-y-auto pl-5">
                                {report.issues.map((it, i) => <li key={i}>{it.kind} {it.legacyId || '—'}: {it.reason}</li>)}
                            </ul>
                        </details>
                    )}
                </Notice>
            )}
        </div>
    );
};

export const CloudSettingsModal = ({ isOpen, onClose, session, can, showToast, onDataChanged }) => {
    const canManage = can?.('settings.manage');
    const canImport = can?.('data.import');
    const tabs = [
        ...(canManage ? [{ value: 'ereport', label: 'Integrasi e-report' }] : []),
        ...(canImport ? [{ value: 'import', label: 'Impor data lokal' }] : [])
    ];
    const [tab, setTab] = useState(tabs[0]?.value || 'import');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            icon={Settings2}
            title="Pengaturan"
            description="Data disimpan di database pusat dan dibatasi per brand."
            size="lg"
            className="max-h-[90dvh]"
            bodyClassName="overflow-y-auto space-y-4"
        >
            {tabs.length > 1 && <SegmentedControl label="Bagian pengaturan" value={tab} onChange={setTab} options={tabs} />}
            {tabs.length === 0 && <p className="text-body-sm text-fg-3">Tidak ada pengaturan yang tersedia untuk peran Anda.</p>}
            {tab === 'ereport' && canManage && <EreportPanel brands={session?.brands || []} showToast={showToast} onDataChanged={onDataChanged} />}
            {tab === 'import' && canImport && <LegacyImportPanel showToast={showToast} onDataChanged={onDataChanged} />}
        </Modal>
    );
};
