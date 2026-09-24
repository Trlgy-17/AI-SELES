// File: src/components/modules/AIWorkspace.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons.jsx';
import { FormField } from '../common/FormField.jsx';
import { ApiKeyModal } from '../modals/ApiKeyModal.jsx';
import { StorageService } from '../../js/services/storage.js';
import { AIService } from '../../js/services/ai.js';
import { copyToClipboard } from '../../js/utils/clipboard.js';
import { optimizeImageForAI } from '../../js/utils/image.js';
import { DEFAULT_GEMINI_API_KEY, DEFAULT_GEMINI_MODEL } from '../../js/constants.js';

export const AIWorkspace = ({ showToast }) => {
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [optimizedImagePart, setOptimizedImagePart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [aiError, setAiError] = useState(null);
    
    const [aiProvider, setAiProvider] = useState(() => StorageService.getItem('nacira_ai_provider', 'gemini'));
    
    // Gemini States
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
            // Kompresi & downscale cerdas (mengurangi ukuran 95% tanpa mengurangi keterbacaan teks chat)
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
                setAiError("API Key Gemini atau Custom Proxy URL belum diatur. Klik 'Atur API Key' di atas.");
                setShowApiKeyModal(true);
                return;
            }
        } else if (aiProvider === 'openai') {
            const cleanBase = (openaiBaseUrl || '').trim();
            if (!cleanBase) {
                setAiError("Base URL OpenAI belum diisi. Klik 'Atur API Key' di atas untuk mengatur Base URL.");
                setShowApiKeyModal(true);
                return;
            }
        }

        if (isLoading) return;

        setIsLoading(true);
        setAiError(null);
        setAiResponse(null);

        try {
            const imagePart = optimizedImagePart || (imagePreview ? {
                inlineData: {
                    data: imagePreview.split(',')[1],
                    mimeType: selectedImage ? selectedImage.type : 'image/jpeg'
                }
            } : null);

            const result = await AIService.generateWhatsAppReply({
                provider: aiProvider,
                inputText: inputText.trim(),
                imagePart,
                customApiKey: activeGeminiKey,
                selectedModel,
                customProxyUrl: proxyUrl,
                openaiBaseUrl,
                openaiApiKey,
                openaiModel
            });
            setAiResponse(result);
        } catch (error) {
            console.error("[AI Workspace] Error:", error);
            setAiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!aiResponse?.reply) return;
        const success = await copyToClipboard(aiResponse.reply);
        if (success) {
            setCopySuccess(true);
            showToast("Balasan WhatsApp berhasil disalin!");
            setTimeout(() => setCopySuccess(false), 2000);
        } else {
            setAiError("Gagal menyalin teks secara otomatis.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 animate-fade-in">
            <div className="lg:col-span-6 space-y-6">
                <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-[#26262d]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="serif-font text-lg font-bold text-white flex items-center gap-2">
                            <div className="p-2 bg-[#202028] text-[#c5a059] rounded-xl">
                                <Icons.MessageSquare />
                            </div>
                            WhatsApp Lead & Chat Input
                        </h2>
                        <button 
                            onClick={() => setShowApiKeyModal(true)}
                            className="text-xs font-semibold px-3 py-1.5 bg-[#202028] hover:bg-[#282832] text-[#c5a059] rounded-full border border-[#33333d] flex items-center gap-1.5 transition-colors shadow-sm"
                            title={aiProvider === 'openai' ? `Provider: OpenAI API | Base URL: ${openaiBaseUrl} | Model: ${openaiModel}` : `Provider: Google Gemini | Model: ${selectedModel}`}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <Icons.Key /> {aiProvider === 'openai' ? `OpenAI API (${openaiModel})` : `Gemini (${selectedModel})`}
                        </button>
                    </div>

                    {aiError && (
                        <div className="mb-4 p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2" role="alert">
                            <span>⚠️</span> {aiError}
                        </div>
                    )}

                    <div className="space-y-5">
                        <FormField label="Pesan / Pertanyaan Klien" helperText="Opsional jika melampirkan screenshot chat">
                            <textarea 
                                className="w-full bg-[#15151a] border border-[#26262d] rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] transition-all resize-none shadow-inner text-zinc-100 placeholder:text-zinc-600"
                                rows="4"
                                placeholder="Contoh: 'Min, mau tanya bikin kitchen set multipleks minimalis 3 meter di Bandung berapa ya? Apakah sudah termasuk survey dan desain 3D?'"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            ></textarea>
                        </FormField>

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
                                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP (Maksimal 5MB)</p>
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
                                        <span className="text-xs font-medium text-white bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md">Screenshot Terlampir</span>
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

                        <div className="pt-2">
                            <button 
                                onClick={generateReply}
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold shadow-xl transition-all ${
                                    isLoading ? 'bg-[#2a2a30] text-zinc-500 cursor-not-allowed' : 'gold-btn shadow-[#c5a059]/25'
                                }`}
                            >
                                {isLoading ? (
                                    <React.Fragment>
                                        <svg className="animate-spin h-5 w-5 text-[#c5a059]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Meracik Balasan Strategis...
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <Icons.Zap /> Generate Balasan WhatsApp AI ({aiProvider === 'openai' ? (openaiModel || 'Custom OpenAI') : selectedModel})
                                    </React.Fragment>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-6">
                {isLoading ? (
                    <div className="glass-panel rounded-3xl p-8 shadow-2xl h-full flex flex-col justify-center items-center text-zinc-500 border border-[#26262d] min-h-[450px]">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 bg-[#c5a059]/20 rounded-full animate-ping"></div>
                            <div className="relative bg-[#18181e] rounded-2xl p-5 shadow-2xl border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center">
                                <Icons.Brain />
                            </div>
                        </div>
                        <h3 className="serif-font text-lg font-bold text-white">Nacira AI Sedang Bekerja...</h3>
                        <p className="text-sm mt-2 text-center max-w-sm text-zinc-400">Menganalisis master pricelist kitchen, wardrobe & living room.</p>
                    </div>
                ) : aiResponse ? (
                    <div className="bg-[#15151a] rounded-3xl shadow-2xl border border-[#26262d] overflow-hidden flex flex-col h-full animate-fade-in">
                        <div className="bg-[#1b1b22] text-white px-6 py-5 flex justify-between items-center flex-wrap gap-3 border-b border-[#26262d]">
                            <div className="flex items-center gap-2.5 font-bold text-sm">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                Balasan WhatsApp Siap Dikirim
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {aiResponse.principlesUsed?.map((p, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#26262d] text-[#c5a059] text-xs font-bold uppercase tracking-wider border border-[#383842]">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Draf Teks WhatsApp</h3>
                                    <button 
                                        onClick={handleCopy}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                            copySuccess ? 'bg-emerald-500 text-white' : 'bg-[#202028] hover:bg-[#c5a059] hover:text-[#0d0d0d] text-zinc-300 border border-[#2e2e38]'
                                        }`}
                                    >
                                        {copySuccess ? <React.Fragment><Icons.CheckCircle /> Disalin!</React.Fragment> : <React.Fragment><Icons.Copy /> Copy Teks</React.Fragment>}
                                    </button>
                                </div>
                                <div className="bg-[#1b1b22] border border-[#26262d] rounded-2xl p-5">
                                    <p className="text-zinc-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                        {aiResponse.reply}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#26262d]">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                                    <Icons.Brain /> Analisis Strategi Penjualan
                                </h3>
                                <div className="bg-[#1b1b22] rounded-2xl p-4 text-xs md:text-sm text-zinc-400 leading-relaxed border border-[#26262d] font-medium">
                                    {aiResponse.explanation}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel rounded-3xl p-8 shadow-2xl h-full flex flex-col justify-center items-center text-zinc-500 border border-[#26262d] min-h-[450px] border-dashed text-center">
                        <div className="w-16 h-16 bg-[#1a1a20] rounded-2xl flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
                            <Icons.Send />
                        </div>
                        <h3 className="serif-font font-bold text-white text-base">Belum Ada Balasan Dibuat</h3>
                        <p className="text-sm mt-1 text-zinc-400 max-w-sm">
                            Masukkan chat atau screenshot pelanggan di sebelah kiri, lalu klik Generate untuk membuat balasan AI resmi.
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
