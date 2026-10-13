import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setup, login, api, ORIGIN, TUNNEL_ORIGIN } from './helpers.js';

let ctx: Awaited<ReturnType<typeof setup>>;
before(async () => { ctx = await setup(); });
after(async () => { await ctx.close(); });

test('login succeeds with correct password and sets an httpOnly session cookie', async () => {
    const res = await ctx.app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { 'x-requested-with': 'nacira', origin: ORIGIN }, payload: { identifier: 'admin', password: 'test-password-123' } });
    assert.equal(res.statusCode, 200);
    const cookie = String(res.headers['set-cookie']);
    assert.match(cookie, /nacira_sid=/);
    assert.match(cookie, /HttpOnly/i);
    assert.equal(res.json().user.role, 'SUPER_ADMIN');
});

test('login accepts every configured application origin', async () => {
    const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: { 'x-requested-with': 'nacira', origin: TUNNEL_ORIGIN },
        payload: { identifier: 'admin', password: 'test-password-123' }
    });
    assert.equal(res.statusCode, 200);
});

test('login fails with wrong password (401) and old hard-coded password no longer works', async () => {
    const res = await api(ctx.app, null).send('POST', '/api/v1/auth/login', { identifier: 'heya', password: 'password123' });
    assert.equal(res.statusCode, 401);
});

test('login is rate limited per identifier', async () => {
    let last = 0;
    for (let i = 0; i < 6; i++) {
        const res = await api(ctx.app, null).send('POST', '/api/v1/auth/login', { identifier: 'kurnia', password: 'wrong-' + i });
        last = res.statusCode;
    }
    assert.equal(last, 429);
});

test('protected endpoints require a session', async () => {
    const res = await api(ctx.app, null).get('/api/v1/auth/me');
    assert.equal(res.statusCode, 401);
});

test('mutations without the CSRF header are rejected', async () => {
    const s = await login(ctx.app, 'homeputra');
    const res = await ctx.app.inject({ method: 'POST', url: '/api/v1/leads', headers: { cookie: s.cookie }, payload: { name: 'X' } });
    assert.equal(res.statusCode, 403);
    const res2 = await ctx.app.inject({ method: 'POST', url: '/api/v1/leads', headers: { cookie: s.cookie, 'x-requested-with': 'nacira', origin: 'https://evil.example' }, payload: { name: 'X' } });
    assert.equal(res2.statusCode, 403);
});

test('logout invalidates the session server-side', async () => {
    const s = await login(ctx.app, 'putra');
    assert.equal((await api(ctx.app, s).get('/api/v1/auth/me')).statusCode, 200);
    assert.equal((await api(ctx.app, s).send('POST', '/api/v1/auth/logout')).statusCode, 200);
    assert.equal((await api(ctx.app, s).get('/api/v1/auth/me')).statusCode, 401);
});

test('marketing admin cannot switch brand; super admin can', async () => {
    const mkt = await login(ctx.app, 'homeputra');
    assert.equal((await api(ctx.app, mkt).send('POST', '/api/v1/auth/switch-brand', { brandId: 'brand_heya' })).statusCode, 403);
    const sa = await login(ctx.app, 'admin');
    const res = await api(ctx.app, sa).send('POST', '/api/v1/auth/switch-brand', { brandId: 'brand_heya' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().activeBrandId, 'brand_heya');
});

test('SALES role cannot archive leads (permission denied)', async () => {
    const sales = await login(ctx.app, 'sales_heya');
    const created = await api(ctx.app, sales).send('POST', '/api/v1/leads', { name: 'Klien Sales', phone: '081211112222' });
    assert.equal(created.statusCode, 201);
    const del = await api(ctx.app, sales).send('DELETE', `/api/v1/leads/${created.json().data.id}`);
    assert.equal(del.statusCode, 403);
});

test('cross-brand list requires brand.switch permission', async () => {
    const mkt = await login(ctx.app, 'heya');
    assert.equal((await api(ctx.app, mkt).get('/api/v1/leads?scope=all')).statusCode, 403);
});
