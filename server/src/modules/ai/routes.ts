import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import * as s from '../../db/schema.js';
import { requirePermission } from '../../plugins/auth.js';
import { HttpError, notFound, uuid } from '../../lib/util.js';

export const PROMPT_VERSION = 'sales_reply_v4';

const GenerateBody = z.object({
    provider: z.enum(['gemini', 'openai']).default('gemini'),
    model: z.string().trim().min(1).max(80),
    systemPrompt: z.string().min(1).max(60_000),
    userText: z.string().min(1).max(20_000),
    image: z.object({
        mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
        data: z.string().max(10_000_000).regex(/^[A-Za-z0-9+/=]+$/, 'Gambar harus base64.')
    }).nullable().optional(),
    responseMode: z.string().max(40).optional()
});

// Structured output contract. Kept lenient on optional analysis fields; `reply` is mandatory.
export const AiOutputSchema = z.object({
    reply: z.string().min(1).max(8000).optional(),
    replies: z.object({ recommended: z.string().min(1) }).passthrough().optional(),
    clientAnalysis: z.object({
        intent: z.string().optional(),
        stage: z.string().optional(),
        temperature: z.string().optional(),
        projectType: z.string().nullable().optional(),
        extractedLocation: z.string().nullable().optional(),
        extractedBudget: z.string().nullable().optional(),
        missingInformation: z.array(z.string()).optional(),
        nextBestAction: z.string().optional()
    }).passthrough().optional(),
    principlesUsed: z.array(z.string()).optional(),
    internalSources: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1).optional()
}).passthrough().refine((v) => Boolean(v.reply || v.replies?.recommended), { message: 'Output AI tidak memiliki balasan.' });

export const extractJson = (text: string): unknown => {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
        throw new Error('not json');
    }
};

export const validateAiOutput = (text: string) => {
    try {
        const parsed = AiOutputSchema.safeParse(extractJson(text));
        return parsed.success ? { valid: true as const, output: parsed.data } : { valid: false as const, output: null };
    } catch {
        return { valid: false as const, output: null };
    }
};

const callGemini = async (key: string, model: string, body: z.infer<typeof GenerateBody>) => {
    const parts: unknown[] = [{ text: body.userText }];
    if (body.image) parts.push({ inlineData: { mimeType: body.image.mimeType, data: body.image.data } });
    const candidates = [model, 'gemini-flash-lite-latest', 'gemini-flash-latest'].filter((m, i, a) => a.indexOf(m) === i);
    let lastError = 'Semua model Gemini gagal merespons.';
    for (const m of candidates) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ role: 'user', parts }],
                    systemInstruction: { parts: [{ text: body.systemPrompt }] },
                    generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 700, responseMimeType: 'application/json' }
                })
            });
            if ([404, 429, 503].includes(res.status)) {
                lastError = `Model ${m} tidak tersedia (HTTP ${res.status}).`;
                continue;
            }
            const data: any = await res.json().catch(() => ({}));
            if (!res.ok) {
                lastError = data?.error?.message || `HTTP ${res.status}`;
                continue;
            }
            const text = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('');
            if (text) return { text, model: m };
            lastError = 'Respons Gemini kosong.';
        } catch (err: any) {
            lastError = err?.name === 'AbortError' ? 'Gemini melampaui batas waktu.' : 'Gagal menghubungi Gemini.';
        } finally {
            clearTimeout(timer);
        }
    }
    throw new HttpError(502, 'AI_PROVIDER_ERROR', lastError);
};

const callOpenAI = async (key: string, baseUrl: string, model: string, body: z.infer<typeof GenerateBody>) => {
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const userContent = body.image
        ? [{ type: 'text', text: body.userText }, { type: 'image_url', image_url: { url: `data:${body.image.mimeType};base64,${body.image.data}` } }]
        : body.userText;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) },
            signal: controller.signal,
            body: JSON.stringify({
                model,
                messages: [{ role: 'system', content: body.systemPrompt }, { role: 'user', content: userContent }],
                temperature: 0.7,
                top_p: 0.95,
                max_tokens: 700,
                response_format: { type: 'json_object' }
            })
        });
        const data: any = await res.json().catch(() => ({}));
        if (!res.ok) throw new HttpError(502, 'AI_PROVIDER_ERROR', data?.error?.message || `Provider HTTP ${res.status}`);
        const text = data?.choices?.[0]?.message?.content || '';
        if (!text) throw new HttpError(502, 'AI_PROVIDER_ERROR', 'Respons provider kosong.');
        return { text, model };
    } catch (err: any) {
        if (err instanceof HttpError) throw err;
        throw new HttpError(502, 'AI_PROVIDER_ERROR', err?.name === 'AbortError' ? 'Provider AI melampaui batas waktu.' : 'Gagal menghubungi provider AI.');
    } finally {
        clearTimeout(timer);
    }
};

export default async function aiRoutes(app: FastifyInstance) {
    const allowedModels = async () => {
        const [row] = await app.db.select().from(s.systemSettings).where(eq(s.systemSettings.key, 'ai.allowed_models')).limit(1);
        return (row?.value as { gemini: string[]; openai: string[] }) ?? { gemini: ['gemini-flash-lite-latest'], openai: [] };
    };

    app.get('/config', { preHandler: requirePermission('ai.use') }, async () => {
        const models = await allowedModels();
        return {
            data: {
                providers: {
                    gemini: { available: Boolean(app.config.GEMINI_API_KEY), models: models.gemini },
                    openai: { available: Boolean(app.config.OPENAI_API_KEY), models: models.openai }
                },
                promptVersion: PROMPT_VERSION
            }
        };
    });

    app.post('/generate', {
        preHandler: requirePermission('ai.use'),
        config: { rateLimit: { max: 30, timeWindow: '1 minute', keyGenerator: (req: any) => req.auth?.user.id ?? req.ip } }
    }, async (req) => {
        const body = GenerateBody.parse(req.body);
        const models = await allowedModels();
        if (!models[body.provider]?.includes(body.model)) throw new HttpError(400, 'MODEL_NOT_ALLOWED', `Model ${body.model} tidak diizinkan untuk ${body.provider}.`);
        const key = body.provider === 'gemini' ? app.config.GEMINI_API_KEY : app.config.OPENAI_API_KEY;
        if (!key && body.provider === 'gemini') throw new HttpError(503, 'AI_NOT_CONFIGURED', 'API key Gemini belum dikonfigurasi di server.');

        const started = Date.now();
        const generationId = uuid();
        const inputChars = body.systemPrompt.length + body.userText.length;
        try {
            const result = body.provider === 'gemini'
                ? await callGemini(key, body.model, body)
                : await callOpenAI(key, app.config.OPENAI_BASE_URL, body.model, body);
            const check = validateAiOutput(result.text);
            await app.db.insert(s.aiGenerations).values({
                id: generationId, brandId: req.auth!.activeBrandId, userId: req.auth!.user.id, provider: body.provider, model: result.model,
                promptVersion: PROMPT_VERSION, strategy: body.responseMode ?? null, latencyMs: Date.now() - started,
                inputChars, outputChars: result.text.length, success: check.valid, errorCode: check.valid ? null : 'INVALID_OUTPUT'
            });
            if (!check.valid) throw new HttpError(502, 'AI_INVALID_OUTPUT', 'Format jawaban AI tidak valid. Silakan coba lagi.');
            return { data: { generationId, model: result.model, latencyMs: Date.now() - started, output: check.output } };
        } catch (err) {
            if (err instanceof HttpError && err.code !== 'AI_INVALID_OUTPUT') {
                await app.db.insert(s.aiGenerations).values({
                    id: generationId, brandId: req.auth!.activeBrandId, userId: req.auth!.user.id, provider: body.provider, model: body.model,
                    promptVersion: PROMPT_VERSION, strategy: body.responseMode ?? null, latencyMs: Date.now() - started, inputChars, success: false, errorCode: err.code
                });
            }
            throw err;
        }
    });

    app.post('/feedback', { preHandler: requirePermission('ai.use') }, async (req, reply) => {
        const body = z.object({
            generationId: z.string().uuid(),
            rating: z.enum(['GOOD', 'NEEDS_WORK']),
            reason: z.enum(['too_formal', 'too_long', 'wrong_information', 'too_pushy', 'not_relevant', 'other']).optional()
        }).parse(req.body);
        const [gen] = await app.db.select().from(s.aiGenerations)
            .where(and(eq(s.aiGenerations.id, body.generationId), eq(s.aiGenerations.userId, req.auth!.user.id))).limit(1);
        if (!gen) throw notFound('Generasi AI');
        await app.db.insert(s.aiFeedback).values({ id: uuid(), generationId: gen.id, userId: req.auth!.user.id, rating: body.rating, reason: body.reason ?? null });
        return reply.status(201).send({ ok: true });
    });
}
