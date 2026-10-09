import assert from 'node:assert/strict';
import test from 'node:test';
import { newRecoveryKey, parseRecoveryKey, readRecoveryFile } from '../src/app/achievement/passport-recovery';

test('recovery keys use 256 random bits and round trip without encoding loss', () => {
  const id = crypto.randomUUID();
  const keys = new Set(Array.from({length: 50}, () => newRecoveryKey(id)));
  assert.equal(keys.size, 50);
  for (const key of keys) {
    assert.equal(parseRecoveryKey(key).passportId, id);
    assert.match(parseRecoveryKey(key).secret, /^[a-f0-9]{64}$/);
    assert.equal(readRecoveryFile(JSON.stringify({ format: 'life-passport-recovery-v1', key })), key);
  }
});

test('malformed and future recovery formats are rejected before requests', () => {
  for (const key of ['', 'LP1.any.short', 'https://example.com/?key=secret', 'LP2.' + crypto.randomUUID() + '.' + 'a'.repeat(64)]) assert.throws(() => parseRecoveryKey(key));
  for (const text of ['null', '{}', '{"format":"future","key":"secret"}', 'not json']) assert.throws(() => readRecoveryFile(text));
});
