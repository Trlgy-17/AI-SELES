// Create or reset a user from the command line.
// Usage: npm run user:create -- --email=a@b.com --username=ops --name="Nama" --role=SUPER_ADMIN [--brand=brand_nacira]
// The generated password is appended to .seed-credentials.local.txt (gitignored), never printed.
import { appendFileSync } from 'node:fs';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { createDb } from './client.js';
import * as s from './schema.js';
import { ROLES } from '../lib/rbac.js';
import { generatePassword, uuid } from '../lib/util.js';

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

const email = arg('email')?.toLowerCase();
const username = (arg('username') ?? email?.split('@')[0])?.toLowerCase();
const fullName = arg('name') ?? username;
const role = arg('role') ?? 'SALES';
const defaultBrand = arg('brand') ?? 'brand_nacira';

if (!email || !username || !fullName) throw new Error('--email wajib diisi');
if (!ROLES[role]) throw new Error(`Role tidak dikenal: ${role}`);

const { db, pool } = createDb(process.env.DATABASE_URL!);
const password = generatePassword();
const passwordHash = await hash(password);

const [existing] = await db.select().from(s.users).where(eq(s.users.email, email)).limit(1);
const userId = existing?.id ?? uuid();
if (existing) {
    await db.update(s.users).set({ passwordHash, status: 'ACTIVE' }).where(eq(s.users.id, userId));
} else {
    await db.insert(s.users).values({ id: userId, username, email, fullName, passwordHash });
}
await db.delete(s.userRoles).where(eq(s.userRoles.userId, userId));
await db.insert(s.userRoles).values({ userId, roleId: role });

const brandIds = role === 'SUPER_ADMIN' || role === 'OWNER'
    ? (await db.select({ id: s.brands.id }).from(s.brands)).map((b) => b.id)
    : [defaultBrand];
for (const brandId of brandIds) {
    await db.insert(s.brandMemberships).values({ userId, brandId, isDefault: brandId === defaultBrand })
        .onDuplicateKeyUpdate({ set: { isDefault: brandId === defaultBrand } });
}

appendFileSync('.seed-credentials.local.txt', `\n${new Date().toISOString()}  ${existing ? 'RESET' : 'BARU'}  email=${email}  username=${username}  role=${role}  password=${password}\n`);
console.log(`${existing ? 'Password direset' : 'User dibuat'}: ${email} (${role}, ${brandIds.length} brand). Password disimpan di .seed-credentials.local.txt`);
await pool.end();
