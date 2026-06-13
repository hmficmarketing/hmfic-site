import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOptin, deliverOptin } from '../api/stack-optin.js';

test('rejects missing email', () => {
  assert.deepEqual(validateOptin({}), { ok: false, error: 'Missing email' });
});

test('rejects malformed email', () => {
  assert.deepEqual(validateOptin({ email: 'not-an-email' }), { ok: false, error: 'Invalid email' });
});

test('accepts a valid email and normalizes case + whitespace', () => {
  assert.deepEqual(validateOptin({ email: '  Alice@Example.COM ' }), { ok: true, email: 'alice@example.com' });
});

test('deliverOptin returns ok when Kit rejects but delivery resolves', async () => {
  const calls = [];
  const result = await deliverOptin('alice@example.com', {
    addToKit: async () => { calls.push('kit'); throw new Error('Kit down'); },
    sendDelivery: async () => { calls.push('delivery'); return { id: 'em_1' }; },
    notifyMatt: async () => { calls.push('notify'); return { id: 'em_2' }; },
  });
  assert.equal(result.ok, true);
  assert.ok(calls.includes('delivery'));
});

test('deliverOptin returns ok:false when delivery itself fails', async () => {
  const result = await deliverOptin('alice@example.com', {
    addToKit: async () => ({}),
    sendDelivery: async () => { throw new Error('Resend down'); },
    notifyMatt: async () => ({}),
  });
  assert.equal(result.ok, false);
});
