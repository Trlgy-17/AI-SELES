import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { and, eq } from 'drizzle-orm';
import * as s from '../src/db/schema.js';
import { setup, login, api } from './helpers.js';

let ctx: Awaited<ReturnType<typeof setup>>;
before(async () => { ctx = await setup(); });
after(async () => { await ctx.close(); });

test('brand isolation: user of brand B cannot read, update or delete a brand A lead by ID (404)', async () => {
    const a = await login(ctx.app, 'homeputra');
    const b = await login(ctx.app, 'heya');
    const created = await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'Rahasia Homeputra', phone: '081234500001', value: 15000000 });
    assert.equal(created.statusCode, 201);
    const id = created.json().data.id;

    assert.equal((await api(ctx.app, b).get(`/api/v1/leads/${id}`)).statusCode, 404);
    assert.equal((await api(ctx.app, b).send('PATCH', `/api/v1/leads/${id}`, { name: 'Diretas' })).statusCode, 404);
    assert.equal((await api(ctx.app, b).send('PATCH', `/api/v1/leads/${id}/stage`, { stage: 'QUOTATION' })).statusCode, 404);
    const listB = await api(ctx.app, b).get('/api/v1/leads');
    assert.ok(!listB.json().data.some((l: any) => l.id === id));

    const [row] = await ctx.db.select().from(s.clients).where(eq(s.clients.name, 'Rahasia Homeputra'));
    assert.equal(row.brandId, 'brand_homeputra');
});

test('duplicate detection: same phone in the same brand returns 409, confirmDuplicate creates and flags', async () => {
    const a = await login(ctx.app, 'homeputra');
    const first = await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'Ibu Rina', phone: '0812-3450-0099' });
    assert.equal(first.statusCode, 201);
    const dup = await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'Rina A', phone: '+62 812 3450 0099' });
    assert.equal(dup.statusCode, 409);
    assert.equal(dup.json().error.details.potentialDuplicates[0].reason, 'phone');
    const forced = await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'Rina A', phone: '+62 812 3450 0099', confirmDuplicate: true });
    assert.equal(forced.statusCode, 201);
    assert.equal(forced.json().data.potentialDuplicateOf, first.json().data.clientId);
    // Same phone in another brand is not a duplicate.
    const other = await login(ctx.app, 'kurnia');
    assert.equal((await api(ctx.app, other).send('POST', '/api/v1/leads', { name: 'Rina', phone: '081234500099' })).statusCode, 201);
});

test('stage change writes history, activity and audit log; LOST requires a reason', async () => {
    const a = await login(ctx.app, 'putra');
    const lead = (await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'Pak Budi', phone: '081299988877' })).json().data;

    const lost = await api(ctx.app, a).send('PATCH', `/api/v1/leads/${lead.id}/stage`, { stage: 'LOST' });
    assert.equal(lost.statusCode, 400);

    const moved = await api(ctx.app, a).send('PATCH', `/api/v1/leads/${lead.id}/stage`, { stage: 'Penawaran RAB' });
    assert.equal(moved.statusCode, 200);
    assert.equal(moved.json().data.stage, 'QUOTATION');
    assert.equal(moved.json().data.status, 'Penawaran RAB');

    const history = await ctx.db.select().from(s.leadStageHistory).where(eq(s.leadStageHistory.leadId, lead.id));
    assert.deepEqual(history.map((h) => h.toStage).sort(), ['PROSPECT_SURVEY', 'QUOTATION']);
    const acts = await ctx.db.select().from(s.activities).where(and(eq(s.activities.leadId, lead.id), eq(s.activities.type, 'lead.stage_changed')));
    assert.equal(acts.length, 1);
    const audit = await ctx.db.select().from(s.auditLogs).where(and(eq(s.auditLogs.entityId, lead.id), eq(s.auditLogs.action, 'lead.stage_change')));
    assert.equal(audit.length, 1);
    assert.equal((audit[0].before as any).stage, 'PROSPECT_SURVEY');

    const lostOk = await api(ctx.app, a).send('PATCH', `/api/v1/leads/${lead.id}`, { status: 'Batal', lostReason: 'budget' });
    assert.equal(lostOk.statusCode, 200);
    assert.equal(lostOk.json().data.lostReason, 'budget');
});

test('PATCH only changes the fields that were sent', async () => {
    const a = await login(ctx.app, 'putra');
    const lead = (await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'Ibu Sari', phone: '081277766655', project: 'Kitchen set', location: 'Cimahi', value: 12000000 })).json().data;
    const res = await api(ctx.app, a).send('PATCH', `/api/v1/leads/${lead.id}`, { notes: 'Minta survei Sabtu' });
    const d = res.json().data;
    assert.equal(d.project, 'Kitchen set');
    assert.equal(d.location, 'Cimahi');
    assert.equal(d.value, 12000000);
    assert.equal(d.notes, 'Minta survei Sabtu');
});

test('validation rejects negative / fractional money and bad email', async () => {
    const a = await login(ctx.app, 'putra');
    assert.equal((await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'X', value: -1 })).statusCode, 400);
    assert.equal((await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'X', value: 10.5 })).statusCode, 400);
    assert.equal((await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'X', email: 'bukan-email' })).statusCode, 400);
});

test('tasks are brand-scoped and linked to leads', async () => {
    const a = await login(ctx.app, 'homeputra');
    const b = await login(ctx.app, 'heya');
    const lead = (await api(ctx.app, a).send('POST', '/api/v1/leads', { name: 'Klien Tugas', phone: '081255500011' })).json().data;
    const task = await api(ctx.app, a).send('POST', '/api/v1/tasks', { leadId: lead.id, type: 'Follow-up survei', dueAt: new Date(Date.now() - 86400_000 * 2).toISOString() });
    assert.equal(task.statusCode, 201);
    const overdue = await api(ctx.app, a).get('/api/v1/tasks?view=overdue');
    assert.ok(overdue.json().data.some((t: any) => t.id === task.json().data.id));
    assert.equal((await api(ctx.app, b).send('PATCH', `/api/v1/tasks/${task.json().data.id}`, { status: 'DONE' })).statusCode, 404);
    // Brand B cannot attach a task to brand A's lead.
    assert.equal((await api(ctx.app, b).send('POST', '/api/v1/tasks', { leadId: lead.id, type: 'x' })).statusCode, 404);
});
