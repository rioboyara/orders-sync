const assert = require('assert');
const { normalizePhone, processOrders: run } = require('./lib/sync');
assert.strictEqual(normalizePhone('8 (999) 123 45 67'), '+79991234567');
assert.strictEqual(normalizePhone('+7-926-123-45-67'), '+79261234567');
assert.strictEqual(normalizePhone('9005551212'), '+79005551212');
assert.strictEqual(normalizePhone('+7 999'), null);
assert.strictEqual(normalizePhone('не указан'), null);
const r = run([
  { name: 'a', phone: '89991234567', amount: 100, created_at: '2026-10-01T00:00:00Z' },
  { name: 'b', phone: '+79991234567', amount: 100, created_at: '2026-10-02T00:00:00Z' },
  { name: 'c', phone: '123', amount: 1, created_at: '2026-10-02T00:00:00Z' },
]);
assert.strictEqual(r.clients[0].name, 'b');
assert.deepStrictEqual(r.stats, { received: 3, unique: 1, duplicates_merged: 1, invalid_dropped: 1 });
console.log('ok');
