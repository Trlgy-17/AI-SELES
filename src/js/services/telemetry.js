// File: src/js/services/telemetry.js
import { StorageService } from './storage.js';

const TELEMETRY_EVENTS_KEY = 'sales_ai_telemetry_events_v1';
const MAX_TELEMETRY_LOGS = 200;

export const TelemetryService = {
    // Mask sensitive PII such as phone numbers and addresses
    maskPII: (text) => {
        if (!text || typeof text !== 'string') return text;
        // Mask phone numbers (e.g. 081234567890 -> 0812****7890)
        let masked = text.replace(/(\+?62|0)8[1-9][0-9]{1,4}[0-9]{4,6}/g, (match) => {
            if (match.length <= 6) return match;
            const prefix = match.slice(0, 4);
            const suffix = match.slice(-4);
            return `${prefix}****${suffix}`;
        });
        return masked;
    },

    // Record an application/sales event with latency and context
    logEvent: (eventType, payload = {}) => {
        try {
            const logs = StorageService.getItem(TELEMETRY_EVENTS_KEY, []);
            const newEntry = {
                id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                timestamp: new Date().toISOString(),
                type: eventType,
                brandId: payload.brandId || null,
                brandName: payload.brandName || null,
                latency: payload.latency || null,
                intent: payload.intent || null,
                stage: payload.stage || null,
                responseMode: payload.responseMode || null,
                provider: payload.provider || null,
                model: payload.model || null,
                feedback: payload.feedback || null, // 'POSITIVE' | 'NEGATIVE' | null
                feedbackNote: payload.feedbackNote || null,
                replyPreview: payload.reply ? TelemetryService.maskPII(payload.reply.slice(0, 100)) + '...' : null
            };

            const updatedLogs = [newEntry, ...logs].slice(0, MAX_TELEMETRY_LOGS);
            StorageService.setItem(TELEMETRY_EVENTS_KEY, updatedLogs);
            return newEntry;
        } catch (err) {
            console.warn('[TelemetryService] Failed to record event:', err);
            return null;
        }
    },

    getRecentEvents: (limit = 50) => {
        const logs = StorageService.getItem(TELEMETRY_EVENTS_KEY, []);
        return logs.slice(0, limit);
    },

    clearEvents: () => {
        StorageService.removeItem(TELEMETRY_EVENTS_KEY);
    },

    // Create a new latency tracker for an AI request lifecycle
    createLatencyTracker: () => {
        const start = performance.now();
        const timestamps = {
            requestStart: Date.now(),
            imageStart: 0,
            imageEnd: 0,
            retrievalStart: 0,
            retrievalEnd: 0,
            llmStart: 0,
            llmFirstToken: 0,
            llmEnd: 0
        };

        return {
            markImageStart: () => { timestamps.imageStart = performance.now(); },
            markImageEnd: () => { timestamps.imageEnd = performance.now(); },
            markRetrievalStart: () => { timestamps.retrievalStart = performance.now(); },
            markRetrievalEnd: () => { timestamps.retrievalEnd = performance.now(); },
            markLlmStart: () => { timestamps.llmStart = performance.now(); },
            markFirstToken: () => {
                if (!timestamps.llmFirstToken && timestamps.llmStart) {
                    timestamps.llmFirstToken = performance.now();
                }
            },
            markLlmEnd: () => { timestamps.llmEnd = performance.now(); },

            getMetrics: () => {
                const totalDuration = Math.round(performance.now() - start);
                const imageDuration = timestamps.imageEnd && timestamps.imageStart 
                    ? Math.round(timestamps.imageEnd - timestamps.imageStart) : 0;
                const retrievalDuration = timestamps.retrievalEnd && timestamps.retrievalStart 
                    ? Math.round(timestamps.retrievalEnd - timestamps.retrievalStart) : 0;
                const llmTTFT = timestamps.llmFirstToken && timestamps.llmStart 
                    ? Math.round(timestamps.llmFirstToken - timestamps.llmStart) : null;
                const llmDuration = timestamps.llmEnd && timestamps.llmStart 
                    ? Math.round(timestamps.llmEnd - timestamps.llmStart) 
                    : (totalDuration - imageDuration - retrievalDuration);

                return {
                    totalDurationMs: totalDuration,
                    imageDurationMs: imageDuration,
                    retrievalDurationMs: retrievalDuration,
                    llmTTFTMs: llmTTFT,
                    llmDurationMs: Math.max(0, llmDuration),
                    formattedSummary: `⚡ ${(totalDuration / 1000).toFixed(2)}s (Retrieval: ${retrievalDuration}ms | LLM: ${(llmDuration / 1000).toFixed(2)}s)`
                };
            }
        };
    }
};
