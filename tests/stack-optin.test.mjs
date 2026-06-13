import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOptin, deliverOptin, throwIfResendError } from '../api/stack-optin.js';

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
