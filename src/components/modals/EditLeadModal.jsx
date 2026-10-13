// File: src/components/modals/EditLeadModal.jsx
import React, { useState, useEffect } from 'react';
import { Pencil, CircleAlert, TriangleAlert } from 'lucide-react';
import { FormField } from '../common/FormField.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input, Select, Textarea } from '../ui/Input.jsx';
import { normalizePhone } from '../../js/utils/phone.js';
import { getAsiaJakartaIso } from '../../js/utils/date.js';
import { LEAD_STATUS_OPTIONS } from '../../js/constants.js';
import { LOST_REASON_OPTIONS } from '../../js/services/api.js';

export const EditLeadModal = ({ isOpen, lead, allLeads = [], onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [phoneRaw, setPhoneRaw] = useState('');
    const [project, setProject] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [status, setStatus] = useState('Prospek / Survey');
    const [location, setLocation] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [notes, setNotes] = useState('');
    const [lostReason, setLostReason] = useState('');
    const [err, setErr] = useState(null);
    const [dupWarning, setDupWarning] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && lead) {
            setName(lead.name || '');
            setPhoneRaw(lead.phoneRaw || '');
            setProject(lead.project || '');
            setValueInput(lead.value !== null && lead.value !== undefined ? String(lead.value) : '');
            setStatus(lead.status || 'Prospek / Survey');
            setLocation(lead.location || '');
            setDimensions(lead.dimensions || '');
            setNotes(lead.notes || '');
            setLostReason(lead.lostReason || '');
            setErr(null);
            setDupWarning(null);
            setIsSaving(false);
        }
    }, [isOpen, lead]);

    useEffect(() => {
        const norm = normalizePhone(phoneRaw);
        if (norm && norm.length >= 8 && Array.isArray(allLeads)) {
            const match = allLeads.find(l => l.id !== lead?.id && l.phoneNormalized === norm);
            if (match) {
                setDupWarning(`Perhatian: Nomor WhatsApp ini juga terdaftar atas nama klien "${match.name}".`);
            } else {
                setDupWarning(null);
            }
        } else {
            setDupWarning(null);
        }
    }, [phoneRaw, allLeads, lead]);

    if (!isOpen || !lead) return null;

    const handleSave = async () => {
        if (!name.trim()) {
            setErr("Nama klien tidak boleh kosong.");
            return;
        }

        let cleanVal = null;
        if (valueInput.trim() !== '') {
            const num = Number(valueInput);
            if (isNaN(num) || !isFinite(num) || num < 0) {
                setErr("Nilai proyek harus berupa angka positif atau 0.");
                return;
            }
            cleanVal = Math.round(num);
        }
        if (status === 'Batal' && !lostReason) {
            setErr("Pilih alasan lead batal.");
            return;
        }

        setIsSaving(true);
        const phoneNormalized = normalizePhone(phoneRaw);
        try {
        await onSave({
            ...lead,
            lostReason: status === 'Batal' ? lostReason : null,
            name: name.trim().slice(0, 100),
            phoneRaw: phoneRaw.trim().slice(0, 30),
            phoneNormalized: phoneNormalized,
            project: project.trim().slice(0, 200),
            value: cleanVal,
            status: status,
            location: location.trim(),
            dimensions: dimensions.trim(),
            notes: notes.trim(),
            updatedAt: getAsiaJakartaIso()
        });
        } catch (e) {
            setErr(e?.message || 'Gagal menyimpan perubahan.');
        } finally {
            setIsSaving(false);
        }
    };

    const locked = Boolean(lead.isSourceLocked);

    return (
        <Modal
            isOpen={isOpen && Boolean(lead)}
            onClose={onCancel}
            closeDisabled={isSaving}
            variant="sheet"
            size="md"
            icon={Pencil}
            title="Edit lead"
            description={locked ? "Nama, telepon, dan lokasi dikelola di e-report (hanya baca)." : "Perubahan lokasi & ukuran juga tersimpan di memori AI."}
            className="max-h-[90dvh]"
            bodyClassName="overflow-y-auto"
            footer={
                <>
                    <Button variant="ghost" onClick={onCancel} disabled={isSaving}>Batal</Button>
                    <Button variant="primary" type="submit" form="edit-lead-form" loading={isSaving}>
                        {isSaving ? 'Menyimpan…' : 'Simpan perubahan'}
                    </Button>
                </>
            }
        >
            <form
                id="edit-lead-form"
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}
            >
                {err && (
                    <div className="flex items-start gap-2 rounded-sm border border-danger/25 bg-danger/10 px-3 py-2.5 text-body-sm text-red-300" role="alert">
                        <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {err}
                    </div>
                )}
                <FormField label="Nama klien" htmlFor="edit-lead-name" required>
                    <Input id="edit-lead-name" value={name} onChange={(e) => setName(e.target.value)} disabled={locked} />
                </FormField>
                <FormField
                    label="Nomor WhatsApp"
                    htmlFor="edit-lead-phone"
                    helperText={phoneRaw ? (normalizePhone(phoneRaw) ? `Tersimpan: +${normalizePhone(phoneRaw)}` : 'Nomor tidak valid (akan disimpan kosong)') : 'Format bebas: 08…, +62…, atau dengan spasi'}
                >
                    <Input id="edit-lead-phone" type="tel" inputMode="tel" placeholder="0812 3456 7890" value={phoneRaw} onChange={(e) => setPhoneRaw(e.target.value)} invalid={Boolean(dupWarning)} disabled={locked} />
                </FormField>
                {dupWarning && (
                    <div className="flex items-start gap-2 rounded-sm border border-warning/25 bg-warning/10 px-3 py-2.5 text-body-sm text-amber-300" role="alert">
                        <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {dupWarning}
                    </div>
                )}
                <FormField label="Proyek" htmlFor="edit-lead-project">
                    <Input id="edit-lead-project" value={project} onChange={(e) => setProject(e.target.value)} />
                </FormField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Lokasi" htmlFor="edit-lead-location">
                        <Input id="edit-lead-location" placeholder="Podomoro Bandung" value={location} onChange={(e) => setLocation(e.target.value)} disabled={locked} />
                    </FormField>
                    <FormField label="Ukuran" htmlFor="edit-lead-dimensions">
                        <Input id="edit-lead-dimensions" placeholder="3m x 2.4m" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Estimasi nilai" htmlFor="edit-lead-value" helperText="Kosongkan jika belum ada">
                        <Input id="edit-lead-value" type="number" inputMode="numeric" min="0" prefix="Rp" placeholder="25000000" value={valueInput} onChange={(e) => setValueInput(e.target.value)} />
                    </FormField>
                    <FormField label="Tahap" htmlFor="edit-lead-status">
                        <Select id="edit-lead-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                            {LEAD_STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </Select>
                    </FormField>
                </div>
                {status === 'Batal' && (
                    <FormField label="Alasan batal" htmlFor="edit-lead-lost-reason" required>
                        <Select id="edit-lead-lost-reason" value={lostReason} onChange={(e) => setLostReason(e.target.value)}>
                            <option value="">Pilih alasan</option>
                            {LOST_REASON_OPTIONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </Select>
                    </FormField>
                )}
                <FormField label="Catatan" htmlFor="edit-lead-notes">
                    <Textarea id="edit-lead-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferensi material, jadwal survei, dsb." />
                </FormField>
            </form>
        </Modal>
    );
};
