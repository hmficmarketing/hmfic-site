const { Resend } = require('resend');

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function throwIfResendError({ data, error }) {
  if (error) throw new Error(`Resend error: ${error.name || 'unknown'} — ${error.message || ''}`);
  return data;
}

const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function validateOptin(body) {
  const raw = (body.email || '').trim().toLowerCase();
  if (!raw) return { ok: false, error: 'Missing email' };
  if (!EMAIL_RE.test(raw)) return { ok: false, error: 'Invalid email' };
  return { ok: true, email: raw };
}

const KIT_BASE = 'https://api.kit.com/v4';

// Adds the subscriber to Kit and applies the stack-pack tag. The tag is the
// trigger for the Kit automation that delivers the pack and runs the day-2
// follow-up, so this is the critical delivery path: if it fails, the
// subscriber gets no pack and no follow-up.
async function addToKit(email) {
  const apiKey = process.env.KIT_API_KEY;
  const tagId = process.env.KIT_STACK_TAG_ID;
  if (!apiKey || !tagId) throw new Error('Kit not configured');
  const sub = await fetch(`${KIT_BASE}/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
    body: JSON.stringify({ email_address: email }),
  });
  if (!sub.ok) throw new Error(`Kit subscriber upsert failed: ${sub.status}`);
  const tag = await fetch(`${KIT_BASE}/tags/${tagId}/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
    body: JSON.stringify({ email_address: email }),
  });
  if (!tag.ok) throw new Error(`Kit tag failed: ${tag.status}`);
  return true;
}

async function notifyMatt(email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Resend not configured');
  const resend = new Resend(apiKey);
  const res = await resend.emails.send({
    from: 'HMFIC Site <matt@hmficmarketing.com>',
    to: 'matt@hmficmarketing.com',
    subject: `New /stack opt-in: ${email}`,
    html: `<p>${escHtml(email)} just opted in for the 5 Prompts pack.</p>`,
  });
  return throwIfResendError(res);
}

// Kit delivers the pack (via the stack-pack automation), so addToKit is the
// critical path. notifyMatt is best-effort and never blocks the response.
//
// TODO(CAPI): once the server-side Meta Conversions API bridge is set up, fire
// a server-side "Lead" event here (after a successful addToKit) for pixel
// 318856247215986, with the hashed email + an event_id that matches the
// client-side fbq('track','Lead', {eventID}) call so the two dedupe. This is
// what makes the leads trackable/optimizable in Meta beyond the browser pixel.
// See Agency CAPI Pattern in vault memory for the reusable convention.
async function deliverOptin(email, deps) {
  const { addToKit, notifyMatt } = deps;
  try {
    await addToKit(email);
  } catch (e) {
    console.error('Kit add FAILED (no pack sent):', e);
    return { ok: false };
  }
  try {
    await notifyMatt(email);
  } catch (e) {
    console.error('Notify error:', e);
  }
  return { ok: true };
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

  const result = await deliverOptin(v.email, { addToKit, notifyMatt });
  if (!result.ok) return res.status(502).json({ error: 'Could not sign you up. Please try again.' });
  return res.status(200).json({ ok: true });
};

module.exports.validateOptin = validateOptin;
module.exports.deliverOptin = deliverOptin;
module.exports.throwIfResendError = throwIfResendError;
