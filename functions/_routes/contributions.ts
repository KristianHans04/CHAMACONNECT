import { Hono } from 'hono';
import type { Env } from '../_lib/types';
import { generateId, now, auditLog } from '../_lib/types';

const contributions = new Hono<{ Bindings: Env }>();

// Plans
contributions.get('/chamas/:chamaId/plans', async (c) => {
  const chamaId = c.req.param('chamaId');
  const rows = await c.env.DB.prepare('SELECT * FROM contribution_plans WHERE chama_id = ? ORDER BY created_at DESC').bind(chamaId).all();
  return c.json({ plans: rows.results });
});

contributions.post('/chamas/:chamaId/plans', async (c) => {
  const userId = c.get('userId' as never) as string;
  const chamaId = c.req.param('chamaId');
  const body = await c.req.json();
  const { name, description, amount, frequency, startDate, endDate } = body;
  if (!name || !amount || !frequency || !startDate) return c.json({ error: 'Name, amount, frequency, and start date required' }, 400);

  const id = generateId();
  const ts = now();
  await c.env.DB.prepare(
    'INSERT INTO contribution_plans (id, chama_id, name, description, amount, frequency, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, chamaId, name, description || null, amount, frequency, startDate, endDate || null, ts, ts).run();

  await auditLog(c.env.DB, { chamaId, userId, action: 'PLAN_CREATED', entity: 'contribution_plan', entityId: id, details: { name, amount, frequency } });
  return c.json({ plan: { id, chama_id: chamaId, name, description, amount, frequency, start_date: startDate, end_date: endDate, is_active: 1, created_at: ts } }, 201);
});

contributions.get('/chamas/:chamaId/plans/:planId', async (c) => {
  const plan = await c.env.DB.prepare('SELECT * FROM contribution_plans WHERE id = ?').bind(c.req.param('planId')).first();
  if (!plan) return c.json({ error: 'Plan not found' }, 404);
  return c.json({ plan });
});

contributions.patch('/chamas/:chamaId/plans/:planId', async (c) => {
  const userId = c.get('userId' as never) as string;
  const { chamaId, planId } = c.req.param();
  const body = await c.req.json();
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const [k, v] of Object.entries(body)) {
    const col = k === 'startDate' ? 'start_date' : k === 'endDate' ? 'end_date' : k === 'isActive' ? 'is_active' : k;
    updates.push(`${col} = ?`); values.push(v);
  }
  updates.push('updated_at = ?'); values.push(now()); values.push(planId);
  await c.env.DB.prepare(`UPDATE contribution_plans SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  await auditLog(c.env.DB, { chamaId, userId, action: 'PLAN_UPDATED', entity: 'contribution_plan', entityId: planId, details: body });
  const plan = await c.env.DB.prepare('SELECT * FROM contribution_plans WHERE id = ?').bind(planId).first();
  return c.json({ plan });
});

contributions.delete('/chamas/:chamaId/plans/:planId', async (c) => {
  const userId = c.get('userId' as never) as string;
  const { chamaId, planId } = c.req.param();
  await c.env.DB.prepare('DELETE FROM contribution_plans WHERE id = ?').bind(planId).run();
  await auditLog(c.env.DB, { chamaId, userId, action: 'PLAN_DELETED', entity: 'contribution_plan', entityId: planId });
  return c.json({ message: 'Plan deleted' });
});

// Records
contributions.get('/chamas/:chamaId/contributions', async (c) => {
  const chamaId = c.req.param('chamaId');
  const { status, memberId, planId, page = '1', limit = '20' } = c.req.query();

  let sql = `SELECT cr.*, cp.name as plan_name, cp.amount as plan_amount, cp.frequency as plan_frequency,
    u.name as user_name, u.email as user_email, m.id as mem_id
    FROM contribution_records cr
    JOIN contribution_plans cp ON cr.plan_id = cp.id
    JOIN memberships m ON cr.membership_id = m.id
    JOIN users u ON cr.user_id = u.id
    WHERE cp.chama_id = ?`;
  const params: unknown[] = [chamaId];

  if (status) { sql += ' AND cr.status = ?'; params.push(status); }
  if (memberId) { sql += ' AND cr.membership_id = ?'; params.push(memberId); }
  if (planId) { sql += ' AND cr.plan_id = ?'; params.push(planId); }

  const countSql = sql.replace(/SELECT cr\.\*.*?FROM/, 'SELECT COUNT(*) as cnt FROM');
  const total = await c.env.DB.prepare(countSql).bind(...params).first() as { cnt: number };

  const p = parseInt(page); const l = parseInt(limit);
  sql += ' ORDER BY cr.due_date DESC LIMIT ? OFFSET ?';
  params.push(l, (p - 1) * l);

  const rows = await c.env.DB.prepare(sql).bind(...params).all();
  const records = rows.results.map(r => ({
    ...r,
    plan: { name: r.plan_name, amount: r.plan_amount, frequency: r.plan_frequency },
    membership: { id: r.mem_id, user: { name: r.user_name, email: r.user_email } },
  }));

  return c.json({ records, total: total?.cnt || 0, page: p, totalPages: Math.ceil((total?.cnt || 0) / l) });
});

contributions.post('/chamas/:chamaId/contributions', async (c) => {
  const userId = c.get('userId' as never) as string;
  const chamaId = c.req.param('chamaId');
  const body = await c.req.json();
  const { planId, membershipId, amount = 0, expectedAmount, dueDate, status = 'UPCOMING', note } = body;
  if (!planId || !membershipId || !expectedAmount || !dueDate) return c.json({ error: 'Plan, member, expected amount, and due date required' }, 400);

  const membership = await c.env.DB.prepare('SELECT user_id FROM memberships WHERE id = ?').bind(membershipId).first();
  if (!membership) return c.json({ error: 'Member not found' }, 404);

  const id = generateId();
  const ts = now();
  await c.env.DB.prepare(
    'INSERT INTO contribution_records (id, plan_id, membership_id, user_id, amount, expected_amount, status, due_date, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, planId, membershipId, membership.user_id as string, amount, expectedAmount, status, dueDate, note || null, ts, ts).run();

  await auditLog(c.env.DB, { chamaId, userId, action: 'CONTRIBUTION_CREATED', entity: 'contribution_record', entityId: id, details: { amount, expectedAmount, status } });
  return c.json({ record: { id, plan_id: planId, membership_id: membershipId, amount, expected_amount: expectedAmount, status, due_date: dueDate } }, 201);
});

contributions.get('/chamas/:chamaId/contributions/:contributionId', async (c) => {
  const { contributionId } = c.req.param();
  const db = c.env.DB;
  const record = await db.prepare(`
    SELECT cr.*, cp.name as plan_name, cp.amount as plan_amount, cp.frequency as plan_frequency, cp.chama_id,
      u.name as user_name, u.email as user_email, m.id as mem_id
    FROM contribution_records cr
    JOIN contribution_plans cp ON cr.plan_id = cp.id
    JOIN memberships m ON cr.membership_id = m.id
    JOIN users u ON cr.user_id = u.id WHERE cr.id = ?
  `).bind(contributionId).first();
  if (!record) return c.json({ error: 'Record not found' }, 404);

  const payments = await db.prepare('SELECT * FROM payments WHERE contribution_record_id = ? ORDER BY created_at DESC').bind(contributionId).all();

  return c.json({
    record: {
      ...record,
      plan: { name: record.plan_name, amount: record.plan_amount, frequency: record.plan_frequency, chamaId: record.chama_id },
      membership: { id: record.mem_id, user: { name: record.user_name, email: record.user_email } },
      payments: payments.results,
    },
  });
});

contributions.patch('/chamas/:chamaId/contributions/:contributionId', async (c) => {
  const userId = c.get('userId' as never) as string;
  const { chamaId, contributionId } = c.req.param();
  const body = await c.req.json();
  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.amount !== undefined) { updates.push('amount = ?'); values.push(body.amount); }
  if (body.status) { updates.push('status = ?'); values.push(body.status); }
  if (body.note !== undefined) { updates.push('note = ?'); values.push(body.note); }
  if (body.paidAt) { updates.push('paid_at = ?'); values.push(body.paidAt); }
  updates.push('updated_at = ?'); values.push(now()); values.push(contributionId);

  await c.env.DB.prepare(`UPDATE contribution_records SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  await auditLog(c.env.DB, { chamaId, userId, action: 'CONTRIBUTION_UPDATED', entity: 'contribution_record', entityId: contributionId, details: body });
  const record = await c.env.DB.prepare('SELECT * FROM contribution_records WHERE id = ?').bind(contributionId).first();
  return c.json({ record });
});

contributions.delete('/chamas/:chamaId/contributions/:contributionId', async (c) => {
  const userId = c.get('userId' as never) as string;
  const { chamaId, contributionId } = c.req.param();
  await c.env.DB.prepare('DELETE FROM contribution_records WHERE id = ?').bind(contributionId).run();
  await auditLog(c.env.DB, { chamaId, userId, action: 'CONTRIBUTION_DELETED', entity: 'contribution_record', entityId: contributionId });
  return c.json({ message: 'Contribution record deleted' });
});

// Overdue
contributions.get('/chamas/:chamaId/overdue', async (c) => {
  const chamaId = c.req.param('chamaId');
  const db = c.env.DB;
  const currentTime = now();

  await db.prepare(`UPDATE contribution_records SET status = 'OVERDUE' WHERE status = 'UPCOMING' AND due_date < ? AND plan_id IN (SELECT id FROM contribution_plans WHERE chama_id = ?)`).bind(currentTime, chamaId).run();

  const overdueRecords = await db.prepare(`
    SELECT cr.*, cp.name as plan_name, u.name as user_name, u.email as user_email
    FROM contribution_records cr JOIN contribution_plans cp ON cr.plan_id = cp.id JOIN users u ON cr.user_id = u.id
    WHERE cp.chama_id = ? AND cr.status IN ('OVERDUE', 'PARTIALLY_PAID') AND cr.due_date < ? ORDER BY cr.due_date ASC
  `).bind(chamaId, currentTime).all();

  const upcomingDues = await db.prepare(`
    SELECT cr.*, cp.name as plan_name, u.name as user_name, u.email as user_email
    FROM contribution_records cr JOIN contribution_plans cp ON cr.plan_id = cp.id JOIN users u ON cr.user_id = u.id
    WHERE cp.chama_id = ? AND cr.status = 'UPCOMING' ORDER BY cr.due_date ASC LIMIT 20
  `).bind(chamaId).all();

  const totalExpected = await db.prepare('SELECT COALESCE(SUM(expected_amount), 0) as total FROM contribution_records WHERE plan_id IN (SELECT id FROM contribution_plans WHERE chama_id = ?)').bind(chamaId).first() as { total: number };
  const totalPaid = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM contribution_records WHERE status = 'PAID' AND plan_id IN (SELECT id FROM contribution_plans WHERE chama_id = ?)").bind(chamaId).first() as { total: number };
  const totalOverdue = await db.prepare("SELECT COALESCE(SUM(expected_amount), 0) as total FROM contribution_records WHERE status = 'OVERDUE' AND plan_id IN (SELECT id FROM contribution_plans WHERE chama_id = ?)").bind(chamaId).first() as { total: number };

  return c.json({
    overdueRecords: overdueRecords.results.map(r => ({ ...r, plan: { name: r.plan_name }, membership: { user: { name: r.user_name, email: r.user_email } } })),
    upcomingDues: upcomingDues.results.map(r => ({ ...r, plan: { name: r.plan_name }, membership: { user: { name: r.user_name, email: r.user_email } } })),
    summary: { totalExpected: totalExpected.total, totalPaid: totalPaid.total, totalOverdue: totalOverdue.total },
  });
});

export default contributions;
