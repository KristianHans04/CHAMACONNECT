import { Hono } from 'hono';
import type { Env } from '../_lib/types';

const statements = new Hono<{ Bindings: Env }>();

statements.get('/chamas/:chamaId/statements', async (c) => {
  const chamaId = c.req.param('chamaId');
  const db = c.env.DB;

  const members = await db.prepare(`
    SELECT m.id, m.role, u.id as user_id, u.name, u.email
    FROM memberships m JOIN users u ON m.user_id = u.id WHERE m.chama_id = ? AND m.is_active = 1
  `).bind(chamaId).all();

  const summaries = await Promise.all(
    members.results.map(async (m) => {
      const agg = await db.prepare('SELECT COALESCE(SUM(amount), 0) as total_paid, COALESCE(SUM(expected_amount), 0) as total_expected FROM contribution_records WHERE membership_id = ?').bind(m.id as string).first() as { total_paid: number; total_expected: number };
      const overdue = await db.prepare("SELECT COALESCE(SUM(expected_amount), 0) as total FROM contribution_records WHERE membership_id = ? AND status = 'OVERDUE'").bind(m.id as string).first() as { total: number };
      return {
        member: { id: m.user_id, name: m.name, email: m.email },
        membershipId: m.id,
        memberId: m.id,
        memberName: m.name,
        role: m.role,
        totalExpected: agg.total_expected,
        totalPaid: agg.total_paid,
        totalOverdue: overdue.total,
      };
    })
  );

  return c.json({ statements: summaries });
});

statements.get('/chamas/:chamaId/statements/:memberId', async (c) => {
  const { chamaId, memberId } = c.req.param();
  const { from, to } = c.req.query();
  const db = c.env.DB;

  const membership = await db.prepare(`
    SELECT m.id, m.role, u.id as user_id, u.name, u.email
    FROM memberships m JOIN users u ON m.user_id = u.id WHERE m.id = ? AND m.chama_id = ? AND m.is_active = 1
  `).bind(memberId, chamaId).first();
  if (!membership) return c.json({ error: 'Member not found in this chama' }, 404);

  let sql = `SELECT cr.*, cp.name as plan_name, cp.frequency as plan_frequency
    FROM contribution_records cr JOIN contribution_plans cp ON cr.plan_id = cp.id
    WHERE cr.membership_id = ? AND cp.chama_id = ?`;
  const params: unknown[] = [memberId, chamaId];

  if (from) { sql += ' AND cr.due_date >= ?'; params.push(from); }
  if (to) { sql += ' AND cr.due_date <= ?'; params.push(to); }
  sql += ' ORDER BY cr.due_date DESC';

  const records = await db.prepare(sql).bind(...params).all();
  const recs = records.results;

  const totalExpected = recs.reduce((s, r) => s + (r.expected_amount as number), 0);
  const totalPaid = recs.reduce((s, r) => s + (r.amount as number), 0);
  const totalOverdue = recs.filter(r => r.status === 'OVERDUE').reduce((s, r) => s + ((r.expected_amount as number) - (r.amount as number)), 0);

  const transactions = recs.map(r => ({
    id: r.id,
    amount: r.amount,
    expectedAmount: r.expected_amount,
    expected_amount: r.expected_amount,
    status: r.status,
    dueDate: r.due_date,
    due_date: r.due_date,
    paidDate: r.paid_at,
    paid_at: r.paid_at,
    planName: r.plan_name,
    plan_name: r.plan_name,
    note: r.note,
  }));

  const statement = {
    memberId: membership.id,
    memberName: membership.name,
    totalExpected,
    totalPaid,
    totalOverdue,
    balance: totalExpected - totalPaid,
    transactions,
  };

  return c.json({
    member: { id: membership.user_id, name: membership.name, email: membership.email },
    membershipId: membership.id,
    role: membership.role,
    summary: { totalExpected, totalPaid, totalOverdue, balance: totalExpected - totalPaid },
    records: recs.map(r => ({ ...r, plan: { name: r.plan_name, frequency: r.plan_frequency } })),
    statement,
  });
});

export default statements;
