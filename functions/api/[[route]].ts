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
import seed from '../_routes/seed';

type HonoEnv = { Bindings: Env };

const app = new Hono<HonoEnv>().basePath('/api');

app.use('*', cors());

app.use('*', async (c, next) => {
  try {
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
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[CHAMACONNECT] Auth middleware error:", error.message, error.stack);
    return c.json({ error: "Internal server error", code: "AUTH_MIDDLEWARE_ERROR" }, 500);
  }
});

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/payments/status', (c) => c.json({ enabled: !!c.env.PAYSTACK_SECRET_KEY }));

app.post('/errors/report', async (c) => {
  try {
    const body = await c.req.json();
    const { error, componentStack, url, timestamp, source } = body;
    console.error("[CHAMACONNECT] Client error report:", JSON.stringify({ error, componentStack, url, timestamp, source }));
    return c.json({ reported: true });
  } catch {
    return c.json({ reported: false }, 400);
  }
});

app.route('/auth', auth);
app.route('/chamas', chamas);
app.route('/', members);
app.route('/', contributions);
app.route('/', statements);
app.route('/', auditRoutes);
app.route('/', contact);
app.route('/', seed);

app.onError((err, c) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error("[CHAMACONNECT] Unhandled error:", message, stack);
  return c.json({
    success: false,
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    detail: c.env?.DEMO_MODE ? message : undefined,
  }, 500);
});

app.notFound((c) => {
  return c.json({ error: "API endpoint not found", code: "NOT_FOUND" }, 404);
});

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    return await app.fetch(context.request, context.env, context);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[CHAMACONNECT] Pages Function fatal error:", error.message, error.stack);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error",
      code: "FUNCTION_FATAL",
      detail: context.env.DEMO_MODE ? error.message : undefined,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
