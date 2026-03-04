const Airtable = require('airtable');
const { Resend } = require('resend');

const FORMSPREE_URL = 'https://formspree.io/f/xykdrzrv';

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
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

  // Required field validation
  if (!body.fullName || !body.email || !body.phone || !body.stuck) {
    return res.status(422).json({ error: 'Missing required fields' });
  }

  const submittedAt = new Date().toISOString();

  // --- Fan out to all three services in parallel ---
  const [formspreeResult, airtableResult, resendResult] = await Promise.allSettled([
    // 1. Formspree — your notification email (PRIMARY)
    fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    }).then(r => {
      if (!r.ok) throw new Error(`Formspree ${r.status}`);
      return r.json();
    }),

    // 2. Airtable — lead record (secondary)
    createAirtableRecord(body, submittedAt),

    // 3. Resend — auto-reply to applicant (secondary)
    sendAutoReply(body),
  ]);

  // Log secondary failures (non-blocking)
  if (airtableResult.status === 'rejected') {
    console.error('Airtable error:', airtableResult.reason);
  }
  if (resendResult.status === 'rejected') {
    console.error('Resend error:', resendResult.reason);
  }

  // Only Formspree failure blocks the response
  if (formspreeResult.status === 'rejected') {
    console.error('Formspree error:', formspreeResult.reason);
    return res.status(502).json({ error: 'Submission failed. Please try again.' });
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
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#333;">We received your application and we're on it. If your business is a good fit for what we do, you'll hear back from me personally within 24–48 hours.</p>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#333;">In the meantime — no need to do anything. We'll review your info and come prepared with ideas if we move forward.</p>
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
