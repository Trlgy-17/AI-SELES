// File: src/components/modals/EditTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { Pencil, CircleAlert } from 'lucide-react';
import { FormField } from '../common/FormField.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input, Select } from '../ui/Input.jsx';
import { Chip } from '../ui/Surface.jsx';
import { normalizePhone } from '../../js/utils/phone.js';
import { getAsiaJakartaDate, getAsiaJakartaIso, addDaysToDate } from '../../js/utils/date.js';
import { TASK_STATUS_OPTIONS } from '../../js/constants.js';

export const EditTaskModal = ({ isOpen, task, crmLeads = [], onSave, onCancel }) => {
    const [client, setClient] = useState('');
    const [phoneRaw, setPhoneRaw] = useState('');
    const [type, setType] = useState('');
    const [status, setStatus] = useState('Pending');
    const [dueDate, setDueDate] = useState('');
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [err, setErr] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && task) {
            setClient(task.client || '');
            setPhoneRaw(task.phoneRaw || '');
            setType(task.type || '');
            setStatus(task.status || 'Pending');
            setDueDate(task.dueDate || '');
            setSelectedLeadId(task.leadId || '');
            setErr(null);
            setIsSaving(false);
        }
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    const handleLeadSelect = (e) => {
        const lId = e.target.value;
        setSelectedLeadId(lId);
        if (lId) {
            const found = crmLeads.find(l => l.id === lId);
            if (found) {
                setClient(found.name);
                setPhoneRaw(found.phoneRaw);
            }
        }
    };

    const handleSave = async () => {
        if (!client.trim()) {
            setErr("Nama klien tidak boleh kosong.");
            return;
        }

        setIsSaving(true);
        const phoneNormalized = normalizePhone(phoneRaw);
        await onSave({
            ...task,
            leadId: selectedLeadId || null,
            client: client.trim().slice(0, 100),
            phoneRaw: phoneRaw.trim().slice(0, 30),
            phoneNormalized: phoneNormalized,
            type: type.trim().slice(0, 100) || 'Follow-Up Prospek',
            status: status,
            dueDate: dueDate || null,
            needsReschedule: !dueDate,
            updatedAt: getAsiaJakartaIso()
        });
        setIsSaving(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            closeDisabled={isSaving}
            icon={Pencil}
            title="Edit tugas follow-up"
            size="md"
            className="max-h-[90dvh]"
            bodyClassName="overflow-y-auto space-y-4"
            footer={
                <>
                    <Button variant="ghost" onClick={onCancel} disabled={isSaving}>Batal</Button>
                    <Button variant="primary" onClick={handleSave} loading={isSaving}>{isSaving ? 'Menyimpan…' : 'Simpan perubahan'}</Button>
                </>
            }
        >
            {err && (
                <div className="flex items-start gap-2 rounded-sm border border-danger/25 bg-danger/10 px-3 py-2.5 text-body-sm text-red-300" role="alert">
                    <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {err}
                </div>
            )}
            <FormField label="Lead CRM (opsional)" htmlFor="task-lead">
                <Select id="task-lead" value={selectedLeadId} onChange={handleLeadSelect}>
                    <option value="">Tidak terhubung</option>
                    {crmLeads.map(l => (
                        <option key={l.id} value={l.id}>{l.name} {l.project ? `(${l.project})` : ''}</option>
                    ))}
                </Select>
            </FormField>
            <FormField label="Nama klien" htmlFor="task-client" required>
                <Input id="task-client" value={client} onChange={(e) => setClient(e.target.value)} />
            </FormField>
            <FormField label="Nomor WhatsApp" htmlFor="task-phone">
                <Input id="task-phone" type="tel" placeholder="0812 3456 7890" value={phoneRaw} onChange={(e) => setPhoneRaw(e.target.value)} />
            </FormField>
            <FormField label="Jenis tugas" htmlFor="task-type">
                <Input id="task-type" value={type} onChange={(e) => setType(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Jatuh tempo" htmlFor="task-due">
                    <Input id="task-due" type="date" value={dueDate || ''} onChange={(e) => setDueDate(e.target.value)} />
                    <div className="flex flex-wrap gap-1 pt-1.5">
                        <Chip className="h-7 px-2 text-caption" onClick={() => setDueDate(getAsiaJakartaDate())}>Hari ini</Chip>
                        <Chip className="h-7 px-2 text-caption" onClick={() => setDueDate(addDaysToDate(getAsiaJakartaDate(), 1))}>Besok</Chip>
                        <Chip className="h-7 px-2 text-caption" onClick={() => setDueDate(addDaysToDate(getAsiaJakartaDate(), 3))}>+3 hari</Chip>
                        {dueDate && <Chip className="h-7 px-2 text-caption" onClick={() => setDueDate('')}>Hapus</Chip>}
                    </div>
                </FormField>
                <FormField label="Status" htmlFor="task-status">
                    <Select id="task-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        {TASK_STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </Select>
                </FormField>
            </div>
        </Modal>
    );
};
