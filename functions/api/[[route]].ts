import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from '../_lib/types';
import { verifyJwt } from '../_lib/types';

import auth from '../_routes/auth';
import chamas from '../_routes/chamas';
import members from '../_routes/members';
import contributions from '../_routes/contributions';
import statements from '../_routes/statements';
import auditRoutes from '../_routes/audit';
import contact from '../_routes/contact';

type HonoEnv = { Bindings: Env };

const app = new Hono<HonoEnv>().basePath('/api');

app.use('*', cors());

// Auth middleware - extract userId for protected routes
app.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const secret = c.env.JWT_SECRET || 'dev-secret-change-me';
    const payload = await verifyJwt(token, secret);
    if (payload?.userId) {
      c.set('userId' as never, payload.userId as never);
    }
  }
  await next();
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Payment status
app.get('/payments/status', (c) => c.json({ enabled: !!c.env.PAYSTACK_SECRET_KEY }));

// Mount routes
app.route('/auth', auth);
app.route('/chamas', chamas);
app.route('/', members);
app.route('/', contributions);
app.route('/', statements);
app.route('/', auditRoutes);
app.route('/', contact);

export const onRequest: PagesFunction<Env> = async (context) => {
  return app.fetch(context.request, context.env, context);
};
