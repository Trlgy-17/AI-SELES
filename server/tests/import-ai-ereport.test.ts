import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import * as s from '../src/db/schema.js';
import { setup, login, api } from './helpers.js';
import { validateAiOutput } from '../src/modules/ai/routes.js';
import { createEreportClient, type EreportConsultation } from '../src/modules/integrations/ereport/client.js';

let ctx: Awaited<ReturnType<typeof setup>>;
before(async () => { ctx = await setup(); });
after(async () => { await ctx.close(); });

test('legacy import: every record is accounted for and sampled records match', async () => {
    const a = await login(ctx.app, 'homeputra');
    const payload = {
        leads: [
            { id: 'L1', brandId: 'brand_homeputra', name: 'Ibu Dewi', phoneRaw: '0812 1000 0001', project: 'Wardrobe', location: 'Bandung', status: 'Design Review', value: 22000000.4, createdAt: '2026-05-01T03:00:00.000Z' },
            { id: 'L2', name: 'Pak Agus', phoneRaw: '0812 1000 0002', status: 'Batal' },            // no brand → defaulted
            { id: 'L3', brandId: 'brand_homeputra', name: '' },                                  // invalid
            { id: 'L4', brandId: 'brand_heya', name: 'Brand lain' },                             // not permitted → skipped
            { id: 'L5', brandId: 'brand_homeputra', name: 'Dihapus' },                           // tombstone → skipped
            { id: 'L1', brandId: 'brand_homeputra', name: 'Ibu Dewi' }                           // duplicate inside file
        ],
        tasks: [
            { id: 'T1', leadId: 'L1', type: 'Follow-up', status: 'Pending', dueDate: '2026-10-02' },
            { id: 'T2', leadId: 'L2', type: 'Kirim RAB', status: 'Selesai' }
        ],
        tombstones: { leads: ['L5'] }
    };
    const res = await api(ctx.app, a).send('POST', '/api/v1/migrations/legacy-import', payload);
    assert.equal(res.statusCode, 201);
    const r = res.json().data;
    assert.equal(r.totalRecords, 8);
    assert.equal(r.imported + r.skipped + r.duplicates + r.invalid + r.failed, r.totalRecords, 'no silent drops');
    assert.equal(r.imported, 4);
    assert.equal(r.invalid, 1);
    assert.equal(r.skipped, 2);
    assert.equal(r.duplicates, 1);
    assert.equal(r.brandDefaulted, 1);

    const [dewi] = await ctx.db.select().from(s.leads).where(eq(s.leads.legacyId, 'L1'));
    assert.equal(dewi.stage, 'DESIGN_REVIEW');
    assert.equal(dewi.valueIdr, 22000000);
    assert.equal(dewi.projectType, 'Wardrobe');
    const [agus] = await ctx.db.select().from(s.leads).where(eq(s.leads.legacyId, 'L2'));
    assert.equal(agus.stage, 'LOST');
    assert.equal(agus.brandId, 'brand_homeputra');
    const [t1] = await ctx.db.select().from(s.followUpTasks).where(eq(s.followUpTasks.legacyId, 'T1'));
    assert.equal(t1.leadId, dewi.id);
    assert.equal(t1.dueAt?.toISOString(), '2026-10-02T02:00:00.000Z');

    // Re-running the same import is idempotent.
    const again = (await api(ctx.app, a).send('POST', '/api/v1/migrations/legacy-import', payload)).json().data;
    assert.equal(again.imported, 0);
    const runs = await ctx.db.select().from(s.migrationRuns);
    assert.equal(runs.length, 2);
});

test('AI output schema accepts a valid reply and rejects malformed output', () => {
    assert.equal(validateAiOutput('{"reply":"Halo Kak","clientAnalysis":{"intent":"ASK_PRICE","missingInformation":["ukuran"]}}').valid, true);
    assert.equal(validateAiOutput('```json\n{"reply":"Halo"}\n```').valid, true);
    assert.equal(validateAiOutput('{"clientAnalysis":{}}').valid, false);
    assert.equal(validateAiOutput('bukan json').valid, false);
    assert.equal(validateAiOutput('{"reply":123}').valid, false);
});

test('AI generate rejects models outside the allowlist', async () => {
    const a = await login(ctx.app, 'homeputra');
    const res = await api(ctx.app, a).send('POST', '/api/v1/ai/generate', { provider: 'gemini', model: 'evil-model', systemPrompt: 'x', userText: 'y' });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error.code, 'MODEL_NOT_ALLOWED');
});

test('e-report client is read-only: non-GET methods never reach the network', async () => {
    let calls = 0;
    const fakeFetch = (async () => { calls++; return new Response('{}', { status: 200 }); }) as typeof fetch;
    const client = createEreportClient('https://ereport.test', 'token', fakeFetch);
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        await assert.rejects(() => client._request(method, '/consultations'), /hanya boleh membaca/);
    }
    assert.equal(calls, 0);
    await client.get('/accounts');
    assert.equal(calls, 1);
});

test('e-report sync: creates locked leads for mapped accounts only, then updates/archives incrementally', async () => {
    const rows: EreportConsultation[] = [
        { consultation_id: '01.2609.0001', client_name: 'Ibu Maya', phone: '081300000001', city: 'Bandung', account_id: 1, needs: ['Kitchen Set'], status_id: 5, status_name: 'Survey', updated_at: '2026-09-20T01:00:00Z' },
        { consultation_id: '01.2609.0002', client_name: 'Pak Anton', phone: '081300000002', city: 'Cimahi', account_id: 1, status_id: 9, status_name: 'Deal', updated_at: '2026-09-21T01:00:00Z' },
        { consultation_id: '02.2609.0001', client_name: 'Akun lain', phone: '081300000003', account_id: 2, updated_at: '2026-09-21T01:00:00Z' }
    ];
    const requested: string[] = [];
    const fakeFetch = (async (input: URL | string, init?: RequestInit) => {
        assert.equal(init?.method, 'GET');
        const url = new URL(String(input));
        requested.push(url.pathname + url.search);
        if (url.pathname.endsWith('/accounts')) return Response.json({ data: [{ id: 1, name: 'Homeputra IG' }, { id: 2, name: 'Akun Lain' }] });
        if (url.pathname.endsWith('/master-data/statuses')) return Response.json({ data: [{ id: 5, name: 'Survey' }, { id: 9, name: 'Deal' }] });
        const account = url.searchParams.get('account');
        const since = url.searchParams.get('updated_since');
        const data = rows.filter((r) => String(r.account_id) === account && (!since || (r.updated_at ?? '') >= since));
        return Response.json({ data, meta: { current_page: 1, last_page: 1, total: data.length } });
    }) as typeof fetch;
    ctx.app.ereportClientFactory = () => createEreportClient('https://ereport.test', 'token', fakeFetch);

    const sa = await login(ctx.app, 'admin');
    const mkt = await login(ctx.app, 'homeputra');
    assert.equal((await api(ctx.app, mkt).send('POST', '/api/v1/integrations/ereport/sync')).statusCode, 403, 'settings.manage required');

    await api(ctx.app, sa).send('PUT', '/api/v1/integrations/ereport/mappings', {
        mappings: [
            { ereportAccountId: '1', ereportAccountName: 'Homeputra IG', brandId: 'brand_homeputra', enabled: true },
            { ereportAccountId: '2', ereportAccountName: 'Akun Lain', brandId: null, enabled: false }
        ]
    });
    await api(ctx.app, sa).send('PUT', '/api/v1/integrations/ereport/status-mappings', {
        mappings: [{ ereportStatusId: '5', ereportStatusName: 'Survey', stage: 'PROSPECT_SURVEY' }, { ereportStatusId: '9', ereportStatusName: 'Deal', stage: 'CLOSING_DP' }]
    });

    const first = (await api(ctx.app, sa).send('POST', '/api/v1/integrations/ereport/sync')).json().data;
    assert.equal(first.created, 2);
    assert.equal(first.fetched, 2);
    assert.ok(!requested.some((r) => r.includes('account=2')), 'unmapped account never requested');

    const leads = (await api(ctx.app, mkt).get('/api/v1/leads?source=ereport')).json().data;
    assert.equal(leads.length, 2);
    const anton = leads.find((l: any) => l.name === 'Pak Anton');
    assert.equal(anton.stage, 'CLOSING_DP');
    assert.equal(anton.isSourceLocked, true);

    // Source-owned fields are locked in this app.
    assert.equal((await api(ctx.app, mkt).send('PATCH', `/api/v1/leads/${anton.id}`, { name: 'Ganti' })).statusCode, 409);
    assert.equal((await api(ctx.app, mkt).send('PATCH', `/api/v1/leads/${anton.id}`, { notes: 'Catatan internal' })).statusCode, 200);

    // Second run with no changes: nothing new (cursor makes it incremental).
    const second = (await api(ctx.app, sa).send('POST', '/api/v1/integrations/ereport/sync')).json().data;
    assert.equal(second.created, 0);
    assert.equal(second.updated, 0);

    // Change one row and delete another upstream.
    rows[0] = { ...rows[0], client_name: 'Ibu Maya Sari', updated_at: '2026-09-25T01:00:00Z' };
    rows[1] = { ...rows[1], deleted_at: '2026-09-26T01:00:00Z', updated_at: '2026-09-26T01:00:00Z' };
    const third = (await api(ctx.app, sa).send('POST', '/api/v1/integrations/ereport/sync')).json().data;
    assert.equal(third.updated, 1);
    assert.equal(third.archived, 1);
    const after = (await api(ctx.app, mkt).get('/api/v1/leads?source=ereport')).json().data;
    assert.deepEqual(after.map((l: any) => l.name), ['Ibu Maya Sari']);
    const [antonNotes] = await ctx.db.select().from(s.leads).where(eq(s.leads.externalId, '01.2609.0002'));
    assert.equal(antonNotes.notes, 'Catatan internal', 'local enrichment preserved');
});
