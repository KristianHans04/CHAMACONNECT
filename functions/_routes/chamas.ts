import { Hono } from 'hono';
import type { Env } from '../_lib/types';
import { generateId, now, auditLog } from '../_lib/types';

const chamas = new Hono<{ Bindings: Env }>();

chamas.get('/', async (c) => {
  const userId = c.get('userId' as never) as string;
  const db = c.env.DB;
  const rows = await db.prepare(`
    SELECT c.id, c.name, c.description, c.currency, c.created_at, c.updated_at,
           m.role, (SELECT COUNT(*) FROM memberships WHERE chama_id = c.id AND is_active = 1) as member_count
    FROM memberships m JOIN chamas c ON m.chama_id = c.id
    WHERE m.user_id = ? AND m.is_active = 1 ORDER BY m.joined_at DESC
  `).bind(userId).all();
  return c.json({ chamas: rows.results.map(r => ({ ...r, memberCount: r.member_count })) });
});

chamas.post('/', async (c) => {
  const userId = c.get('userId' as never) as string;
  const { name, description } = await c.req.json();
  if (!name || name.length < 2) return c.json({ error: 'Name must be at least 2 characters' }, 400);

  const db = c.env.DB;
  const chamaId = generateId();
  const memId = generateId();
  const ts = now();

  await db.batch([
    db.prepare('INSERT INTO chamas (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').bind(chamaId, name, description || null, ts, ts),
    db.prepare('INSERT INTO memberships (id, user_id, chama_id, role, joined_at) VALUES (?, ?, ?, ?, ?)').bind(memId, userId, chamaId, 'ADMIN', ts),
  ]);

  await auditLog(db, { chamaId, userId, action: 'CHAMA_CREATED', entity: 'chama', entityId: chamaId, details: { name } });
  return c.json({ chama: { id: chamaId, name, description, currency: 'KES', created_at: ts } }, 201);
});

chamas.get('/:id', async (c) => {
  const userId = c.get('userId' as never) as string;
  const id = c.req.param('id');
  const db = c.env.DB;

  const membership = await db.prepare('SELECT role FROM memberships WHERE user_id = ? AND chama_id = ? AND is_active = 1').bind(userId, id).first();
  if (!membership) return c.json({ error: 'You are not a member of this chama' }, 403);

  const chama = await db.prepare('SELECT * FROM chamas WHERE id = ?').bind(id).first();
  if (!chama) return c.json({ error: 'Chama not found' }, 404);

  const memberCount = await db.prepare('SELECT COUNT(*) as cnt FROM memberships WHERE chama_id = ? AND is_active = 1').bind(id).first();
  const plans = await db.prepare('SELECT * FROM contribution_plans WHERE chama_id = ? AND is_active = 1 ORDER BY created_at DESC').bind(id).all();

  return c.json({ chama: { ...chama, role: membership.role, memberCount: (memberCount as { cnt: number })?.cnt || 0, contributionPlans: plans.results } });
});

chamas.patch('/:id', async (c) => {
  const userId = c.get('userId' as never) as string;
  const id = c.req.param('id');
  const db = c.env.DB;

  const membership = await db.prepare('SELECT role FROM memberships WHERE user_id = ? AND chama_id = ? AND is_active = 1').bind(userId, id).first();
  if (!membership || membership.role === 'MEMBER') return c.json({ error: 'Only admins and treasurers can edit chama settings' }, 403);

  const { name, description } = await c.req.json();
  const updates: string[] = [];
  const values: unknown[] = [];
  if (name) { updates.push('name = ?'); values.push(name); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  updates.push('updated_at = ?'); values.push(now());
  values.push(id);

  await db.prepare(`UPDATE chamas SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  await auditLog(db, { chamaId: id, userId, action: 'CHAMA_UPDATED', entity: 'chama', entityId: id, details: { name, description } });

  const chama = await db.prepare('SELECT * FROM chamas WHERE id = ?').bind(id).first();
  return c.json({ chama });
});

chamas.delete('/:id', async (c) => {
  const userId = c.get('userId' as never) as string;
  const id = c.req.param('id');
  const db = c.env.DB;

  const membership = await db.prepare('SELECT role FROM memberships WHERE user_id = ? AND chama_id = ? AND is_active = 1').bind(userId, id).first();
  if (!membership || membership.role !== 'ADMIN') return c.json({ error: 'Only admins can delete a chama' }, 403);

  await db.prepare('DELETE FROM chamas WHERE id = ?').bind(id).run();
  await auditLog(db, { userId, action: 'CHAMA_DELETED', entity: 'chama', entityId: id });
  return c.json({ message: 'Chama deleted' });
});

export default chamas;
