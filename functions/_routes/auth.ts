import { Hono } from 'hono';
import type { Env } from '../_lib/types';
import { generateId, generateOtp, now, createJwt, verifyJwt, auditLog } from '../_lib/types';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/signup', async (c) => {
  const { email, name } = await c.req.json();
  if (!email || !name) return c.json({ error: 'Email and name are required' }, 400);

  const db = c.env.DB;
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return c.json({ error: 'An account with this email already exists' }, 409);

  const userId = generateId();
  const ts = now();
  await db.prepare('INSERT INTO users (id, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').bind(userId, email, name, ts, ts).run();

  const code = generateOtp();
  const otpId = generateId();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await db.prepare('INSERT INTO otps (id, code, email, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(otpId, code, email, userId, expiresAt, ts).run();

  const isDemoMode = c.env.DEMO_MODE === 'true';
  return c.json({
    message: 'Account created. Check your email for a verification code.',
    userId,
    ...(isDemoMode ? { otp: code } : {}),
  }, 201);
});

auth.post('/login', async (c) => {
  const { email } = await c.req.json();
  if (!email) return c.json({ error: 'Email is required' }, 400);

  const db = c.env.DB;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ error: 'No account found with this email' }, 404);

  await db.prepare('UPDATE otps SET used = 1 WHERE email = ? AND used = 0').bind(email).run();

  const code = generateOtp();
  const otpId = generateId();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await db.prepare('INSERT INTO otps (id, code, email, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(otpId, code, email, user.id as string, expiresAt, now()).run();

  const isDemoMode = c.env.DEMO_MODE === 'true';
  return c.json({
    message: 'Login code sent to your email.',
    ...(isDemoMode ? { otp: code } : {}),
  });
});

auth.post('/verify-otp', async (c) => {
  const { email, code } = await c.req.json();
  if (!email || !code) return c.json({ error: 'Email and code are required' }, 400);

  const db = c.env.DB;
  const otp = await db.prepare(
    'SELECT id, user_id FROM otps WHERE email = ? AND code = ? AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1'
  ).bind(email, code, now()).first();

  if (!otp) return c.json({ error: 'Invalid or expired OTP' }, 400);

  await db.prepare('UPDATE otps SET used = 1 WHERE id = ?').bind(otp.id as string).run();

  const user = await db.prepare('SELECT id, email, name FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const secret = c.env.JWT_SECRET || 'dev-secret-change-me';
  const token = await createJwt({ userId: user.id }, secret);

  await auditLog(db, { userId: user.id as string, action: 'LOGIN', entity: 'user', entityId: user.id as string });

  return c.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

auth.post('/resend-otp', async (c) => {
  const { email } = await c.req.json();
  if (!email) return c.json({ error: 'Email is required' }, 400);

  const db = c.env.DB;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ error: 'No account found with this email' }, 404);

  await db.prepare('UPDATE otps SET used = 1 WHERE email = ? AND used = 0').bind(email).run();

  const code = generateOtp();
  const otpId = generateId();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await db.prepare('INSERT INTO otps (id, code, email, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(otpId, code, email, user.id as string, expiresAt, now()).run();

  const isDemoMode = c.env.DEMO_MODE === 'true';
  return c.json({
    message: 'New code sent to your email.',
    ...(isDemoMode ? { otp: code } : {}),
  });
});

auth.get('/me', async (c) => {
  const userId = c.get('userId' as never) as string;
  if (!userId) return c.json({ error: 'Authentication required' }, 401);

  const user = await c.env.DB.prepare('SELECT id, email, name, phone, avatar_url, created_at FROM users WHERE id = ?').bind(userId).first();
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json({ user });
});

auth.patch('/me', async (c) => {
  const userId = c.get('userId' as never) as string;
  if (!userId) return c.json({ error: 'Authentication required' }, 401);

  const { name, phone } = await c.req.json();
  const updates: string[] = [];
  const values: unknown[] = [];

  if (name) { updates.push('name = ?'); values.push(name); }
  if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
  updates.push('updated_at = ?'); values.push(now());
  values.push(userId);

  await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  const user = await c.env.DB.prepare('SELECT id, email, name, phone, avatar_url FROM users WHERE id = ?').bind(userId).first();
  return c.json({ user });
});

export default auth;
