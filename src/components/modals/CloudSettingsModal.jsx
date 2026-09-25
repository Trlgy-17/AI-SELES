// File: src/components/modals/CloudSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons.jsx';
import { FormField } from '../common/FormField.jsx';

export const CloudSettingsModal = ({ isOpen, onClose, onSaveConfig, currentConfig, syncStatus, onForceLocalMode }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [err, setErr] = useState(null);
    const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    useEffect(() => {
        if (isOpen) {
            if (currentConfig) {
                setJsonInput(JSON.stringify(currentConfig, null, 2));
            } else {
                setJsonInput('');
            }
            setErr(null);
        }
    }, [isOpen, currentConfig]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!jsonInput.trim()) {
            onSaveConfig(null);
            onClose();
            return;
        }
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.apiKey || !parsed.projectId) {
                setErr("Objek konfigurasi Firebase harus memiliki properti 'apiKey' dan 'projectId'.");
                return;
            }
            onSaveConfig(parsed);
            onClose();
        } catch (e) {
            setErr("Format JSON tidak valid: " + e.message);
        }
    };

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="cloud-modal-title" 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto safe-padding-bottom safe-padding-top"
        >
            <div className="bg-[#15151a] border border-[#26262d] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto max-h-[90dvh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-[#26262d] pb-3">
                    <h3 id="cloud-modal-title" className="serif-font font-bold text-base sm:text-lg text-white flex items-center gap-2">
                        <Icons.Settings /> Pengaturan Cloud & Database Firebase
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white font-bold p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg" aria-label="Tutup modal">✕</button>
                </div>

                {err && (
                    <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold" role="alert">
                        ⚠️ {err}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="p-3 bg-[#1c1c24] rounded-xl border border-[#2e2e38] text-xs space-y-1.5">
                        <p className="font-bold text-zinc-300">Status Koneksi Saat Ini:</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400' : syncStatus === 'checking' ? 'bg-amber-400 animate-pulse' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-zinc-500'}`}></span>
                            <span className="font-semibold text-zinc-200">
                                {syncStatus === 'synced' ? 'Terhubung ke Cloud Firestore' : syncStatus === 'checking' ? 'Memeriksa koneksi...' : syncStatus === 'error' ? 'Koneksi Cloud Gagal / Tidak Diizinkan' : 'Mode Penyimpanan Lokal (Offline)'}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-[#2a2a35] text-zinc-400">
                            <p>Domain aktif: <code className="text-[#c5a059] bg-[#121216] px-1.5 py-0.5 rounded font-mono">{currentHostname}</code></p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">💡 Pastikan domain terdaftar di Firebase Console &rarr; Auth &rarr; Settings &rarr; Authorized Domains.</p>
                        </div>
                    </div>

                    <FormField 
                        label="JSON Konfigurasi Firebase Web App" 
                        helperText="Salin dari Firebase Console -> Project Settings -> General -> Your apps."
                    >
                        <textarea 
                            rows="6"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='{\n  "apiKey": "AIzaSy...",\n  "authDomain": "proyek.firebaseapp.com",\n  "projectId": "proyek-id"\n}'
                            className="w-full bg-[#111115] font-mono text-xs border border-[#26262d] rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059]"
                        ></textarea>
                    </FormField>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-3 border-t border-[#26262d]">
                    <button 
                        onClick={onForceLocalMode} 
                        className="text-xs font-semibold text-zinc-400 hover:text-amber-400 underline underline-offset-2 py-2 min-h-[44px] flex items-center justify-center sm:justify-start"
                    >
                        Gunakan Mode Offline Saja
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 bg-[#202028] hover:text-white min-h-[44px] touch-manipulation active:scale-95">
                            Batal
                        </button>
                        <button onClick={handleSave} className="flex-1 sm:flex-initial gold-btn px-5 py-2.5 rounded-xl text-xs font-bold min-h-[44px] touch-manipulation active:scale-95">
                            Simpan & Terapkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
