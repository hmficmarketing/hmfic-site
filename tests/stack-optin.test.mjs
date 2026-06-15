import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateOptin, deliverOptin, throwIfResendError, buildCapiPayload, sha256 } from '../api/stack-optin.js';

test('rejects missing email', () => {
  assert.deepEqual(validateOptin({}), { ok: false, error: 'Missing email' });
});

test('rejects malformed email', () => {
  assert.deepEqual(validateOptin({ email: 'not-an-email' }), { ok: false, error: 'Invalid email' });
});

test('accepts a valid email and normalizes case + whitespace', () => {
  assert.deepEqual(validateOptin({ email: '  Alice@Example.COM ' }), { ok: true, email: 'alice@example.com' });
});

// Kit now owns delivery (the stack-pack tag triggers the Kit automation), so
// addToKit is the critical path: if it fails, the subscriber gets nothing.
test('deliverOptin returns ok:false when Kit add fails', async () => {
  const result = await deliverOptin('alice@example.com', {
    addToKit: async () => { throw new Error('Kit down'); },
    notifyMatt: async () => ({}),
  });
  assert.equal(result.ok, false);
});

test('deliverOptin returns ok:true when Kit succeeds even if the Matt notification fails', async () => {
  const result = await deliverOptin('alice@example.com', {
    addToKit: async () => true,
    notifyMatt: async () => { throw new Error('notify down'); },
  });
  assert.equal(result.ok, true);
});

test('throwIfResendError throws when Resend returns an error object', () => {
  assert.throws(() => throwIfResendError({ data: null, error: { name: 'rate_limit', message: 'slow down' } }));
});

test('throwIfResendError returns data when there is no error', () => {
  assert.deepEqual(throwIfResendError({ data: { id: 'em_1' }, error: null }), { id: 'em_1' });
});

// --- Meta CAPI Lead ---

test('buildCapiPayload sends a Lead with the SHA-256 hashed email and nothing else as PII', () => {
  const p = buildCapiPayload('alice@example.com', { eventTime: 1700000000 });
  const event = p.data[0];
  assert.equal(event.event_name, 'Lead');
  assert.equal(event.action_source, 'website');
  assert.equal(event.event_time, 1700000000);
  assert.deepEqual(event.user_data.em, [createHash('sha256').update('alice@example.com').digest('hex')]);
  // raw email must never appear anywhere in the payload
  assert.ok(!JSON.stringify(p).includes('alice@example.com'));
});

test('buildCapiPayload carries event_id (for dedupe) and match signals when present', () => {
  const event = buildCapiPayload('a@b.com', {
    eventId: 'evt-123',
    eventSourceUrl: 'https://hmficmarketing.com/stack',
    clientIp: '203.0.113.7',
    userAgent: 'Mozilla/5.0',
    fbp: 'fb.1.x',
    fbc: 'fb.1.y',
  }).data[0];
  assert.equal(event.event_id, 'evt-123');
  assert.equal(event.event_source_url, 'https://hmficmarketing.com/stack');
  assert.equal(event.user_data.client_ip_address, '203.0.113.7');
  assert.equal(event.user_data.client_user_agent, 'Mozilla/5.0');
  assert.equal(event.user_data.fbp, 'fb.1.x');
  assert.equal(event.user_data.fbc, 'fb.1.y');
});

test('buildCapiPayload omits optional fields when absent', () => {
  const event = buildCapiPayload('a@b.com', {}).data[0];
  assert.equal(event.event_id, undefined);
  assert.equal(event.event_source_url, undefined);
  assert.equal(event.user_data.fbp, undefined);
  assert.equal(event.user_data.fbc, undefined);
  assert.equal(event.user_data.client_ip_address, undefined);
});

test('sha256 helper matches node crypto', () => {
  assert.equal(sha256('x@y.com'), createHash('sha256').update('x@y.com').digest('hex'));
});

test('deliverOptin still returns ok:true when the CAPI Lead fails (best-effort, non-blocking)', async () => {
  let kitCalled = false;
  const result = await deliverOptin('alice@example.com', {
    addToKit: async () => { kitCalled = true; return true; },
    notifyMatt: async () => ({}),
    fireCapiLead: async () => { throw new Error('Meta down'); },
  });
  assert.equal(result.ok, true);
  assert.equal(kitCalled, true);
});

test('deliverOptin does NOT fire the CAPI Lead when the Kit add fails', async () => {
  let capiCalled = false;
  const result = await deliverOptin('alice@example.com', {
    addToKit: async () => { throw new Error('Kit down'); },
    notifyMatt: async () => ({}),
    fireCapiLead: async () => { capiCalled = true; return { events_received: 1 }; },
  });
  assert.equal(result.ok, false);
  assert.equal(capiCalled, false);
});
