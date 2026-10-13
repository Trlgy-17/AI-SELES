// File: src/components/modals/ApiKeyModal.jsx
// Pemilih provider & model AI. API key tidak pernah ada di browser — dikelola di server.
import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, CircleAlert } from 'lucide-react';
import { FormField } from '../common/FormField.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Input.jsx';
import { SegmentedControl } from '../ui/Surface.jsx';
import { AiApi } from '../../js/services/api.js';

export const ApiKeyModal = ({
    isOpen,
    onClose,
    onSave,
    currentProvider = 'gemini',
    selectedModel = 'gemini-flash-lite-latest',
    currentOpenaiModel = 'gpt-4o-mini'
}) => {
    const [provider, setProvider] = useState(currentProvider);
    const [geminiModel, setGeminiModel] = useState(selectedModel);
    const [openaiModel, setOpenaiModel] = useState(currentOpenaiModel);
    const [config, setConfig] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        setProvider(currentProvider || 'gemini');
        setGeminiModel(selectedModel);
        setOpenaiModel(currentOpenaiModel);
        setError(null);
        AiApi.config().then((res) => setConfig(res.data)).catch((err) => setError(err.message));
    }, [isOpen, currentProvider, selectedModel, currentOpenaiModel]);

    const providers = config?.providers;
    const models = provider === 'openai' ? providers?.openai.models ?? [] : providers?.gemini.models ?? [];
    const available = provider === 'openai' ? providers?.openai.available : providers?.gemini.available;
    const current = provider === 'openai' ? openaiModel : geminiModel;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            icon={Cpu}
            title="Model AI"
            description="Pilih provider dan model. API key disimpan aman di server."
            size="md"
            className="max-h-[90dvh]"
            bodyClassName="overflow-y-auto space-y-5"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button variant="primary" disabled={!available || !models.includes(current)} onClick={() => onSave({ provider, model: geminiModel, openaiModel })}>
                        Simpan
                    </Button>
                </>
            }
        >
            {error && (
                <div className="flex items-start gap-2 rounded-sm border border-danger/25 bg-danger/10 px-3 py-2.5 text-body-sm text-red-300" role="alert">
                    <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {error}
                </div>
            )}
            <SegmentedControl
                label="Provider AI"
                fullWidth
                value={provider}
                onChange={setProvider}
                options={[{ value: 'gemini', label: 'Google Gemini' }, { value: 'openai', label: 'OpenAI-compatible' }]}
            />
            {config && !available && (
                <p className="text-body-sm text-amber-300">Provider ini belum dikonfigurasi di server. Minta Super Admin mengisi API key di environment backend.</p>
            )}
            <FormField label="Model" htmlFor="ai-model">
                <Select
                    id="ai-model"
                    value={current}
                    onChange={(e) => (provider === 'openai' ? setOpenaiModel(e.target.value) : setGeminiModel(e.target.value))}
                    disabled={!models.length}
                >
                    {!models.includes(current) && <option value={current}>{current} (tidak diizinkan)</option>}
                    {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
            </FormField>
            <p className="flex items-center gap-2 text-caption text-fg-muted">
                <ShieldCheck size={14} className="text-emerald-400" aria-hidden="true" />
                Setiap permintaan tercatat (model, durasi, versi prompt {config?.promptVersion || ''}) tanpa menyimpan isi percakapan.
            </p>
        </Modal>
    );
};

export default ApiKeyModal;
