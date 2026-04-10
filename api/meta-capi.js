const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://hmficmarketing.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  if (!pixelId || !token) {
    console.error('Meta CAPI not configured: missing META_PIXEL_ID or META_CAPI_TOKEN');
    return res.status(200).json({ ok: true, skipped: true });
  }

  const body = req.body;
  const now = Math.floor(Date.now() / 1000);

  // Hash PII fields per Facebook requirements (SHA-256, lowercase, trimmed)
  const userData = {};
  if (body.email) {
    userData.em = [sha256(body.email.toLowerCase().trim())];
  }
  if (body.phone) {
    // Strip non-digits, prepend country code if missing
    let phone = body.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '1' + phone;
    userData.ph = [sha256(phone)];
  }
  userData.client_user_agent = req.headers['user-agent'] || '';
  userData.client_ip_address = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';

  const eventData = {
    data: [
      {
        event_name: body.event_name || 'Lead',
        event_time: now,
        event_id: body.event_id || undefined,
        event_source_url: body.source_url || '',
        action_source: 'website',
        user_data: userData,
      },
    ],
  };

  try {
    const fbRes = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }
    );
    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      console.error('Meta CAPI error:', fbData);
    }

    return res.status(200).json({ ok: true, events_received: fbData.events_received });
  } catch (err) {
    console.error('Meta CAPI fetch error:', err.message);
    return res.status(200).json({ ok: true, error: err.message });
  }
};

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
