import { Hono } from 'hono';
import type { Env } from '../_lib/types';

const audit = new Hono<{ Bindings: Env }>();

audit.get('/chamas/:chamaId/audit', async (c) => {
  const chamaId = c.req.param('chamaId');
  const { action, entity, page = '1', limit = '30' } = c.req.query();
  const db = c.env.DB;

  let sql = `SELECT al.*, u.name as user_name, u.email as user_email
    FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE al.chama_id = ?`;
  const params: unknown[] = [chamaId];

  if (action) { sql += ' AND al.action = ?'; params.push(action); }
  if (entity) { sql += ' AND al.entity = ?'; params.push(entity); }

  const countSql = sql.replace(/SELECT al\.\*.*?FROM/, 'SELECT COUNT(*) as cnt FROM');
  const total = await db.prepare(countSql).bind(...params).first() as { cnt: number };

  const p = parseInt(page); const l = parseInt(limit);
  sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
  params.push(l, (p - 1) * l);

  const rows = await db.prepare(sql).bind(...params).all();
  const logs = rows.results.map(r => ({
    id: r.id,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    userId: r.user_id,
    userName: r.user_name,
    createdAt: r.created_at,
    details: r.details ? JSON.parse(r.details as string) : null,
    user: r.user_name ? { name: r.user_name, email: r.user_email } : null,
  }));

  return c.json({ logs, total: total?.cnt || 0, page: p, totalPages: Math.ceil((total?.cnt || 0) / l) });
});

audit.get('/chamas/:chamaId/audit/:logId', async (c) => {
  const { logId } = c.req.param();
  const log = await c.env.DB.prepare(`
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE al.id = ?
  `).bind(logId).first();
  if (!log) return c.json({ error: 'Audit log not found' }, 404);
  return c.json({
    log: {
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entity_id,
      userId: log.user_id,
      userName: log.user_name,
      createdAt: log.created_at,
      details: log.details ? JSON.parse(log.details as string) : null,
      user: log.user_name ? { name: log.user_name, email: log.user_email } : null,
    },
  });
});

export default audit;
