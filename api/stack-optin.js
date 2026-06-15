const { Resend } = require('resend');
const crypto = require('crypto');

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

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

// Builds the Meta Conversions API "Lead" payload. `email` must already be
// normalized (lowercased + trimmed) — validateOptin does that. The email is
// the only PII sent, hashed SHA-256 per Meta's matching spec. event_id is what
// dedupes this server event against the browser fbq('track','Lead',{eventID}).
function buildCapiPayload(email, ctx = {}) {
  const { eventId, eventSourceUrl, clientIp, userAgent, fbp, fbc, eventTime } = ctx;
  const userData = { em: [sha256(email)] };
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  const event = {
    event_name: 'Lead',
    event_time: eventTime || Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: userData,
  };
  if (eventId) event.event_id = eventId;
  if (eventSourceUrl) event.event_source_url = eventSourceUrl;
  return { data: [event] };
}

// Fires the server-side Lead to Meta. Returns Meta's response so the caller can
// log events_received (the only real proof it landed — see CAPI verification
// principle). Throws on misconfig or non-2xx so deliverOptin can swallow it
// (CAPI is best-effort; a Meta outage must never block signup).
async function fireCapiLead(email, ctx = {}) {
  const pixelId = process.env.STACK_META_PIXEL_ID;
  const token = process.env.STACK_META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) throw new Error('CAPI not configured');
  const payload = buildCapiPayload(email, ctx);
  if (process.env.STACK_META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.STACK_META_TEST_EVENT_CODE;
  }
  const r = await fetch(`https://graph.facebook.com/v22.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Meta CAPI ${r.status}: ${JSON.stringify(data)}`);
  return data; // { events_received, messages, fbtrace_id }
}

// Kit delivers the pack (via the stack-pack automation), so addToKit is the
// critical path. The CAPI Lead and the Matt notification are both best-effort
// and never block the response. The server-side Lead fires only after a
// successful Kit add, so we never report a lead Meta-side that didn't subscribe.
async function deliverOptin(email, deps, ctx = {}) {
  const { addToKit, notifyMatt, fireCapiLead } = deps;
  try {
    await addToKit(email);
  } catch (e) {
    console.error('Kit add FAILED (no pack sent):', e);
    return { ok: false };
  }
  if (fireCapiLead) {
    try {
      const meta = await fireCapiLead(email, ctx);
      console.log('CAPI Lead events_received:', meta && meta.events_received, 'fbtrace:', meta && meta.fbtrace_id);
    } catch (e) {
      console.error('CAPI Lead error (non-blocking):', e);
    }
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

  // Context for the server-side Meta Lead. event_id comes from the browser so
  // it dedupes against the client fbq('track','Lead',{eventID}); fbp/fbc are
  // the Meta cookies the browser forwards for better match quality.
  const fwd = req.headers['x-forwarded-for'];
  const ctx = {
    eventId: body.event_id,
    eventSourceUrl: body.event_source_url || req.headers['referer'],
    clientIp: (fwd ? String(fwd).split(',')[0].trim() : '') || req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
    fbp: body.fbp,
    fbc: body.fbc,
  };

  const result = await deliverOptin(v.email, { addToKit, notifyMatt, fireCapiLead }, ctx);
  if (!result.ok) return res.status(502).json({ error: 'Could not sign you up. Please try again.' });
  return res.status(200).json({ ok: true });
};

module.exports.validateOptin = validateOptin;
module.exports.deliverOptin = deliverOptin;
module.exports.throwIfResendError = throwIfResendError;
module.exports.buildCapiPayload = buildCapiPayload;
module.exports.sha256 = sha256;
