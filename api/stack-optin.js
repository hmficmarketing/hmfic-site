const { Resend } = require('resend');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateOptin(body) {
  const raw = (body.email || '').trim().toLowerCase();
  if (!raw) return { ok: false, error: 'Missing email' };
  if (!EMAIL_RE.test(raw)) return { ok: false, error: 'Invalid email' };
  return { ok: true, email: raw };
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://hmficmarketing.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};

  // Honeypot — silent accept
  if (body._gotcha) return res.status(200).json({ ok: true });

  // Turnstile
  const token = body['cf-turnstile-response'];
  if (!token) return res.status(422).json({ error: 'Spam check failed. Please refresh and try again.' });
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const tr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const td = await tr.json();
    if (!td.success) {
      console.error('Turnstile rejection:', td);
      return res.status(422).json({ error: 'Spam check failed. Please refresh and try again.' });
    }
  }

  const v = validateOptin(body);
  if (!v.ok) return res.status(422).json({ error: v.error });

  // Kit + Resend fan-out added in Task 8.
  return res.status(200).json({ ok: true });
};

module.exports.validateOptin = validateOptin;
