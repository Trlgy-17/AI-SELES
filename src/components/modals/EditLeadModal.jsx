// File: src/components/modals/EditLeadModal.jsx
import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons.jsx';
import { FormField } from '../common/FormField.jsx';
import { normalizePhone } from '../../js/utils/phone.js';
import { getAsiaJakartaIso } from '../../js/utils/date.js';
import { LEAD_STATUS_OPTIONS } from '../../js/constants.js';

export const EditLeadModal = ({ isOpen, lead, allLeads = [], onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [phoneRaw, setPhoneRaw] = useState('');
    const [project, setProject] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [status, setStatus] = useState('Prospek / Survey');
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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isSaving) onCancel();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel, isSaving]);

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
            cleanVal = num;
        }

        setIsSaving(true);
        const phoneNormalized = normalizePhone(phoneRaw);
        await onSave({
            ...lead,
            name: name.trim().slice(0, 100),
            phoneRaw: phoneRaw.trim().slice(0, 30),
            phoneNormalized: phoneNormalized,
            project: project.trim().slice(0, 200),
            value: cleanVal,
            status: status,
            updatedAt: getAsiaJakartaIso()
        });
        setIsSaving(false);
    };

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="edit-lead-title" 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
            <div className="bg-[#15151a] border border-[#26262d] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-[#26262d] pb-3">
                    <h3 id="edit-lead-title" className="serif-font font-bold text-lg text-white flex items-center gap-2">
                        <Icons.Edit /> Edit Data Prospek Klien
                    </h3>
                    <button 
                        onClick={onCancel} 
                        disabled={isSaving} 
                        className="text-zinc-400 hover:text-white font-bold" 
                        aria-label="Tutup modal edit"
                    >
                        ✕
                    </button>
                </div>

                {err && (
                    <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold" role="alert">
                        ⚠️ {err}
                    </div>
                )}

                {dupWarning && (
                    <div className="p-3 bg-amber-950/80 border border-amber-800 text-amber-200 rounded-xl text-xs font-semibold" role="alert">
                        ⚠️ {dupWarning}
                    </div>
                )}

                <div className="space-y-3">
                    <FormField label="Nama Klien" required>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        />
                    </FormField>
                    <FormField 
                        label="Nomor WhatsApp (Raw)" 
                        helperText={phoneRaw ? (normalizePhone(phoneRaw) ? `Tersimpan: +${normalizePhone(phoneRaw)}` : "Nomor tidak valid (akan disimpan kosong)") : "Format bebas: 08..., +62..., atau spasi"}
                    >
                        <input 
                            type="text" 
                            placeholder="e.g. 08123456789 atau +65..."
                            value={phoneRaw} 
                            onChange={(e) => setPhoneRaw(e.target.value)} 
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        />
                    </FormField>
                    <FormField label="Detail Proyek Interior">
                        <input 
                            type="text" 
                            value={project} 
                            onChange={(e) => setProject(e.target.value)} 
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Estimasi Nilai Proyek (Rp)" helperText="Kosongkan jika belum ada estimasi">
                            <input 
                                type="number" 
                                placeholder="e.g. 25000000"
                                value={valueInput} 
                                onChange={(e) => setValueInput(e.target.value)} 
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            />
                        </FormField>
                        <FormField label="Status Prospek">
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            >
                                {LEAD_STATUS_OPTIONS.map(opt => (
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
                        className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-[#202028] hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="gold-btn px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#c5a059]/25 transition-all"
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
};
