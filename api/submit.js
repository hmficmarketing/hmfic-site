const Airtable = require('airtable');
const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://hmficmarketing.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;

  // Honeypot check — silent reject
  if (body._gotcha) {
    return res.status(200).json({ ok: true });
  }

  // Turnstile verification — reject bots
  const turnstileToken = body['cf-turnstile-response'];
  if (!turnstileToken) {
    return res.status(422).json({ error: 'Spam check failed. Please refresh and try again.' });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(turnstileToken)}`,
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      console.error('Turnstile rejection:', turnstileData);
      return res.status(422).json({ error: 'Spam check failed. Please refresh and try again.' });
    }
  }

  // Required field validation
  if (!body.fullName || !body.email || !body.phone || !body.stuck) {
    return res.status(422).json({ error: 'Missing required fields' });
  }

  const submittedAt = new Date().toISOString();

  // --- Fan out to all services in parallel ---
  const [airtableResult, autoReplyResult, notifyResult] = await Promise.allSettled([
    // 1. Airtable — lead record
    createAirtableRecord(body, submittedAt),

    // 2. Resend — auto-reply to applicant
    sendAutoReply(body),

    // 3. Resend — notify Matt directly
    sendLeadNotification(body, submittedAt),
  ]);

  // Log failures (non-blocking — lead is already in Airtable)
  if (airtableResult.status === 'rejected') {
    console.error('Airtable error:', airtableResult.reason);
  }
  if (autoReplyResult.status === 'rejected') {
    console.error('Resend auto-reply error:', autoReplyResult.reason);
  }
  if (notifyResult.status === 'rejected') {
    console.error('Resend notification error:', notifyResult.reason);
  }

  return res.status(200).json({ ok: true });
};

// --- Airtable ---
async function createAirtableRecord(body, submittedAt) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Applications';

  if (!apiKey || !baseId) {
    throw new Error('Airtable not configured');
  }

  const base = new Airtable({ apiKey }).base(baseId);

  return base(tableName).create({
    'Full Name': body.fullName,
    'Email': body.email,
    'Phone': body.phone,
    'Business Name': body.businessName || '',
    'Website': body.website || '',
    'Running Ads': body.runningAds || '',
    'Monthly Ad Spend': body.monthlyAdSpend || '',
    'CPL / CPA': body.cplCpa || '',
    'Stuck / Notes': body.stuck,
    'Submitted At': submittedAt,
  });
}

// --- Resend ---
async function sendAutoReply(body) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Resend not configured');
  }

  const resend = new Resend(apiKey);
  const firstName = body.fullName.split(' ')[0];

  return resend.emails.send({
    from: 'Matt Holmes <matt@hmficmarketing.com>',
    to: body.email,
    subject: `${firstName}, we got your application`,
    html: buildAutoReplyHtml(firstName),
  });
}

// --- Resend — notify Matt ---
async function sendLeadNotification(body, submittedAt) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Resend not configured');
  }

  const resend = new Resend(apiKey);

  return resend.emails.send({
    from: 'HMFIC Site <matt@hmficmarketing.com>',
    to: 'matt@hmficmarketing.com',
    subject: `New Lead: ${body.fullName}`,
    html: buildNotificationHtml(body, submittedAt),
  });
}

function buildNotificationHtml(body, submittedAt) {
  const fields = [
    ['Name', body.fullName],
    ['Email', body.email],
    ['Phone', body.phone],
    ['Business', body.businessName || '—'],
    ['Website', body.website || '—'],
    ['Running Ads', body.runningAds || '—'],
    ['Monthly Ad Spend', body.monthlyAdSpend || '—'],
    ['CPL / CPA', body.cplCpa || '—'],
    ['What They\'re Stuck On', body.stuck],
    ['Submitted', new Date(submittedAt).toLocaleString('en-US', { timeZone: 'America/Chicago' })],
  ];

  const rows = fields.map(([label, value]) =>
    `<tr><td style="padding:8px 12px;font-weight:600;color:#0a0a0a;border-bottom:1px solid #eee;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:8px 12px;color:#333;border-bottom:1px solid #eee;">${value}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr><td style="background:#0a0a0a;padding:24px 40px;text-align:center;">
          <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:2px;">NEW LEAD</span>
        </td></tr>
        <tr><td style="background:#e63946;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:24px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildAutoReplyHtml(firstName) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:32px 40px;text-align:center;">
            <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:2px;">HMFIC</span>
          </td>
        </tr>
        <!-- Red accent bar -->
        <tr>
          <td style="background:#e63946;height:4px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#0a0a0a;">Hey ${firstName},</h1>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#333;">We received your application and we're on it. If your business is a good fit for what we do, you'll hear back from me personally within 24 to 48 hours.</p>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#333;">In the meantime, no need to do anything. We'll review your info and come prepared with ideas if we move forward.</p>
            <p style="margin:0;font-size:16px;line-height:1.6;color:#333;">Talk soon,<br><strong>Matt Holmes</strong><br><span style="color:#888;font-size:14px;">HMFIC Marketing</span></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">HMFIC Marketing &middot; hmficmarketing.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
