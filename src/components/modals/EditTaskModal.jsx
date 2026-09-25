// File: src/components/modals/EditTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons.jsx';
import { FormField } from '../common/FormField.jsx';
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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isSaving) onCancel();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel, isSaving]);

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
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="edit-task-title" 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto safe-padding-bottom safe-padding-top"
        >
            <div className="bg-[#15151a] border border-[#26262d] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto max-h-[90dvh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-[#26262d] pb-3">
                    <h3 id="edit-task-title" className="serif-font font-bold text-base sm:text-lg text-white flex items-center gap-2">
                        <Icons.Edit /> Edit Tugas Follow-Up
                    </h3>
                    <button 
                        onClick={onCancel} 
                        disabled={isSaving} 
                        className="text-zinc-400 hover:text-white font-bold p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg" 
                        aria-label="Tutup modal edit tugas"
                    >
                        ✕
                    </button>
                </div>

                {err && (
                    <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold" role="alert">
                        ⚠️ {err}
                    </div>
                )}

                <div className="space-y-3">
                    <FormField label="Pilih dari Prospek CRM (Opsional)">
                        <select 
                            value={selectedLeadId} 
                            onChange={handleLeadSelect}
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        >
                            <option value="">-- Standalone / Tidak Terhubung --</option>
                            {crmLeads.map(l => (
                                <option key={l.id} value={l.id}>{l.name} {l.project ? `(${l.project})` : ''}</option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Nama Klien" required>
                        <input 
                            type="text" 
                            value={client} 
                            onChange={(e) => setClient(e.target.value)} 
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        />
                    </FormField>

                    <FormField label="Nomor WhatsApp">
                        <input 
                            type="text" 
                            placeholder="e.g. 08123456789 atau +65..."
                            value={phoneRaw} 
                            onChange={(e) => setPhoneRaw(e.target.value)} 
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        />
                    </FormField>

                    <FormField label="Jenis Tugas Follow-Up">
                        <input 
                            type="text" 
                            value={type} 
                            onChange={(e) => setType(e.target.value)} 
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Tanggal Tanggung Jawab">
                            <input 
                                type="date" 
                                value={dueDate || ''} 
                                onChange={(e) => setDueDate(e.target.value)} 
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            />
                            <div className="flex items-center gap-1 mt-1 text-[10px]">
                                <button type="button" onClick={() => setDueDate(getAsiaJakartaDate())} className="px-1.5 py-0.5 bg-[#202028] hover:bg-[#282832] text-[#c5a059] rounded border border-[#2e2e38] font-medium">Hari Ini</button>
                                <button type="button" onClick={() => setDueDate(addDaysToDate(getAsiaJakartaDate(), 1))} className="px-1.5 py-0.5 bg-[#202028] hover:bg-[#282832] text-zinc-300 rounded border border-[#2e2e38] font-medium">+Besok</button>
                                <button type="button" onClick={() => setDueDate(addDaysToDate(getAsiaJakartaDate(), 3))} className="px-1.5 py-0.5 bg-[#202028] hover:bg-[#282832] text-zinc-300 rounded border border-[#2e2e38] font-medium">+3 Hari</button>
                                {dueDate && <button type="button" onClick={() => setDueDate('')} className="px-1.5 py-0.5 text-zinc-500 hover:text-zinc-300">✕ Hapus</button>}
                            </div>
                        </FormField>
                        <FormField label="Status">
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            >
                                {TASK_STATUS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#26262d]">
                    <button 
                        onClick={onCancel} 
                        disabled={isSaving} 
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 bg-[#202028] hover:text-white transition-colors min-h-[44px] touch-manipulation active:scale-95"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="gold-btn px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#c5a059]/25 transition-all min-h-[44px] touch-manipulation active:scale-95"
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
};
