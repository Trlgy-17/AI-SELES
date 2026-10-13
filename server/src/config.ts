import { z } from 'zod';

const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().positive().default(4000),
    APP_ORIGIN: z.string()
        .default('http://localhost:3000')
        .refine(
            (value) => value.split(',').every((origin) => z.string().url().safeParse(origin.trim()).success),
            'APP_ORIGIN must contain comma-separated absolute URLs'
        )
        .transform((value) => value.split(',').map((origin) => new URL(origin.trim()).origin)),
    DATABASE_URL: z.string().min(1),
    TEST_DATABASE_URL: z.string().optional(),
    SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
    GEMINI_API_KEY: z.string().optional().default(''),
    OPENAI_API_KEY: z.string().optional().default(''),
    OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
    EREPORT_API_URL: z.string().optional().default(''),
    EREPORT_API_TOKEN: z.string().optional().default(''),
    EREPORT_SYNC_INTERVAL_MINUTES: z.coerce.number().int().min(0).default(0)
});

export type AppConfig = z.infer<typeof EnvSchema> & { isProduction: boolean };

export const loadConfig = (overrides: Partial<Record<string, string>> = {}): AppConfig => {
    const parsed = EnvSchema.parse({ ...process.env, ...overrides });
    return { ...parsed, isProduction: parsed.NODE_ENV === 'production' };
};
