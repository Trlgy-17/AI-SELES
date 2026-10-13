// File: src/components/modules/AIWorkspace.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Bot, BadgeDollarSign, Ruler, ShieldCheck, Clock3, Handshake, MapPin, UserRound, PanelsTopLeft,
    Brain, ChevronDown, ChevronRight, ClipboardPaste, Eraser, ImagePlus, RefreshCw, Trash2, Copy, Check,
    ThumbsUp, ThumbsDown, ArrowRight, BookOpen, MessageSquareText, Send, LoaderCircle, CircleAlert, Settings2,
    Plus, Flame, Snowflake, Zap, CalendarClock, HandCoins, Wallet
} from 'lucide-react';
import { FormField } from '../common/FormField.jsx';
import { ApiKeyModal } from '../modals/ApiKeyModal.jsx';
import { Button, IconButton } from '../ui/Button.jsx';
import { Input, Select } from '../ui/Input.jsx';
import { Badge, Panel, SectionTitle, EmptyState, Skeleton, Chip } from '../ui/Surface.jsx';
import { cn } from '../../js/utils/cn.js';
import { StorageService } from '../../js/services/storage.js';
import { AIService } from '../../js/services/ai.js';
import { copyToClipboard } from '../../js/utils/clipboard.js';
import { optimizeImageForAI } from '../../js/utils/image.js';
import { DEFAULT_GEMINI_MODEL, AI_RESPONSE_MODES } from '../../js/constants.js';
import { AiApi } from '../../js/services/api.js';
import { TelemetryService } from '../../js/services/telemetry.js';

const ADMIN_DIRECTIVE_SHORTCUTS = [
    { label: 'Follow-up survei weekend', text: 'follow up rencana interior klien ini dan tawarkan slot rute survei akhir pekan (Sabtu & Minggu) dengan sapaan sopan sesuai nama klien (Ibu, Bapak, atau Kak bila belum tahu)', icon: CalendarClock, mode: 'FOLLOW_UP' },
    { label: 'Arahkan survei', text: 'arahkan klien untuk booking jadwal survei pengukuran lokasi gratis tanpa ikatan', icon: Ruler, mode: 'SURVEY_INVITATION' },
    { label: 'Jelaskan harga', text: 'jelaskan kisaran harga per meter transparan dan keunggulan bahan multipleks 18mm padat + PVC waterproof', icon: BadgeDollarSign, mode: 'PRICE_EXPLANATION' },
    { label: 'Atasi budget', text: 'atasi keberatan harga klien dengan solusi fleksibel dan bandingkan mutu multipleks vs serbuk kayu mdf', icon: Wallet, mode: 'OBJECTION_HANDLING' },
    { label: 'Kunci DP', text: 'rekapitulasi rencana dan tawarkan untuk kunci slot antrian produksi workshop dengan komitmen DP aman 50%', icon: HandCoins, mode: 'CLOSING' },
    { label: 'Tanyakan ukuran', text: 'tanyakan perkiraan ukuran ruangan atau denah layout yang sudah ada secara santun', icon: Ruler, mode: 'SMART_REPLY' }
];

const MODE_META = {
    SMART_REPLY: { icon: Bot, short: 'Smart Auto' },
    PRICE_EXPLANATION: { icon: BadgeDollarSign, short: 'Harga' },
    SURVEY_INVITATION: { icon: Ruler, short: 'Survei' },
    OBJECTION_HANDLING: { icon: ShieldCheck, short: 'Keberatan' },
    FOLLOW_UP: { icon: Clock3, short: 'Follow-up' },
    CLOSING: { icon: Handshake, short: 'Closing' }
};

const CITY_LOCKS = [
    { label: 'Bandung (DK)', loc: 'Bandung Raya' },
    { label: 'Tasikmalaya (DK)', loc: 'Tasikmalaya' },
    { label: 'Cimahi (DK)', loc: 'Cimahi' },
    { label: 'Jabodetabek (LK)', loc: 'Jabodetabek' },
    { label: 'Jakarta (LK)', loc: 'Jakarta' },
    { label: 'Bekasi/Depok (LK)', loc: 'Bekasi/Depok' }
];

const stripEmoji = (label = '') => label.replace(/^[^\p{L}\p{N}]+/u, '').trim();

const temperatureBadge = (temp) => {
    const t = (temp || 'WARM').toUpperCase();
    if (t === 'HOT') return <Badge variant="danger" icon={Flame}>Hot</Badge>;
    if (t === 'COLD') return <Badge variant="neutral" icon={Snowflake}>Cold</Badge>;
    return <Badge variant="warning" icon={Zap}>Warm</Badge>;
};

const WhatsAppIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.37 9.37 0 0 1 6.67 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.28 11.28 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.64l6.03-1.58a11.33 11.33 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.03" />
    </svg>
);

export const AIWorkspace = ({ 
    activeBrand, 
    currentUser, 
    crmLeads = [],
    showToast,
    prefillLead = null,
    onPrefillHandled
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

    // AI provider preferences (API keys live only on the server)
    const [aiProvider, setAiProvider] = useState(() => StorageService.getItem('nacira_ai_provider', 'gemini'));
    const [selectedModel, setSelectedModel] = useState(() => {
        const saved = StorageService.getItem('nacira_gemini_model', '');
        if (!saved || saved === 'gemini-1.5-flash' || saved === 'gemini-2.5-flash') {
            return DEFAULT_GEMINI_MODEL;
        }
        return saved;
    });
    const [openaiModel, setOpenaiModel] = useState(() => StorageService.getItem('nacira_openai_model', 'gpt-4o-mini'));
    const [generationId, setGenerationId] = useState(null);

    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const fileInputRef = useRef(null);
    const responsePanelRef = useRef(null);

    // Auto-scroll ke hasil rekomendasi AI pada layar mobile / tablet setelah generate
    useEffect(() => {
        if ((isLoading || aiResponse) && typeof window !== 'undefined' && window.innerWidth < 1024) {
            responsePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isLoading, aiResponse]);

    const brandName = activeBrand?.brandName || 'HOMEPUTRA INTERIOR';
    const adminName = activeBrand?.adminName || 'Admin Marketing';
    const serviceArea = activeBrand?.serviceArea || 'Bandung & Jabodetabek';

    const applyLeadToMemory = (found) => {
        setClientMemory(prev => ({
            ...prev,
            name: found.name || '',
            location: found.location || prev.location,
            dimensions: found.dimensions || prev.dimensions,
            projectType: found.project || '',
            budget: found.value ? `Rp ${Number(found.value).toLocaleString('id-ID')}` : prev.budget,
            notes: found.notes || prev.notes
        }));
        setShowMemoryDrawer(true);
    };

    useEffect(() => {
        if (!prefillLead) return;
        setSelectedLeadId(prefillLead.id);
        applyLeadToMemory(prefillLead);
        onPrefillHandled?.();
    }, [prefillLead]);

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
            applyLeadToMemory(found);
            showToast(`Memori klien "${found.name}" dimuat.`);
        }
    };

    const handleSaveKeySettings = ({ provider, model, openaiModel: newOpenaiModel }) => {
        setAiProvider(provider || 'gemini');
        setSelectedModel(model || DEFAULT_GEMINI_MODEL);
        setOpenaiModel(newOpenaiModel || 'gpt-4o-mini');
        StorageService.setItem('nacira_ai_provider', provider || 'gemini');
        StorageService.setItem('nacira_gemini_model', model || DEFAULT_GEMINI_MODEL);
        StorageService.setItem('nacira_openai_model', newOpenaiModel || 'gpt-4o-mini');
        setShowApiKeyModal(false);
        showToast("Pengaturan model AI disimpan.");
    };

    const handleApplyCalculatorEstimate = (calcData) => {
        setClientMemory(prev => ({
            ...prev,
            dimensions: calcData.dimensions || prev.dimensions,
            budget: calcData.budget || prev.budget,
            projectType: calcData.projectType || prev.projectType,
            notes: calcData.notes ? `${prev.notes ? prev.notes + '\n' : ''}${calcData.notes}` : prev.notes
        }));
        setShowMemoryDrawer(true);
        showToast?.("Hasil kalkulator estimasi berhasil disinkronkan ke Memori Klien AI!");
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

        if (isLoading) return;

        setIsLoading(true);
        setAiError(null);
        setAiResponse(null);
        setStreamingReply('');
        setFeedbackGiven(null);
        setGenerationId(null);

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
                selectedModel,
                openaiModel
            });

            setAiResponse(result);
            setGenerationId(result.generationId || null);
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
        if (generationId) {
            AiApi.feedback(generationId, feedbackType === 'POSITIVE' ? 'GOOD' : 'NEEDS_WORK').catch(() => {});
        }
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

    const primaryReplyText = aiResponse?.reply || aiResponse?.replies?.recommended || '';

    const activeModeObj = AI_RESPONSE_MODES.find((m) => m.id === selectedMode) || AI_RESPONSE_MODES[0];
    const hasImage = Boolean(selectedImage || imagePreview);
    const hasMemory = Boolean(clientMemory.name || clientMemory.location || clientMemory.dimensions || clientMemory.budget || clientMemory.projectType);
    const providerLabel = aiProvider === 'openai' ? `OpenAI · ${openaiModel}` : `Gemini · ${selectedModel}`;
    const analysis = aiResponse?.clientAnalysis;

    const handlePasteText = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setInputText((prev) => (prev ? `${prev}\n${text}` : text));
        } catch {
            showToast('Izin clipboard ditolak. Gunakan Ctrl+V di kolom pesan.', 'warning');
        }
    };

    const resetMemory = () => {
        setClientMemory({ name: '', location: '', dimensions: '', budget: '', projectType: '', notes: '' });
        setSelectedLeadId('');
        showToast('Memori klien berhasil dikosongkan.');
    };

    const memoryFields = [
        { key: 'name', label: 'Nama klien', placeholder: 'Ibu Rina / Pak Budi' },
        { key: 'location', label: 'Lokasi', placeholder: 'Podomoro Park Bandung' },
        { key: 'dimensions', label: 'Ukuran ruangan', placeholder: '3.5 m lari (L-shape)' },
        { key: 'budget', label: 'Budget', placeholder: 'Rp 25jt – 30jt' }
    ];

    const memorySummary = [
        { key: 'name', icon: UserRound, value: clientMemory.name },
        { key: 'location', icon: MapPin, value: clientMemory.location },
        { key: 'dimensions', icon: Ruler, value: clientMemory.dimensions },
        { key: 'budget', icon: BadgeDollarSign, value: clientMemory.budget },
        { key: 'projectType', icon: PanelsTopLeft, value: clientMemory.projectType }
    ].filter((m) => m.value);

    return (
        <div className="grid grid-cols-1 gap-5 pb-8 animate-fade-in lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(420px,0.9fr)_minmax(500px,1.1fr)] lg:gap-6">
            {/* LEFT: customer context & input */}
            <div className="min-w-0 space-y-4">
                <Panel className="space-y-5">
                    {/* Strategy */}
                    <div>
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                            <h2 className="text-label font-medium text-fg-2" id="strategy-label">Strategi respon</h2>
                            <button
                                type="button"
                                onClick={() => setShowApiKeyModal(true)}
                                className="inline-flex h-7 max-w-[60%] items-center gap-1.5 rounded-xs px-2 text-caption text-fg-3 hover:bg-surface-hover hover:text-fg"
                                title={aiProvider === 'openai' ? `OpenAI-compatible | Model: ${openaiModel}` : `Google Gemini | Model: ${selectedModel}`}
                            >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                                <span className="truncate">{providerLabel}</span>
                                <Settings2 size={12} className="shrink-0" aria-hidden="true" />
                            </button>
                        </div>
                        <div role="radiogroup" aria-labelledby="strategy-label" className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                            {AI_RESPONSE_MODES.map((mode) => {
                                const meta = MODE_META[mode.id] || { icon: Bot, short: stripEmoji(mode.label) };
                                const Icon = meta.icon;
                                const isSelected = selectedMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => setSelectedMode(mode.id)}
                                        title={stripEmoji(mode.label)}
                                        className={cn(
                                            'flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-sm border px-1 py-2 text-caption font-medium transition-colors duration-150',
                                            isSelected
                                                ? 'border-primary/50 bg-primary-subtle text-primary-text'
                                                : 'border-border bg-surface-2 text-fg-3 hover:border-border-strong hover:text-fg'
                                        )}
                                    >
                                        <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
                                        <span className="truncate max-w-full">{meta.short}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-2.5 flex items-start gap-2 rounded-sm bg-surface-2 px-3 py-2">
                            {selectedMode === 'SMART_REPLY' ? (
                                <Badge variant="primary">AUTO</Badge>
                            ) : (
                                <Badge variant="neutral">{activeModeObj.badge}</Badge>
                            )}
                            <p className="min-w-0 text-body-sm text-fg-2">
                                <span className="font-medium text-fg">{stripEmoji(activeModeObj.label)}.</span>{' '}
                                {selectedMode === 'SMART_REPLY' ? 'AI menentukan strategi berdasarkan konteks percakapan.' : activeModeObj.desc}
                            </p>
                        </div>
                    </div>

                    {aiError && (
                        <div className="flex items-start gap-3 rounded-sm border border-danger/25 bg-danger/10 px-3 py-2.5" role="alert">
                            <CircleAlert size={16} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                                <p className="text-body-sm font-medium text-red-300">Tidak dapat menghasilkan rekomendasi.</p>
                                <p className="mt-0.5 text-caption text-red-300/80 break-words">{aiError}</p>
                                <p className="mt-0.5 text-caption text-red-300/80">Periksa koneksi atau konfigurasi AI provider lalu coba kembali.</p>
                            </div>
                            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={generateReply} disabled={isLoading} className="shrink-0 text-red-300 hover:text-red-200">
                                Coba lagi
                            </Button>
                        </div>
                    )}

                    {/* Message */}
                    <div>
                        <label htmlFor="ai-message" className="mb-1.5 block text-label font-medium text-fg-2">
                            {hasImage ? 'Instruksi untuk AI' : 'Chat calon klien'}
                        </label>
                        <div className="rounded-sm border border-border bg-surface-2 transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-ring hover:border-border-strong">
                            <textarea
                                id="ai-message"
                                className="block min-h-[180px] w-full resize-y bg-transparent px-3.5 py-3 text-base leading-relaxed text-fg placeholder:text-fg-muted focus:outline-none sm:min-h-[200px] sm:text-body"
                                placeholder={hasImage ? 'Contoh: follow up klien ini dengan sopan, arahkan booking survei akhir pekan…' : 'Tempel chat calon klien atau tulis instruksi untuk AI…'}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        generateReply();
                                    }
                                }}
                            />
                            <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-1.5">
                                <div className="flex items-center gap-0.5">
                                    <Button variant="ghost" size="sm" icon={ClipboardPaste} onClick={handlePasteText}>
                                        Tempel
                                    </Button>
                                    <Button variant="ghost" size="sm" icon={Eraser} onClick={() => setInputText('')} disabled={!inputText}>
                                        Bersihkan
                                    </Button>
                                </div>
                                <span className="hidden text-caption text-fg-muted sm:inline lg:hidden xl:inline tabular">
                                    {inputText.length > 0 ? `${inputText.length} karakter · ` : ''}Ctrl+Enter untuk generate
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div>
                        <div className="mb-1.5 text-label font-medium text-fg-2" id="quick-actions-label">Arahan cepat</div>
                        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible" role="group" aria-labelledby="quick-actions-label">
                            {ADMIN_DIRECTIVE_SHORTCUTS.map((chip, idx) => (
                                <Chip
                                    key={idx}
                                    icon={chip.icon}
                                    active={inputText === chip.text}
                                    onClick={() => handleApplyDirective(chip.text, chip.mode)}
                                >
                                    {chip.label}
                                </Chip>
                            ))}
                        </div>
                    </div>

                    {/* Screenshot */}
                    <div>
                        <div className="mb-1.5 text-label font-medium text-fg-2">Screenshot WhatsApp</div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            aria-label="Pilih screenshot WhatsApp"
                        />
                        {!imagePreview ? (
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-sm border border-dashed border-border-strong bg-surface-2/50 px-3.5 py-3 text-left transition-colors hover:border-primary/60 hover:bg-primary-subtle/40"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        processImageFile(e.dataTransfer.files[0]);
                                    }
                                }}
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-surface-3 text-fg-3">
                                    <ImagePlus size={18} aria-hidden="true" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-body-sm font-medium text-fg">Unggah screenshot WhatsApp</span>
                                    <span className="block text-caption text-fg-muted">PNG / JPG / WEBP · atau tempel dengan Ctrl+V</span>
                                </span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 rounded-sm border border-border bg-surface-2 p-2">
                                <img src={imagePreview} alt="Pratinjau screenshot WhatsApp" className="h-16 w-16 shrink-0 rounded-xs object-cover object-top" />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-body-sm font-medium text-fg">{selectedImage?.name || 'Screenshot terlampir'}</div>
                                    <div className="text-caption text-fg-muted">Dioptimasi untuk AI</div>
                                </div>
                                <IconButton icon={RefreshCw} label="Ganti screenshot" onClick={() => fileInputRef.current?.click()} />
                                <IconButton icon={Trash2} label="Hapus screenshot" onClick={removeImage} className="hover:text-red-400" />
                            </div>
                        )}
                    </div>

                    {/* Generate */}
                    <div>
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            loading={isLoading}
                            onClick={generateReply}
                        >
                            {isLoading ? 'Menganalisis percakapan…' : 'Generate Rekomendasi'}
                        </Button>
                        {isLoading && (
                            <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                                <div className="h-full w-2/5 rounded-full bg-primary animate-progress" />
                            </div>
                        )}
                    </div>
                </Panel>

                {/* Client memory */}
                <Panel padded={false}>
                    <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5">
                        <button
                            type="button"
                            onClick={() => setShowMemoryDrawer(!showMemoryDrawer)}
                            aria-expanded={showMemoryDrawer}
                            aria-controls="client-memory-panel"
                            className="flex min-h-[44px] sm:min-h-0 min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                            <Brain size={16} className="shrink-0 text-ai" aria-hidden="true" />
                            <span className="min-w-0">
                                <span className="block text-body-sm font-semibold text-fg">Memori klien</span>
                                <span className="block truncate text-caption text-fg-muted">
                                    {hasMemory ? 'Data terkunci tidak akan ditanyakan ulang oleh AI' : 'Belum ada memori klien'}
                                </span>
                            </span>
                            <ChevronDown size={16} className={cn('ml-auto shrink-0 text-fg-muted transition-transform', showMemoryDrawer && 'rotate-180')} aria-hidden="true" />
                        </button>
                        {hasMemory && (
                            <Button variant="ghost" size="sm" onClick={resetMemory} className="text-fg-3">
                                Reset
                            </Button>
                        )}
                    </div>

                    {!showMemoryDrawer && memorySummary.length > 0 && (
                        <dl className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border px-4 py-3 sm:px-5">
                            {memorySummary.map(({ key, icon: Icon, value }) => (
                                <div key={key} className="flex min-w-0 items-center gap-1.5 text-body-sm">
                                    <dt className="sr-only">{key}</dt>
                                    <Icon size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
                                    <dd className="truncate text-fg-2">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    {!showMemoryDrawer && !hasMemory && (
                        <div className="border-t border-border px-4 py-3 sm:px-5">
                            <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowMemoryDrawer(true)}>
                                Tambah memori
                            </Button>
                        </div>
                    )}

                    {showMemoryDrawer && (
                        <div id="client-memory-panel" className="space-y-4 border-t border-border px-4 py-4 sm:px-5 animate-fade-in">
                            {crmLeads && crmLeads.length > 0 && (
                                <FormField label="Hubungkan dengan lead CRM" htmlFor="memory-lead">
                                    <Select id="memory-lead" value={selectedLeadId} onChange={handleSelectLead}>
                                        <option value="">Tidak dihubungkan</option>
                                        {crmLeads.map((lead) => (
                                            <option key={lead.id} value={lead.id}>
                                                {lead.name} {lead.project ? `(${lead.project})` : ''} – {lead.status}
                                            </option>
                                        ))}
                                    </Select>
                                </FormField>
                            )}

                            <div>
                                <div className="mb-1.5 text-label font-medium text-fg-2">Kunci cepat wilayah</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {CITY_LOCKS.map((city) => (
                                        <Chip
                                            key={city.loc}
                                            icon={MapPin}
                                            active={Boolean(clientMemory.location?.includes(city.loc))}
                                            onClick={() => setClientMemory((prev) => ({ ...prev, location: city.loc }))}
                                            className="h-8 text-label"
                                        >
                                            {city.label}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                {memoryFields.map((f) => (
                                    <FormField key={f.key} label={f.label} htmlFor={`memory-${f.key}`}>
                                        <Input
                                            id={`memory-${f.key}`}
                                            value={clientMemory[f.key]}
                                            onChange={(e) => setClientMemory({ ...clientMemory, [f.key]: e.target.value })}
                                            placeholder={f.placeholder}
                                        />
                                    </FormField>
                                ))}
                            </div>
                        </div>
                    )}
                </Panel>
            </div>

            {/* RIGHT: AI recommendation */}
            <div ref={responsePanelRef} id="ai-response-panel" className="ai-response-panel min-w-0 scroll-mt-20 space-y-4">
                {isLoading ? (
                    <Panel className="min-h-[180px] lg:min-h-[480px]" aria-live="polite" aria-busy="true">
                        <div className="mb-4 flex items-center gap-2">
                            <LoaderCircle size={16} className="animate-spin text-primary-text" aria-hidden="true" />
                            <span className="text-body-sm font-medium text-fg">{streamingReply ? 'AI sedang menulis balasan…' : 'Menganalisis percakapan…'}</span>
                        </div>
                        {streamingReply ? (
                            <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-fg sm:text-base">
                                {streamingReply}
                                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" aria-hidden="true" />
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                <Skeleton className="h-4 w-11/12" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-2/3" />
                                <p className="pt-3 text-caption text-fg-muted">Mencocokkan knowledge base, memeriksa harga, dan menyusun balasan terbaik.</p>
                            </div>
                        )}
                    </Panel>
                ) : aiResponse ? (
                    <>
                        <Panel padded={false} className="animate-fade-in">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <h2 className="text-h3 font-semibold text-fg">Rekomendasi AI</h2>
                                    <Badge variant="primary" icon={(MODE_META[selectedMode] || {}).icon}>{(MODE_META[selectedMode] || {}).short || selectedMode}</Badge>
                                    {temperatureBadge(analysis?.temperature)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <IconButton
                                        icon={copiedKey === 'primary' ? Check : Copy}
                                        label={copiedKey === 'primary' ? 'Tersalin' : 'Salin balasan'}
                                        onClick={() => handleCopy('primary', primaryReplyText)}
                                        className={copiedKey === 'primary' ? 'text-emerald-400' : ''}
                                    />
                                    <IconButton icon={RefreshCw} label="Buat ulang" onClick={generateReply} />
                                    <a
                                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(primaryReplyText)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Buka WhatsApp dengan teks balasan ini"
                                        className="ml-1 inline-flex min-h-[44px] sm:min-h-0 sm:h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-body-sm font-semibold text-primary-fg hover:bg-primary-hover"
                                    >
                                        <WhatsAppIcon />
                                        <span>Buka WhatsApp</span>
                                    </a>
                                </div>
                            </div>

                            <div className="px-4 py-5 sm:px-6">
                                <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-fg sm:text-base">{primaryReplyText}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
                                <div className="flex items-center gap-1.5" role="group" aria-label="Umpan balik kualitas balasan">
                                    <span className="mr-1 text-caption text-fg-muted">Kualitas balasan?</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={ThumbsUp}
                                        aria-pressed={feedbackGiven === 'POSITIVE'}
                                        className={feedbackGiven === 'POSITIVE' ? 'bg-success/10 text-emerald-400' : ''}
                                        onClick={() => handleGiveFeedback('POSITIVE')}
                                    >
                                        Akurat
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={ThumbsDown}
                                        aria-pressed={feedbackGiven === 'NEGATIVE'}
                                        className={feedbackGiven === 'NEGATIVE' ? 'bg-danger/10 text-red-400' : ''}
                                        onClick={() => handleGiveFeedback('NEGATIVE')}
                                    >
                                        Perlu koreksi
                                    </Button>
                                </div>
                                {aiResponse.metrics?.formattedSummary && (
                                    <span className="text-caption text-fg-muted tabular">{aiResponse.metrics.formattedSummary}</span>
                                )}
                            </div>
                        </Panel>

                        {/* Context analysis */}
                        <Panel className="space-y-5 animate-fade-in">
                            <SectionTitle icon={Brain} title="Analisis konteks" description="Ringkasan internal untuk tim sales — tidak dikirim ke klien." />

                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
                                {[
                                    { label: 'Intent', value: analysis?.intent || 'CONSULTATION' },
                                    { label: 'Tahap', value: analysis?.stage || 'NEW_LEAD' },
                                    { label: 'Proyek', value: analysis?.projectType || 'Kitchen / Interior' },
                                    { label: 'Lokasi', value: analysis?.extractedLocation || clientMemory.location || serviceArea }
                                ].map((row) => (
                                    <div key={row.label} className="min-w-0">
                                        <dt className="text-caption text-fg-muted">{row.label}</dt>
                                        <dd className="mt-0.5 truncate text-body-sm font-medium text-fg" title={row.value}>{row.value}</dd>
                                    </div>
                                ))}
                            </dl>

                            {analysis?.nextBestAction && (
                                <div className="rounded-sm border-l-2 border-primary-text bg-primary-subtle/60 px-3.5 py-3">
                                    <div className="flex items-center gap-1.5 text-label font-medium text-primary-text">
                                        <ArrowRight size={14} aria-hidden="true" />
                                        Langkah berikutnya
                                    </div>
                                    <p className="mt-1 text-body text-fg">{analysis.nextBestAction}</p>
                                </div>
                            )}

                            {analysis?.missingInformation?.length > 0 && (
                                <div>
                                    <div className="mb-1.5 text-label font-medium text-fg-2">Informasi yang masih dibutuhkan</div>
                                    <ul className="space-y-1">
                                        {analysis.missingInformation.map((info, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-body-sm text-fg-2">
                                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                                                {info}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {(aiResponse.principlesUsed?.length > 0 || aiResponse.internalSources?.length > 0) && (
                                <details className="group border-t border-border pt-3">
                                    <summary className="flex cursor-pointer list-none items-center gap-1.5 text-label font-medium text-fg-3 hover:text-fg">
                                        <ChevronRight size={14} className="transition-transform group-open:rotate-90" aria-hidden="true" />
                                        Prinsip & rujukan knowledge
                                        <span className="ml-auto inline-flex items-center gap-1 text-caption font-normal text-emerald-400">
                                            <ShieldCheck size={12} aria-hidden="true" /> Terverifikasi
                                        </span>
                                    </summary>
                                    <div className="mt-3 space-y-2.5">
                                        {aiResponse.principlesUsed?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {aiResponse.principlesUsed.map((p, i) => (
                                                    <Badge key={i} variant="neutral">{p}</Badge>
                                                ))}
                                            </div>
                                        )}
                                        {aiResponse.internalSources?.length > 0 && (
                                            <ul className="space-y-1">
                                                {aiResponse.internalSources.map((source, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-caption text-fg-3">
                                                        <BookOpen size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                                                        {source}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </details>
                            )}
                        </Panel>
                    </>
                ) : (
                    <Panel className="flex min-h-[180px] lg:min-h-[480px] flex-col items-center justify-center">
                        <EmptyState
                            icon={MessageSquareText}
                            title="Belum ada rekomendasi"
                            description="Masukkan percakapan pelanggan untuk mulai menghasilkan balasan."
                        >
                            <ol className="mt-6 grid w-full max-w-md grid-cols-1 gap-2 text-left sm:grid-cols-3">
                                {[
                                    { icon: ClipboardPaste, text: 'Tempel chat atau screenshot' },
                                    { icon: Bot, text: 'Generate rekomendasi' },
                                    { icon: Send, text: 'Salin atau kirim via WhatsApp' }
                                ].map((step, i) => (
                                    <li key={i} className="flex items-center gap-2.5 rounded-sm bg-surface-2 px-3 py-2.5 sm:flex-col sm:items-start sm:gap-2">
                                        <span className="flex items-center gap-2 text-caption text-fg-muted">
                                            <span className="tabular">{i + 1}</span>
                                            <step.icon size={14} className="text-fg-3" aria-hidden="true" />
                                        </span>
                                        <span className="text-body-sm text-fg-2">{step.text}</span>
                                    </li>
                                ))}
                            </ol>
                        </EmptyState>
                    </Panel>
                )}
            </div>

            <ApiKeyModal
                isOpen={showApiKeyModal}
                onClose={() => setShowApiKeyModal(false)}
                onSave={handleSaveKeySettings}
                currentProvider={aiProvider}
                selectedModel={selectedModel}
                currentOpenaiModel={openaiModel}
            />
        </div>
    );
};
