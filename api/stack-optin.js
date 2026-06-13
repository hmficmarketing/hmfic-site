const { Resend } = require('resend');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateOptin(body) {
  const raw = (body.email || '').trim().toLowerCase();
  if (!raw) return { ok: false, error: 'Missing email' };
  if (!EMAIL_RE.test(raw)) return { ok: false, error: 'Invalid email' };
  return { ok: true, email: raw };
}

const KIT_BASE = 'https://api.kit.com/v4';
const PDF_URL = 'https://hmficmarketing.com/downloads/5-prompts-pack.pdf';

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

async function sendDelivery(email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Resend not configured');
  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: 'Matt Holmes <matt@hmficmarketing.com>',
    to: email,
    subject: 'Your 5 prompts are here',
    html: buildDeliveryHtml(),
  });
}

async function notifyMatt(email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Resend not configured');
  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: 'HMFIC Site <matt@hmficmarketing.com>',
    to: 'matt@hmficmarketing.com',
    subject: `New /stack opt-in: ${email}`,
    html: `<p>${email} just opted in for the 5 Prompts pack.</p>`,
  });
}

function buildDeliveryHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;">
      <tr><td style="background:#0a0a0a;padding:32px 40px;text-align:center;"><span style="font-size:28px;font-weight:800;color:#fff;letter-spacing:2px;">HMFIC</span></td></tr>
      <tr><td style="background:#e13728;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:40px;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#0a0a0a;">Here are your 5 prompts.</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#333;">These are the actual operating prompts I run inside the agency every week. Paste-and-go, with worked examples so you know what good output looks like.</p>
        <p style="margin:0 0 24px;"><a href="${PDF_URL}" style="background:#e13728;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:700;font-size:16px;display:inline-block;">Download the pack</a></p>
        <p style="margin:0;font-size:16px;line-height:1.6;color:#333;">Talk soon,<br><strong>Matt Holmes</strong><br><span style="color:#888;font-size:14px;">HMFIC Marketing</span></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function deliverOptin(email, deps) {
  const { addToKit, sendDelivery, notifyMatt } = deps;
  const [kitRes, deliveryRes, notifyRes] = await Promise.allSettled([
    addToKit(email), sendDelivery(email), notifyMatt(email),
  ]);
  if (kitRes.status === 'rejected') console.error('Kit error (subscriber still gets pack):', kitRes.reason);
  if (notifyRes.status === 'rejected') console.error('Notify error:', notifyRes.reason);
  if (deliveryRes.status === 'rejected') {
    console.error('Delivery FAILED:', deliveryRes.reason);
    return { ok: false };
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

  const result = await deliverOptin(v.email, { addToKit, sendDelivery, notifyMatt });
  if (!result.ok) return res.status(502).json({ error: 'Could not send the pack. Please try again.' });
  return res.status(200).json({ ok: true });
};

module.exports.validateOptin = validateOptin;
module.exports.deliverOptin = deliverOptin;
