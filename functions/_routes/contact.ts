import { Hono } from 'hono';
import type { Env } from '../_lib/types';

const contact = new Hono<{ Bindings: Env }>();

contact.post('/contact', async (c) => {
  const { name, email, subject, message } = await c.req.json();
  if (!name || !email || !subject || !message) return c.json({ error: 'All fields are required' }, 400);
  if (message.length < 10) return c.json({ error: 'Message must be at least 10 characters' }, 400);

  // In production, send via email service. For demo, just acknowledge.
  return c.json({ message: 'Your message has been sent. We will get back to you soon.' });
});

export default contact;
