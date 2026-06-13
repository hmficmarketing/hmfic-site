import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOptin } from '../api/stack-optin.js';

test('rejects missing email', () => {
  assert.deepEqual(validateOptin({}), { ok: false, error: 'Missing email' });
});

test('rejects malformed email', () => {
  assert.deepEqual(validateOptin({ email: 'not-an-email' }), { ok: false, error: 'Invalid email' });
});

test('accepts a valid email and normalizes case + whitespace', () => {
  assert.deepEqual(validateOptin({ email: '  Alice@Example.COM ' }), { ok: true, email: 'alice@example.com' });
});
