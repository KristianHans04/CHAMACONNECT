import { Hono } from 'hono';
import type { Env } from '../_lib/types';
import { generateId, now, auditLog } from '../_lib/types';

const members = new Hono<{ Bindings: Env }>();

members.get('/chamas/:chamaId/members', async (c) => {
  const chamaId = c.req.param('chamaId');
  const rows = await c.env.DB.prepare(`
    SELECT m.id, m.role, m.joined_at, m.is_active, u.id as user_id, u.email, u.name, u.phone
    FROM memberships m JOIN users u ON m.user_id = u.id WHERE m.chama_id = ? AND m.is_active = 1 ORDER BY m.joined_at ASC
  `).bind(chamaId).all();
  const members = rows.results.map(r => ({
    id: r.id,
    role: r.role,
    joinedAt: r.joined_at,
    createdAt: r.joined_at,
    user: { id: r.user_id, email: r.email, name: r.name, phone: r.phone },
  }));
  return c.json({ members });
});

members.get('/chamas/:chamaId/members/:memberId', async (c) => {
  const { chamaId, memberId } = c.req.param();
  const db = c.env.DB;
  const membership = await db.prepare(`
    SELECT m.id, m.role, m.joined_at, u.id as user_id, u.email, u.name, u.phone
    FROM memberships m JOIN users u ON m.user_id = u.id WHERE m.id = ? AND m.chama_id = ? AND m.is_active = 1
  `).bind(memberId, chamaId).first();
  if (!membership) return c.json({ error: 'Member not found' }, 404);

  const contributions = await db.prepare(`
    SELECT cr.*, cp.name as plan_name FROM contribution_records cr
    JOIN contribution_plans cp ON cr.plan_id = cp.id WHERE cr.membership_id = ? ORDER BY cr.due_date DESC LIMIT 20
  `).bind(memberId).all();

  const contributionRows = contributions.results.map((r) => ({
    id: r.id,
    amount: r.amount,
    expectedAmount: r.expected_amount,
    expected_amount: r.expected_amount,
    status: r.status,
    dueDate: r.due_date,
    due_date: r.due_date,
    planName: r.plan_name,
    plan_name: r.plan_name,
  }));

  return c.json({
    member: {
      id: membership.id,
      role: membership.role,
      joinedAt: membership.joined_at,
      createdAt: membership.joined_at,
      user: { id: membership.user_id, email: membership.email, name: membership.name, phone: membership.phone },
    },
    contributions: contributionRows,
  });
});

members.patch('/chamas/:chamaId/members/:memberId/role', async (c) => {
  const userId = c.get('userId' as never) as string;
  const { chamaId, memberId } = c.req.param();
  const { role } = await c.req.json();
  const db = c.env.DB;
  const allowedRoles = new Set(['ADMIN', 'TREASURER', 'MEMBER']);

  const caller = await db.prepare('SELECT role FROM memberships WHERE user_id = ? AND chama_id = ? AND is_active = 1').bind(userId, chamaId).first();
  if (!caller || caller.role !== 'ADMIN') return c.json({ error: 'Only admins can change roles' }, 403);
  if (!allowedRoles.has(role)) return c.json({ error: 'Invalid role supplied' }, 400);

  await db.prepare('UPDATE memberships SET role = ? WHERE id = ?').bind(role, memberId).run();
  await auditLog(db, { chamaId, userId, action: 'ROLE_CHANGED', entity: 'membership', entityId: memberId, details: { newRole: role } });
  return c.json({ membership: { id: memberId, role } });
});

members.delete('/chamas/:chamaId/members/:memberId', async (c) => {
  const userId = c.get('userId' as never) as string;
  const { chamaId, memberId } = c.req.param();
  const db = c.env.DB;

  const caller = await db.prepare('SELECT role FROM memberships WHERE user_id = ? AND chama_id = ? AND is_active = 1').bind(userId, chamaId).first();
  if (!caller || caller.role !== 'ADMIN') return c.json({ error: 'Only admins can remove members' }, 403);

  await db.prepare('UPDATE memberships SET is_active = 0 WHERE id = ?').bind(memberId).run();
  await auditLog(db, { chamaId, userId, action: 'MEMBER_REMOVED', entity: 'membership', entityId: memberId });
  return c.json({ message: 'Member removed' });
});

members.post('/chamas/:chamaId/invites', async (c) => {
  const userId = c.get('userId' as never) as string;
  const chamaId = c.req.param('chamaId');
  const { email, role = 'MEMBER' } = await c.req.json();
  if (!email) return c.json({ error: 'Email is required' }, 400);
  const db = c.env.DB;

  const caller = await db.prepare('SELECT role FROM memberships WHERE user_id = ? AND chama_id = ? AND is_active = 1').bind(userId, chamaId).first();
  if (!caller || caller.role === 'MEMBER') return c.json({ error: 'Only admins and treasurers can send invites' }, 403);

  const existing = await db.prepare('SELECT id FROM memberships m JOIN users u ON m.user_id = u.id WHERE m.chama_id = ? AND u.email = ? AND m.is_active = 1').bind(chamaId, email).first();
  if (existing) return c.json({ error: 'This person is already a member' }, 409);

  const token = crypto.randomUUID();
  const inviteId = generateId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  await db.prepare('INSERT INTO invites (id, chama_id, email, role, token, sent_by_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(inviteId, chamaId, email, role, token, userId, expiresAt, now()).run();

  await auditLog(db, { chamaId, userId, action: 'MEMBER_INVITED', entity: 'invite', entityId: inviteId, details: { email, role } });
  return c.json({ invite: { id: inviteId, email, role, token, status: 'PENDING' } }, 201);
});

members.get('/chamas/:chamaId/invites', async (c) => {
  const chamaId = c.req.param('chamaId');
  const rows = await c.env.DB.prepare(`
    SELECT i.*, u.name as sent_by_name, u.email as sent_by_email
    FROM invites i JOIN users u ON i.sent_by_id = u.id WHERE i.chama_id = ? ORDER BY i.created_at DESC
  `).bind(chamaId).all();
  const invites = rows.results.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    status: r.status,
    token: r.token,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    sentBy: { name: r.sent_by_name, email: r.sent_by_email },
  }));
  return c.json({ invites });
});

members.get('/invites/:token/info', async (c) => {
  const token = c.req.param('token');
  const invite = await c.env.DB.prepare(`
    SELECT i.role, i.email, i.status, i.expires_at, c.name as chama_name, c.description as chama_description
    FROM invites i JOIN chamas c ON i.chama_id = c.id WHERE i.token = ?
  `).bind(token).first();
  if (!invite || invite.status !== 'PENDING' || new Date(invite.expires_at as string) < new Date()) {
    return c.json({ error: 'Invalid or expired invite' }, 400);
  }
  return c.json({ invite: { chamaName: invite.chama_name, chamaDescription: invite.chama_description, role: invite.role, email: invite.email } });
});

members.post('/invites/:token/accept', async (c) => {
  const userId = c.get('userId' as never) as string;
  const token = c.req.param('token');
  const db = c.env.DB;

  const invite = await db.prepare('SELECT * FROM invites WHERE token = ?').bind(token).first();
  if (!invite || invite.status !== 'PENDING' || new Date(invite.expires_at as string) < new Date()) {
    return c.json({ error: 'Invalid or expired invite' }, 400);
  }

  const existing = await db.prepare('SELECT id, is_active FROM memberships WHERE user_id = ? AND chama_id = ?').bind(userId, invite.chama_id).first();
  if (existing && existing.is_active) return c.json({ error: 'You are already a member' }, 409);

  if (existing && !existing.is_active) {
    await db.prepare('UPDATE memberships SET is_active = 1, role = ? WHERE id = ?').bind(invite.role, existing.id).run();
  } else {
    await db.prepare('INSERT INTO memberships (id, user_id, chama_id, role, joined_at) VALUES (?, ?, ?, ?, ?)').bind(generateId(), userId, invite.chama_id, invite.role, now()).run();
  }

  await db.prepare('UPDATE invites SET status = ? WHERE id = ?').bind('ACCEPTED', invite.id).run();
  await auditLog(db, { chamaId: invite.chama_id as string, userId, action: 'INVITE_ACCEPTED', entity: 'invite', entityId: invite.id as string });
  return c.json({ message: 'Invite accepted', chamaId: invite.chama_id });
});

export default members;
