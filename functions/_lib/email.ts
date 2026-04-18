import type { Env } from './types';

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_EMAIL_FROM = 'chamaconnect@scrapifie.com';

export async function sendOtpEmail(env: Env, recipientEmail: string, code: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const fromEmail = env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM;
  const payload = {
    from: fromEmail,
    to: [recipientEmail],
    subject: 'Your ChamaConnect verification code',
    text: `Your ChamaConnect verification code is ${code}. This code expires in 10 minutes.`,
    html: `<p>Your ChamaConnect verification code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
  };

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Resend API request failed (${response.status}): ${responseText}`);
  }
}
