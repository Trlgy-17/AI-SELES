// File: src/components/modals/ApiKeyModal.jsx
import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons.jsx';
import { FormField } from '../common/FormField.jsx';

export const ApiKeyModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    currentProvider = 'gemini',
    currentKey = '', 
    keyStorageMode = 'local', 
    selectedModel = 'gemini-3.5-flash-lite', 
    customProxyUrl = '',
    currentOpenaiBaseUrl = 'https://api.openai.com/v1',
    currentOpenaiApiKey = '',
    currentOpenaiModel = 'gpt-4o-mini'
}) => {
    const [activeProvider, setActiveProvider] = useState('gemini');
    
    // Gemini Settings
    const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
    const [geminiModelInput, setGeminiModelInput] = useState('gemini-3.5-flash-lite');
    const [geminiProxyInput, setGeminiProxyInput] = useState('');

    // OpenAI / Custom Provider Settings
    const [openaiBaseUrlInput, setOpenaiBaseUrlInput] = useState('https://api.openai.com/v1');
    const [openaiApiKeyInput, setOpenaiApiKeyInput] = useState('');
    const [openaiModelInput, setOpenaiModelInput] = useState('gpt-4o-mini');

    // Storage Mode
    const [modeInput, setModeInput] = useState('local');

    useEffect(() => {
        if (isOpen) {
            setActiveProvider(currentProvider || 'gemini');
            setGeminiApiKeyInput(currentKey || '');
            setGeminiModelInput(selectedModel || 'gemini-3.5-flash-lite');
            setGeminiProxyInput(customProxyUrl || '');

            setOpenaiBaseUrlInput(currentOpenaiBaseUrl || 'https://api.openai.com/v1');
            setOpenaiApiKeyInput(currentOpenaiApiKey || '');
            setOpenaiModelInput(currentOpenaiModel || 'gpt-4o-mini');

            setModeInput(keyStorageMode || 'local');
        }
    }, [isOpen, currentProvider, currentKey, selectedModel, customProxyUrl, currentOpenaiBaseUrl, currentOpenaiApiKey, currentOpenaiModel, keyStorageMode]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const applyPreset = (preset) => {
        if (preset === 'openai') {
            setOpenaiBaseUrlInput('https://api.openai.com/v1');
            setOpenaiModelInput('gpt-4o-mini');
        } else if (preset === 'openrouter') {
            setOpenaiBaseUrlInput('https://openrouter.ai/api/v1');
            setOpenaiModelInput('openai/gpt-4o-mini');
        } else if (preset === 'deepseek') {
            setOpenaiBaseUrlInput('https://api.deepseek.com/v1');
            setOpenaiModelInput('deepseek-chat');
        } else if (preset === 'groq') {
            setOpenaiBaseUrlInput('https://api.groq.com/openai/v1');
            setOpenaiModelInput('llama-3.3-70b-versatile');
        } else if (preset === 'ollama') {
            setOpenaiBaseUrlInput('http://localhost:11434/v1');
            setOpenaiModelInput('qwen2.5:7b');
        }
    };

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="api-modal-title" 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto"
        >
            <div className="bg-[#15151a] border border-[#26262d] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8">
                <div className="flex justify-between items-center border-b border-[#26262d] pb-3.5">
                    <div>
                        <h3 id="api-modal-title" className="serif-font font-bold text-lg text-white flex items-center gap-2">
                            <Icons.Key /> Pengaturan AI Provider & API
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Konfigurasi Google Gemini atau Custom Provider format OpenAI API.</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white font-bold p-1 rounded-lg" aria-label="Tutup modal">✕</button>
                </div>

                {/* Tab Pemilihan Provider */}
                <div className="grid grid-cols-2 p-1 bg-[#1c1c24] rounded-2xl border border-[#2e2e38] text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setActiveProvider('gemini')}
                        className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeProvider === 'gemini' 
                                ? 'bg-gradient-to-r from-[#c5a059] to-[#b8972e] text-[#0d0d0d] shadow-md shadow-[#c5a059]/20' 
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <span>✨ Google Gemini</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveProvider('openai')}
                        className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeProvider === 'openai' 
                                ? 'bg-gradient-to-r from-[#c5a059] to-[#b8972e] text-[#0d0d0d] shadow-md shadow-[#c5a059]/20' 
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <span>⚡ Custom (OpenAI API)</span>
                    </button>
                </div>

                {/* Form Google Gemini */}
                {activeProvider === 'gemini' && (
                    <div className="space-y-4 animate-fade-in">
                        <FormField label="Google Gemini API Key" helperText="Dapatkan gratis di Google AI Studio (aistudio.google.com).">
                            <input 
                                type="password" 
                                placeholder="AIzaSy... / AQ.Ab8..." 
                                value={geminiApiKeyInput}
                                onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            />
                        </FormField>

                        <FormField label="Pilihan Model Gemini" helperText="Flash-Lite memberikan kecepatan respon sub-2 detik.">
                            <select 
                                value={geminiModelInput}
                                onChange={(e) => setGeminiModelInput(e.target.value)}
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            >
                                <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (⚡ Ultra Cepat ~1-2 detik / Sangat Direkomendasikan)</option>
                                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (⚡ Cepat & Efisien)</option>
                                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Standar Seimbang)</option>
                                <option value="gemini-3.6-flash">Gemini 3.6 Flash (High Quality / Lebih Teliti)</option>
                            </select>
                        </FormField>

                        <FormField label="Custom Proxy URL (Opsional / Enterprise)" helperText="Kosongkan jika memanggil Google AI secara langsung">
                            <input 
                                type="text" 
                                placeholder="https://api.nacirastudio.com/gemini-proxy" 
                                value={geminiProxyInput}
                                onChange={(e) => setGeminiProxyInput(e.target.value)}
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            />
                        </FormField>
                    </div>
                )}

                {/* Form OpenAI Compatible Provider */}
                {activeProvider === 'openai' && (
                    <div className="space-y-4 animate-fade-in">
                        {/* Quick Presets */}
                        <div>
                            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                                Preset Provider Cepat:
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { id: 'openai', label: 'OpenAI (Official)' },
                                    { id: 'openrouter', label: 'OpenRouter' },
                                    { id: 'deepseek', label: 'DeepSeek' },
                                    { id: 'groq', label: 'Groq Cloud' },
                                    { id: 'ollama', label: 'Ollama (Local)' }
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => applyPreset(p.id)}
                                        className="text-[11px] font-semibold px-2.5 py-1 bg-[#1f1f28] hover:bg-[#c5a059] hover:text-black text-zinc-300 rounded-lg border border-[#33333e] transition-colors"
                                    >
                                        + {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <FormField label="Base URL API" helperText="Endpoint format OpenAI. Contoh: https://api.openai.com/v1 atau https://openrouter.ai/api/v1">
                            <input 
                                type="text" 
                                placeholder="https://api.openai.com/v1" 
                                value={openaiBaseUrlInput}
                                onChange={(e) => setOpenaiBaseUrlInput(e.target.value)}
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 font-mono text-xs"
                            />
                        </FormField>

                        <FormField label="API Key Provider" helperText="Kunci API format Bearer Token (sk-... / gsk_... / or-...)">
                            <input 
                                type="password" 
                                placeholder="sk-proj-... / gsk_... (Kosongkan jika menggunakan Ollama lokal)" 
                                value={openaiApiKeyInput}
                                onChange={(e) => setOpenaiApiKeyInput(e.target.value)}
                                className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            />
                        </FormField>

                        <FormField label="Model Name" helperText="Nama model yang dituju pada provider tersebut">
                            <div className="space-y-2">
                                <input 
                                    type="text" 
                                    placeholder="gpt-4o-mini / deepseek-chat / llama-3.3-70b-versatile" 
                                    value={openaiModelInput}
                                    onChange={(e) => setOpenaiModelInput(e.target.value)}
                                    className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 font-mono text-xs"
                                />
                                <div className="flex flex-wrap gap-1">
                                    {['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'llama-3.3-70b-versatile', 'qwen-2.5'].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setOpenaiModelInput(m)}
                                            className="text-[10px] px-2 py-0.5 rounded bg-[#181820] text-zinc-400 hover:text-[#c5a059] border border-[#282832]"
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </FormField>
                    </div>
                )}

                {/* Mode Penyimpanan */}
                <div className="pt-2 border-t border-[#26262d]">
                    <FormField label="Mode Penyimpanan Kunci">
                        <select 
                            value={modeInput}
                            onChange={(e) => setModeInput(e.target.value)}
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                        >
                            <option value="local">Simpan di Browser Ini (Local Storage — Siap Digunakan Kapan Saja)</option>
                            <option value="session">Simpan di Sesi Saja (In-Memory / Dihapus Saat Tab Ditutup)</option>
                        </select>
                    </FormField>
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-3 pt-3 border-t border-[#26262d]">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-[#202028] hover:text-white"
                    >
                        Batal
                    </button>
                    <button 
                        type="button"
                        onClick={() => {
                            onSave({
                                provider: activeProvider,
                                apiKey: geminiApiKeyInput.trim(),
                                model: geminiModelInput,
                                proxyUrl: geminiProxyInput.trim(),
                                openaiBaseUrl: openaiBaseUrlInput.trim(),
                                openaiApiKey: openaiApiKeyInput.trim(),
                                openaiModel: openaiModelInput.trim() || 'gpt-4o-mini',
                                storageMode: modeInput
                            });
                            onClose();
                        }} 
                        className="gold-btn px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#c5a059]/25"
                    >
                        Simpan Pengaturan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
