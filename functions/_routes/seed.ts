import { Hono } from 'hono';
import type { Env } from '../_lib/types';
import { seedData } from '../_lib/seed';

const seed = new Hono<{ Bindings: Env }>();

// POST /api/seed - Run the seed script (accessible for testing/setup)
seed.post('/seed', async (c) => {
  // Allow seeding in non-production or when explicitly requested
  const isProduction = c.env.ENVIRONMENT === 'production' && c.env.DEMO_MODE !== 'true';
  const demoMode = c.env.DEMO_MODE === 'true';
  
  if (isProduction && !demoMode) {
    return c.json({ error: 'Seed endpoint not available in production' }, 403);
  }

  try {
    const result = await seedData(c.env.DB);
    return c.json(result, result.success ? 201 : 400);
  } catch (error) {
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default seed;
