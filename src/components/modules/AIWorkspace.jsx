// File: src/components/modules/AIWorkspace.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons.jsx';
import { FormField } from '../common/FormField.jsx';
import { ApiKeyModal } from '../modals/ApiKeyModal.jsx';
import { StorageService } from '../../js/services/storage.js';
import { AIService } from '../../js/services/ai.js';
import { copyToClipboard } from '../../js/utils/clipboard.js';
import { optimizeImageForAI } from '../../js/utils/image.js';
import { DEFAULT_GEMINI_API_KEY, DEFAULT_GEMINI_MODEL, AI_RESPONSE_MODES } from '../../js/constants.js';
import { buildWaLink, formatDisplayPhone } from '../../js/utils/phone.js';
import { TelemetryService } from '../../js/services/telemetry.js';

const ADMIN_DIRECTIVE_SHORTCUTS = [
    { label: 'Follow Up Klien', text: 'follow up klien ini dengan ramah dan tanyakan kelanjutan rencana interiornya', icon: '👋', mode: 'FOLLOW_UP' },
    { label: 'Arahkan ke Survei', text: 'arahkan klien untuk booking jadwal survei pengukuran lokasi gratis tanpa ikatan', icon: '📍', mode: 'SURVEY_INVITATION' },
    { label: 'Edukasi Harga & Bahan', text: 'jelaskan kisaran harga per meter transparan dan keunggulan bahan multipleks 18mm padat + PVC waterproof', icon: '💰', mode: 'PRICE_EXPLANATION' },
    { label: 'Atasi Ragu / Budget', text: 'atasi keberatan harga klien dengan solusi fleksibel dan bandingkan mutu multipleks vs serbuk kayu mdf', icon: '🛡️', mode: 'OBJECTION_HANDLING' },
    { label: 'Kunci DP Antrian', text: 'rekapitulasi rencana dan tawarkan untuk kunci slot antrian produksi workshop dengan komitmen DP aman 50%', icon: '🤝', mode: 'CLOSING' },
    { label: 'Tanyakan Ukuran', text: 'tanyakan perkiraan ukuran ruangan atau denah layout yang sudah ada secara santun', icon: '📐', mode: 'SMART_REPLY' }
];

export const AIWorkspace = ({ 
    activeBrand, 
    currentUser, 
    crmLeads = [], 
    showToast 
}) => {
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [optimizedImagePart, setOptimizedImagePart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingReply, setStreamingReply] = useState('');
    const [feedbackGiven, setFeedbackGiven] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [copiedKey, setCopiedKey] = useState(null);
    const [aiError, setAiError] = useState(null);
    
    // Mode Respon AI
    const [selectedMode, setSelectedMode] = useState('SMART_REPLY');
    const [activeReplyTab, setActiveReplyTab] = useState('recommended');

    // Client Memory State
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [clientMemory, setClientMemory] = useState({
        name: '',
        location: '',
        dimensions: '',
        budget: '',
        projectType: '',
        notes: ''
    });
    const [showMemoryDrawer, setShowMemoryDrawer] = useState(false);

    // AI Provider States
    const [aiProvider, setAiProvider] = useState(() => StorageService.getItem('nacira_ai_provider', 'gemini'));
    const [customApiKey, setCustomApiKey] = useState(() => {
        const storedKey = sessionStorage.getItem('nacira_session_gemini_key') || StorageService.getItem('nacira_gemini_api_key', '');
        return storedKey || DEFAULT_GEMINI_API_KEY;
    });
    const [keyStorageMode, setKeyStorageMode] = useState(() => {
        if (sessionStorage.getItem('nacira_session_gemini_key') || sessionStorage.getItem('nacira_session_openai_key')) return 'session';
        return 'local';
    });
    const [selectedModel, setSelectedModel] = useState(() => {
        const saved = StorageService.getItem('nacira_gemini_model', '');
        if (!saved || saved === 'gemini-1.5-flash' || saved === 'gemini-2.5-flash') {
            return DEFAULT_GEMINI_MODEL;
        }
        return saved;
    });
    const [customProxyUrl, setCustomProxyUrl] = useState(() => StorageService.getItem('nacira_custom_proxy_url', ''));

    // OpenAI / Custom Provider States
    const [openaiBaseUrl, setOpenaiBaseUrl] = useState(() => StorageService.getItem('nacira_openai_base_url', 'https://api.openai.com/v1'));
    const [openaiApiKey, setOpenaiApiKey] = useState(() => {
        return sessionStorage.getItem('nacira_session_openai_key') || StorageService.getItem('nacira_openai_api_key', '');
    });
    const [openaiModel, setOpenaiModel] = useState(() => StorageService.getItem('nacira_openai_model', 'gpt-4o-mini'));

    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const fileInputRef = useRef(null);

    const brandName = activeBrand?.brandName || 'HOMEPUTRA INTERIOR';
    const adminName = activeBrand?.adminName || 'Admin Marketing';
    const serviceArea = activeBrand?.serviceArea || 'Bandung & Jabodetabek';

    // Sinkronkan memori klien jika lead dipilih dari dropdown
    const handleSelectLead = (e) => {
        const leadId = e.target.value;
        setSelectedLeadId(leadId);
        if (!leadId) {
            setClientMemory({ name: '', location: '', dimensions: '', budget: '', projectType: '', notes: '' });
            return;
        }
        const found = crmLeads.find(l => l.id === leadId);
        if (found) {
            setClientMemory(prev => ({
                ...prev,
                name: found.name || '',
                projectType: found.project || '',
                budget: found.value ? `Rp ${found.value.toLocaleString('id-ID')}` : prev.budget
            }));
            setShowMemoryDrawer(true);
            showToast(`Memori klien "${found.name}" dimuat.`);
        }
    };

    const handleSaveKeySettings = ({ 
        provider, 
        apiKey, 
        model, 
        proxyUrl, 
        openaiBaseUrl: newBaseUrl, 
        openaiApiKey: newOpenaiKey, 
        openaiModel: newOpenaiModel, 
        storageMode 
    }) => {
        const cleanGeminiKey = apiKey.trim();
        const geminiKeyToUse = cleanGeminiKey || DEFAULT_GEMINI_API_KEY;
        const cleanOpenaiKey = (newOpenaiKey || '').trim();
        const cleanOpenaiBase = (newBaseUrl || 'https://api.openai.com/v1').trim();
        const cleanOpenaiModel = (newOpenaiModel || 'gpt-4o-mini').trim();

        setAiProvider(provider || 'gemini');
        setCustomApiKey(geminiKeyToUse);
        setKeyStorageMode(storageMode);
        setSelectedModel(model || DEFAULT_GEMINI_MODEL);
        setCustomProxyUrl((proxyUrl || '').trim());

        setOpenaiBaseUrl(cleanOpenaiBase);
        setOpenaiApiKey(cleanOpenaiKey);
        setOpenaiModel(cleanOpenaiModel);

        StorageService.setItem('nacira_ai_provider', provider || 'gemini');
        StorageService.setItem('nacira_gemini_model', model || DEFAULT_GEMINI_MODEL);
        StorageService.setItem('nacira_custom_proxy_url', (proxyUrl || '').trim());
        StorageService.setItem('nacira_openai_base_url', cleanOpenaiBase);
        StorageService.setItem('nacira_openai_model', cleanOpenaiModel);

        if (storageMode === 'session') {
            sessionStorage.setItem('nacira_session_gemini_key', cleanGeminiKey);
            sessionStorage.setItem('nacira_session_openai_key', cleanOpenaiKey);
            StorageService.removeItem('nacira_gemini_api_key');
            StorageService.removeItem('nacira_openai_api_key');
        } else {
            StorageService.setItem('nacira_gemini_api_key', cleanGeminiKey);
            StorageService.setItem('nacira_openai_api_key', cleanOpenaiKey);
            sessionStorage.removeItem('nacira_session_gemini_key');
            sessionStorage.removeItem('nacira_session_openai_key');
        }

        setShowApiKeyModal(false);
        showToast("Pengaturan AI Provider & API berhasil disimpan!");
    };

    const processImageFile = async (file) => {
        if (!file.type.startsWith('image/')) {
            setAiError("Format file harus berupa gambar (PNG, JPG, WEBP).");
            return;
        }
        if (file.size > 12 * 1024 * 1024) {
            setAiError("Ukuran gambar terlalu besar. Maksimal 12MB.");
            return;
        }
        setAiError(null);
        setSelectedImage(file);

        try {
            // Kompresi Canvas cerdas (~95% penghematan ukuran tanpa mengurangi teks WA)
            const optimized = await optimizeImageForAI(file, 1200, 0.85);
            setImagePreview(optimized.dataUrl);
            setOptimizedImagePart({
                inlineData: {
                    data: optimized.base64,
                    mimeType: optimized.mimeType
                }
            });
            showToast("Screenshot chat berhasil dimuat & dioptimasi!");
        } catch (err) {
            console.warn("[AIWorkspace] Gagal kompresi canvas, fallback pembacaan dasar:", err);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
                setOptimizedImagePart({
                    inlineData: {
                        data: reader.result.split(',')[1],
                        mimeType: file.type || 'image/png'
                    }
                });
                showToast("Screenshot chat berhasil dimuat!");
            };
            reader.onerror = () => {
                setAiError("Gagal membaca file gambar. Silakan pilih kembali.");
                removeImage();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            processImageFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        processImageFile(file);
                        e.preventDefault();
                        break;
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setOptimizedImagePart(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const generateReply = async () => {
        if (!inputText.trim() && !selectedImage && !imagePreview) {
            setAiError("Mohon masukkan teks chat atau unggah/paste screenshot percakapan WhatsApp.");
            return;
        }

        const activeGeminiKey = customApiKey.trim();
        const proxyUrl = customProxyUrl.trim();

        if (aiProvider === 'gemini') {
            if (!activeGeminiKey && !proxyUrl) {
                setAiError("API Key Gemini belum diatur. Klik 'Atur API Key' di atas.");
                setShowApiKeyModal(true);
                return;
            }
        } else if (aiProvider === 'openai') {
            const cleanBase = (openaiBaseUrl || '').trim();
            if (!cleanBase) {
                setAiError("Base URL OpenAI belum diisi. Klik 'Atur API Key' untuk mengonfigurasi.");
                setShowApiKeyModal(true);
                return;
            }
        }

        if (isLoading) return;

        setIsLoading(true);
        setAiError(null);
        setAiResponse(null);
        setStreamingReply('');
        setFeedbackGiven(null);

        try {
            const imagePart = optimizedImagePart || (imagePreview ? {
                inlineData: {
                    data: imagePreview.split(',')[1],
                    mimeType: selectedImage ? selectedImage.type : 'image/jpeg'
                }
            } : null);

            // Filter memori klien yang terisi
            const filteredMemory = Object.fromEntries(
                Object.entries(clientMemory).filter(([_, v]) => typeof v === 'string' && v.trim() !== '')
            );

            const result = await AIService.generateWhatsAppReply({
                provider: aiProvider,
                inputText: inputText.trim(),
                imagePart,
                activeBrand,
                clientMemory: Object.keys(filteredMemory).length > 0 ? filteredMemory : null,
                responseMode: selectedMode,
                onStreamChunk: ({ partialReply, isDone }) => {
                    if (partialReply) setStreamingReply(partialReply);
                    if (isDone) setStreamingReply('');
                },
                customApiKey: activeGeminiKey,
                selectedModel,
                customProxyUrl: proxyUrl,
                openaiBaseUrl,
                openaiApiKey,
                openaiModel
            });

            setAiResponse(result);
            setActiveReplyTab('recommended');

            // Auto-update extracted memory jika ada informasi baru terdeteksi
            if (result.clientAnalysis?.extractedLocation && !clientMemory.location) {
                setClientMemory(prev => ({ ...prev, location: result.clientAnalysis.extractedLocation }));
            }
            if (result.clientAnalysis?.extractedBudget && !clientMemory.budget) {
                setClientMemory(prev => ({ ...prev, budget: result.clientAnalysis.extractedBudget }));
            }

            const latencyLabel = result.metrics?.formattedSummary || '';
            showToast(`Rekomendasi balasan berhasil diracik! ${latencyLabel}`);
        } catch (error) {
            console.error("[AI Workspace] Error:", error);
            setAiError(error.message);
        } finally {
            setIsLoading(false);
            setStreamingReply('');
        }
    };

    const handleCopy = async (replyKey, textToCopy) => {
        if (!textToCopy) return;
        const success = await copyToClipboard(textToCopy);
        if (success) {
            setCopiedKey(replyKey);
            showToast("Balasan WhatsApp berhasil disalin!");
            TelemetryService.logEvent('AI_REPLY_COPIED', {
                brandId: activeBrand?.id,
                brandName: activeBrand?.brandName,
                replyKey,
                intent: aiResponse?.clientAnalysis?.intent
            });
            setTimeout(() => setCopiedKey(null), 2500);
        } else {
            setAiError("Gagal menyalin teks ke clipboard.");
        }
    };

    const handleGiveFeedback = (feedbackType) => {
        setFeedbackGiven(feedbackType);
        TelemetryService.logEvent('AI_FEEDBACK_GIVEN', {
            brandId: activeBrand?.id,
            brandName: activeBrand?.brandName,
            feedback: feedbackType,
            intent: aiResponse?.clientAnalysis?.intent,
            stage: aiResponse?.clientAnalysis?.stage,
            responseMode: selectedMode,
            reply: primaryReplyText
        });
        showToast(feedbackType === 'POSITIVE' ? 'Terima kasih! Feedback positif dicatat.' : 'Feedback dicatat untuk perbaikan AI.');
    };

    const handleApplyDirective = (directiveText, targetMode) => {
        setInputText(directiveText);
        if (targetMode) {
            setSelectedMode(targetMode);
        }
        showToast(`Arahan diterapkan: "${directiveText}"`);
    };

    // Helper untuk warna suhu prospek (HOT / WARM / COLD)
    const getTemperatureBadge = (temp) => {
        const t = (temp || 'WARM').toUpperCase();
        if (t === 'HOT') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                    🔥 HOT PROSPECT
                </span>
            );
        }
        if (t === 'COLD') {
            return (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center gap-1">
                    ❄️ COLD / GHOSTING
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                ⚡ WARM LEAD
            </span>
        );
    };

    const primaryReplyText = aiResponse?.reply || aiResponse?.replies?.recommended || '';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 animate-fade-in">
            {/* SISI KIRI: INPUT CHAT & SCREENSHOT */}
            <div className="lg:col-span-6 space-y-6">
                <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-[#26262d]">
                    {/* Brand Banner Header */}
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3 pb-4 border-b border-[#26262d]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#202028] text-[#c5a059] flex items-center justify-center font-bold text-sm border border-[#33333d]">
                                <Icons.MessageSquare />
                            </div>
                            <div>
                                <div className="text-xs text-zinc-400 font-medium">Workspace Brand Aktif:</div>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                    <span className="text-[#c5a059]">{brandName}</span>
                                    <span className="text-[10px] text-zinc-400 px-2 py-0.5 rounded-full bg-[#1b1b22] border border-[#2e2e38]">
                                        Admin: {adminName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowApiKeyModal(true)}
                            className="text-xs font-semibold px-3 py-1.5 bg-[#202028] hover:bg-[#282832] text-[#c5a059] rounded-full border border-[#33333d] flex items-center gap-1.5 transition-colors shadow-sm"
                            title={aiProvider === 'openai' ? `OpenAI Base: ${openaiBaseUrl} | Model: ${openaiModel}` : `Google Gemini | Model: ${selectedModel}`}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <Icons.Key /> {aiProvider === 'openai' ? `OpenAI (${openaiModel})` : `Gemini (${selectedModel})`}
                        </button>
                    </div>

                    {/* Mode Respon Selector */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                                <span>🎯</span> Mode Respon Strategis:
                            </label>
                            <span className="text-[10px] text-zinc-400 font-medium">
                                Klik untuk mengarahkan taktik AI
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {AI_RESPONSE_MODES.map((mode) => {
                                const isSelected = selectedMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setSelectedMode(mode.id)}
                                        className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between relative group ${
                                            isSelected
                                                ? 'bg-gradient-to-b from-[#c5a059]/20 to-[#1a1712] border-[#c5a059] text-white shadow-lg shadow-[#c5a059]/15 ring-1 ring-[#c5a059]/30'
                                                : 'bg-[#15151a] border-[#26262d] text-zinc-400 hover:border-[#383844] hover:text-zinc-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-1 mb-1">
                                            <span className="text-xs font-bold block text-white leading-tight">
                                                {mode.label}
                                            </span>
                                            {mode.badge && (
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                                    isSelected ? 'bg-[#c5a059] text-[#0d0d0d]' : 'bg-[#202028] text-zinc-400'
                                                }`}>
                                                    {mode.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-[11px] font-medium leading-snug line-clamp-2 ${
                                            isSelected ? 'text-amber-200/90' : 'text-zinc-400 group-hover:text-zinc-300'
                                        }`}>
                                            {mode.desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Strategy Guidance Callout */}
                        {(() => {
                            const activeModeObj = AI_RESPONSE_MODES.find(m => m.id === selectedMode) || AI_RESPONSE_MODES[0];
                            return (
                                <div className="mt-2.5 px-3.5 py-2.5 rounded-xl bg-[#1a1a24] border border-[#c5a059]/30 flex items-center justify-between flex-wrap gap-2 text-xs animate-fade-in shadow-inner">
                                    <span className="text-zinc-300 font-medium flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
                                        <strong className="text-[#c5a059]">Fokus Taktis:</strong>
                                        <span className="text-zinc-200">{activeModeObj.desc}</span>
                                    </span>
                                    <span className="text-[10px] text-zinc-400 bg-[#22222d] px-2 py-0.5 rounded-full border border-[#30303e]">
                                        Tersinkronisasi ke SOP {brandName}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Tautkan Klien & Client Memory Drawer Toggle */}
                    <div className="mb-5 bg-[#15151a] border border-[#26262d] rounded-2xl p-4 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[#c5a059] text-base"><Icons.Brain /></span>
                                <div>
                                    <span className="text-xs font-bold text-white block">Memori Klien (Anti-Tanya Ulang)</span>
                                    <span className="text-[10px] text-zinc-400">Data terkunci tidak akan ditanyakan lagi oleh AI</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {(clientMemory.name || clientMemory.location || clientMemory.dimensions || clientMemory.budget) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setClientMemory({ name: '', location: '', dimensions: '', budget: '', projectType: '', notes: '' });
                                            setSelectedLeadId('');
                                            showToast("Memori klien berhasil dikosongkan.");
                                        }}
                                        className="text-[11px] text-rose-400 hover:text-rose-300 font-medium px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                                        title="Kosongkan seluruh data memori"
                                    >
                                        Reset
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowMemoryDrawer(!showMemoryDrawer)}
                                    className="text-xs text-[#c5a059] hover:underline font-bold px-2.5 py-1 rounded-xl bg-[#202028] border border-[#33333e]"
                                >
                                    {showMemoryDrawer ? 'Tutup Memori' : (clientMemory.location || clientMemory.name ? '✏️ Edit Memori' : '+ Isi Memori')}
                                </button>
                            </div>
                        </div>

                        {/* Quick Active Memory Pills (Ketika Drawer Tertutup) */}
                        {!showMemoryDrawer && (clientMemory.name || clientMemory.location || clientMemory.dimensions || clientMemory.budget || clientMemory.projectType) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#26262d] animate-fade-in">
                                {clientMemory.name && (
                                    <span className="px-2.5 py-1 rounded-xl bg-[#202028] text-zinc-200 text-[11px] font-semibold border border-[#323240] flex items-center gap-1">
                                        👤 {clientMemory.name}
                                    </span>
                                )}
                                {clientMemory.location && (
                                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold border border-emerald-500/35 flex items-center gap-1">
                                        📍 {clientMemory.location}
                                    </span>
                                )}
                                {clientMemory.dimensions && (
                                    <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-400 text-[11px] font-semibold border border-cyan-500/35 flex items-center gap-1">
                                        📏 {clientMemory.dimensions}
                                    </span>
                                )}
                                {clientMemory.budget && (
                                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-400 text-[11px] font-semibold border border-amber-500/35 flex items-center gap-1">
                                        💰 {clientMemory.budget}
                                    </span>
                                )}
                                {clientMemory.projectType && (
                                    <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-400 text-[11px] font-semibold border border-purple-500/35 flex items-center gap-1">
                                        🏠 {clientMemory.projectType}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* CRM Lead Selector Dropdown */}
                        {crmLeads && crmLeads.length > 0 && (
                            <div className="mt-3">
                                <select
                                    value={selectedLeadId}
                                    onChange={handleSelectLead}
                                    className="w-full bg-[#1b1b22] border border-[#2a2a34] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                                >
                                    <option value="">-- Hubungkan dengan Data Klien CRM (Opsional) --</option>
                                    {crmLeads.map(lead => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.name} {lead.project ? `(${lead.project})` : ''} - {lead.status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Drawer Input Memori Klien */}
                        {showMemoryDrawer && (
                            <div className="mt-3 pt-3 border-t border-[#26262d] space-y-3 animate-fade-in">
                                {/* Quick 1-Click City Lock */}
                                <div>
                                    <span className="text-[10px] text-zinc-400 font-bold block mb-1.5">
                                        Kunci Cepat Wilayah (PL DK vs PL LK):
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { label: 'Bandung (PL DK)', loc: 'Bandung Raya' },
                                            { label: 'Tasikmalaya (PL DK)', loc: 'Tasikmalaya' },
                                            { label: 'Cimahi (PL DK)', loc: 'Cimahi' },
                                            { label: 'Jabodetabek (PL LK)', loc: 'Jabodetabek' },
                                            { label: 'Jakarta (PL LK)', loc: 'Jakarta' },
                                            { label: 'Bekasi/Depok (PL LK)', loc: 'Bekasi/Depok' }
                                        ].map((city, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setClientMemory(prev => ({ ...prev, location: city.loc }))}
                                                className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                                                    clientMemory.location?.includes(city.loc)
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                                                        : 'bg-[#1e1e26] text-zinc-400 border-[#2e2e3a] hover:text-white'
                                                }`}
                                            >
                                                + {city.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                    <div>
                                        <label className="text-[10px] text-zinc-400 font-bold block mb-1">Nama Klien</label>
                                        <input
                                            type="text"
                                            value={clientMemory.name}
                                            onChange={(e) => setClientMemory({ ...clientMemory, name: e.target.value })}
                                            placeholder="Contoh: Ibu Rina / Pak Budi"
                                            className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-[#c5a059] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-400 font-bold block mb-1">Lokasi Terkonfirmasi</label>
                                        <input
                                            type="text"
                                            value={clientMemory.location}
                                            onChange={(e) => setClientMemory({ ...clientMemory, location: e.target.value })}
                                            placeholder="Contoh: Podomoro Park Bandung"
                                            className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-[#c5a059] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-400 font-bold block mb-1">Ukuran / Dimensi Ruangan</label>
                                        <input
                                            type="text"
                                            value={clientMemory.dimensions}
                                            onChange={(e) => setClientMemory({ ...clientMemory, dimensions: e.target.value })}
                                            placeholder="Contoh: 3.5 meter lari (L-Shape)"
                                            className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-[#c5a059] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-400 font-bold block mb-1">Estimasi Budget</label>
                                        <input
                                            type="text"
                                            value={clientMemory.budget}
                                            onChange={(e) => setClientMemory({ ...clientMemory, budget: e.target.value })}
                                            placeholder="Contoh: Rp 25jt - 30jt"
                                            className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-[#c5a059] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {aiError && (
                        <div className="mb-4 p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2" role="alert">
                            <span>⚠️</span> {aiError}
                        </div>
                    )}

                    {/* Chat Text / Directive Input & Screenshot Container */}
                    <div className="space-y-5">
                        <div className="space-y-3">
                        <FormField 
                            label={selectedImage || imagePreview ? "💬 Perintah / Arahan Khusus Admin" : "Pesan Chat Calon Klien / Perintah Admin"} 
                            helperText={selectedImage || imagePreview ? "Ketik instruksi untuk AI (misal: 'follow up klien ini', 'arahkan ke survei', 'tanyakan ukuran')" : "Ketik pesan calon klien atau instruksi kerja admin"}
                        >
                            <textarea 
                                className="w-full bg-[#15151a] border border-[#26262d] rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] transition-all resize-none shadow-inner text-zinc-100 placeholder:text-zinc-600"
                                rows="3"
                                placeholder={selectedImage || imagePreview 
                                    ? "Contoh: 'follow up klien ini dengan sopan', 'arahkan untuk booking survei akhir pekan ini', 'tawarkan opsi penyesuaian budget'..." 
                                    : `Contoh: 'Halo ${brandName}, mau tanya bikin kitchen set multipleks minimalis 3 meter di Bandung berapa ya?' atau ketik perintah: 'follow up klien ini'`}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            ></textarea>
                        </FormField>

                        {/* Quick Directive Shortcut Chips */}
                        <div className="space-y-1.5 pt-0.5">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <span>⚡</span> Arahan Cepat Admin:
                                </span>
                                {inputText && (
                                    <button 
                                        type="button" 
                                        onClick={() => setInputText('')} 
                                        className="text-zinc-500 hover:text-zinc-300 text-[10px] underline underline-offset-2"
                                    >
                                        Bersihkan
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {ADMIN_DIRECTIVE_SHORTCUTS.map((chip, idx) => {
                                    const isSelected = inputText === chip.text;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleApplyDirective(chip.text, chip.mode)}
                                            className={`text-xs px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 font-medium ${
                                                isSelected
                                                    ? 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/50 font-bold shadow-sm'
                                                    : 'bg-[#1a1a22] text-zinc-300 border-[#2e2e38] hover:border-[#c5a059]/40 hover:text-white hover:bg-[#202028]'
                                            }`}
                                        >
                                            <span>{chip.icon}</span>
                                            <span>{chip.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                        {/* Screenshot Input */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Screenshot Chat WhatsApp</label>
                                <span className="text-[11px] font-semibold text-[#c5a059] bg-[#202028] px-2.5 py-0.5 rounded-md">💡 Klik atau Tekan Ctrl + V</span>
                            </div>
                            
                            {!imagePreview ? (
                                <div 
                                    className="border-2 border-dashed border-[#33333d] rounded-2xl p-8 text-center hover:bg-[#1a1a22]/60 hover:border-[#c5a059] transition-all cursor-pointer group bg-[#15151a]/50"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                            processImageFile(e.dataTransfer.files[0]);
                                        }
                                    }}
                                >
                                    <div className="mx-auto w-14 h-14 bg-[#202028] rounded-2xl flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform mb-3 shadow-md">
                                        <Icons.Image />
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-200">Klik untuk unggah atau <span className="text-[#c5a059] underline underline-offset-2">Paste (Ctrl+V)</span></p>
                                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP (Otomatis dikompresi cepat)</p>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImageUpload} 
                                        accept="image/png, image/jpeg, image/webp" 
                                        className="hidden" 
                                    />
                                </div>
                            ) : (
                                <div className="relative rounded-2xl border border-[#33333d] overflow-hidden bg-black group shadow-lg">
                                    <img src={imagePreview} alt="Preview Screenshot" className="w-full h-52 object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-4">
                                        <span className="text-xs font-medium text-white bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md">Screenshot WhatsApp Terlampir</span>
                                        <button 
                                            onClick={removeImage}
                                            className="bg-black/80 hover:bg-black text-rose-400 p-2 rounded-xl shadow-lg transition-transform hover:scale-105"
                                            aria-label="Hapus screenshot yang terlampir"
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        <div className="pt-2">
                            <button 
                                onClick={generateReply}
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold shadow-xl transition-all ${
                                    isLoading ? 'bg-[#2a2a30] text-zinc-500 cursor-not-allowed' : 'gold-btn shadow-[#c5a059]/25 hover:scale-[1.01]'
                                }`}
                            >
                                {isLoading ? (
                                    <React.Fragment>
                                        <svg className="animate-spin h-5 w-5 text-[#c5a059]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Meracik Rekomendasi Balasan Terbaik...</span>
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <Icons.Zap /> 
                                        <span>⚡ Generate Rekomendasi Balasan ({brandName})</span>
                                    </React.Fragment>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SISI KANAN: REKOMENDASI UTAMA BALASAN & SMART CONTEXT PANEL */}
            <div className="lg:col-span-6 space-y-6">
                {isLoading ? (
                    streamingReply ? (
                        <div className="bg-[#15151a] rounded-3xl shadow-2xl border border-[#26262d] overflow-hidden flex flex-col animate-fade-in p-6 min-h-[360px]">
                            <div className="flex items-center justify-between pb-4 border-b border-[#26262d]">
                                <span className="px-2.5 py-1 rounded-xl bg-[#c5a059]/20 text-[#c5a059] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                                    ⚡ Sedang Mengetik Balasan WhatsApp...
                                </span>
                                <span className="text-[11px] text-zinc-400 font-mono">Live Stream</span>
                            </div>
                            <div className="bg-[#1b1b22] border border-[#26262d] rounded-2xl p-5 mt-4 relative">
                                <p className="text-zinc-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                    {streamingReply}
                                    <span className="inline-block w-2 h-4 ml-1 bg-[#c5a059] animate-pulse align-middle"></span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel rounded-3xl p-8 shadow-2xl h-full flex flex-col justify-center items-center text-zinc-500 border border-[#26262d] min-h-[480px]">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 bg-[#c5a059]/20 rounded-full animate-ping"></div>
                                <div className="relative bg-[#18181e] rounded-2xl p-5 shadow-2xl border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center">
                                    <Icons.Brain />
                                </div>
                            </div>
                            <h3 className="serif-font text-lg font-bold text-white">{brandName} AI Copilot Sedang Bekerja...</h3>
                            <p className="text-sm mt-2 text-center max-w-sm text-zinc-400">
                                Mencocokkan knowledge base 3-layer, mengaudit integritas harga 2026, dan merumuskan rekomendasi balasan WhatsApp terbaik.
                            </p>
                        </div>
                    )
                ) : aiResponse ? (
                    <div className="space-y-6">
                        {/* KARTU REKOMENDASI UTAMA BALASAN */}
                        <div className="bg-[#15151a] rounded-3xl shadow-2xl border border-[#26262d] overflow-hidden flex flex-col animate-fade-in">
                            {/* Header Rekomendasi Utama */}
                            <div className="bg-[#1a1a22] border-b border-[#26262d] p-4 flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-xl bg-[#c5a059]/20 text-[#c5a059] text-xs font-bold uppercase tracking-wider border border-[#c5a059]/30 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        🌟 Rekomendasi Utama
                                    </span>
                                    {aiResponse.metrics?.formattedSummary && (
                                        <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-semibold hidden sm:inline">
                                            {aiResponse.metrics.formattedSummary}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Tombol Buka WA Web */}
                                    <a 
                                        href={`https://web.whatsapp.com/send?text=${encodeURIComponent(primaryReplyText)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30"
                                        title="Buka WhatsApp Web dan kirimkan teks balasan ini"
                                    >
                                        <Icons.ExternalLink /> WA Web
                                    </a>

                                    {/* Tombol Copy Balasan */}
                                    <button 
                                        onClick={() => handleCopy('primary', primaryReplyText)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                            copiedKey === 'primary' 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-[#202028] hover:bg-[#c5a059] hover:text-[#0d0d0d] text-zinc-200 border border-[#2e2e38]'
                                        }`}
                                    >
                                        {copiedKey === 'primary' ? (
                                            <React.Fragment><Icons.CheckCircle /> Disalin!</React.Fragment>
                                        ) : (
                                            <React.Fragment><Icons.Copy /> Copy Balasan</React.Fragment>
                                        )}
                                    </button>

                                    {/* Quick Feedback Rating 👍 / 👎 */}
                                    <div className="flex items-center gap-1 bg-[#15151a] p-1 rounded-xl border border-[#2e2e38] ml-1">
                                        <button 
                                            onClick={() => handleGiveFeedback('POSITIVE')}
                                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                                                feedbackGiven === 'POSITIVE' 
                                                    ? 'bg-emerald-500 text-white' 
                                                    : 'text-zinc-400 hover:text-emerald-400 hover:bg-[#202028]'
                                            }`}
                                            title="Balasan Akurat & Tepat Sasaran"
                                        >
                                            👍 Akurat
                                        </button>
                                        <button 
                                            onClick={() => handleGiveFeedback('NEGATIVE')}
                                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                                                feedbackGiven === 'NEGATIVE' 
                                                    ? 'bg-rose-500 text-white' 
                                                    : 'text-zinc-400 hover:text-rose-400 hover:bg-[#202028]'
                                            }`}
                                            title="Kurang Tepat / Perlu Koreksi"
                                        >
                                            👎 Koreksi
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Teks Pesan WhatsApp */}
                            <div className="p-6 space-y-4">
                                <div className="bg-[#1b1b22] border border-[#26262d] rounded-2xl p-5 relative group">
                                    <p className="text-zinc-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                        {primaryReplyText}
                                    </p>
                                </div>

                                {/* Prinsip & Anti Halusinasi Badge */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                                    <div className="flex flex-wrap gap-1.5">
                                        {aiResponse.principlesUsed?.map((p, i) => (
                                            <span key={i} className="px-2.5 py-1 rounded-lg bg-[#202028] text-[#c5a059] text-[11px] font-bold uppercase tracking-wider border border-[#33333d]">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                        <Icons.Shield /> Anti-Halusinasi Terverifikasi
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SMART CONTEXT PANEL (INTERNAL SALES INTELLIGENCE) */}
                        <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-[#26262d] space-y-5 animate-fade-in">
                            <div className="flex items-center justify-between border-b border-[#26262d] pb-4">
                                <h3 className="serif-font text-base font-bold text-white flex items-center gap-2">
                                    <div className="p-2 bg-[#202028] text-[#c5a059] rounded-xl">
                                        <Icons.Brain />
                                    </div>
                                    Smart Context Panel & Internal Intelligence
                                </h3>
                                {getTemperatureBadge(aiResponse.clientAnalysis?.temperature)}
                            </div>

                            {/* Grid Parameter Analisis */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="bg-[#15151a] p-3 rounded-2xl border border-[#26262d]">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Intent Klien</span>
                                    <span className="font-bold text-white mt-1 block">
                                        {aiResponse.clientAnalysis?.intent || 'CONSULTATION'}
                                    </span>
                                </div>
                                <div className="bg-[#15151a] p-3 rounded-2xl border border-[#26262d]">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Pipeline Stage</span>
                                    <span className="font-bold text-[#c5a059] mt-1 block">
                                        {aiResponse.clientAnalysis?.stage || 'NEW_LEAD'}
                                    </span>
                                </div>
                                <div className="bg-[#15151a] p-3 rounded-2xl border border-[#26262d]">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tipe Proyek</span>
                                    <span className="font-bold text-white mt-1 block truncate">
                                        {aiResponse.clientAnalysis?.projectType || 'Kitchen / Interior'}
                                    </span>
                                </div>
                                <div className="bg-[#15151a] p-3 rounded-2xl border border-[#26262d]">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Wilayah Layanan</span>
                                    <span className="font-bold text-white mt-1 block truncate">
                                        {serviceArea}
                                    </span>
                                </div>
                            </div>

                            {/* Missing Information Chips */}
                            {aiResponse.clientAnalysis?.missingInformation && aiResponse.clientAnalysis.missingInformation.length > 0 && (
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                                        ⚠️ Data Klien yang Masih Kurang (Perlu Digali):
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {aiResponse.clientAnalysis.missingInformation.map((info, idx) => (
                                            <span key={idx} className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                                                {info}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Next Best Action Callout */}
                            {aiResponse.clientAnalysis?.nextBestAction && (
                                <div className="bg-gradient-to-r from-[#202028] to-[#1a1a24] border border-[#c5a059]/40 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-[#c5a059]/20 text-[#c5a059] rounded-xl flex-shrink-0 mt-0.5">
                                            <Icons.Zap />
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c5a059] block">
                                                Rekomendasi Tindakan Sales (Next Best Action):
                                            </span>
                                            <p className="text-zinc-200 text-xs md:text-sm mt-1 font-medium leading-relaxed">
                                                {aiResponse.clientAnalysis.nextBestAction}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3-Layer Internal Sources / Citations */}
                            <div className="pt-2 border-t border-[#26262d]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                                    Rujukan Knowledge Base 3-Layer:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {aiResponse.internalSources?.map((source, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded-xl bg-[#1b1b22] text-zinc-400 border border-[#2e2e38] text-[11px] font-medium flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel rounded-3xl p-8 shadow-2xl h-full flex flex-col justify-center items-center text-zinc-500 border border-[#26262d] min-h-[480px] border-dashed text-center">
                        <div className="w-16 h-16 bg-[#1a1a20] rounded-2xl flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
                            <Icons.Send />
                        </div>
                        <h3 className="serif-font font-bold text-white text-base">Belum Ada Balasan Dibuat</h3>
                        <p className="text-sm mt-1 text-zinc-400 max-w-sm">
                            Masukkan chat atau screenshot pelanggan {brandName} di sebelah kiri, lalu klik Generate untuk membuat rekomendasi balasan AI terbaik.
                        </p>
                    </div>
                )}
            </div>

            <ApiKeyModal 
                isOpen={showApiKeyModal}
                onClose={() => setShowApiKeyModal(false)}
                onSave={handleSaveKeySettings}
                currentProvider={aiProvider}
                currentKey={customApiKey}
                keyStorageMode={keyStorageMode}
                selectedModel={selectedModel}
                customProxyUrl={customProxyUrl}
                currentOpenaiBaseUrl={openaiBaseUrl}
                currentOpenaiApiKey={openaiApiKey}
                currentOpenaiModel={openaiModel}
            />
        </div>
    );
};
