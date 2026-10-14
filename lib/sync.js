const ORDERS_URL = process.env.ORDERS_URL || 'https://test.ooobs.ru/api/orders';

// "+7 999 123-45-67", "8 (999) ...", "79991234567", "9991234567" -> "+79991234567"; иначе null
function normalizePhone(raw) {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.length === 10) d = '7' + d;
  if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
  if (d.length !== 11 || d[0] !== '7') return null;
  return '+' + d;
}

function isBetter(a, b) {
  const am = Number(a.amount) || 0, bm = Number(b.amount) || 0;
  if (am !== bm) return am > bm;
  return Date.parse(a.created_at) > Date.parse(b.created_at);
}

// Чистая функция: одинаковый вход -> одинаковый выход (идемпотентность)
function processOrders(orders) {
  const byPhone = new Map();
  let invalid = 0, duplicates = 0;
  for (const o of orders) {
    const phone = normalizePhone(o.phone);
    if (!phone) { invalid++; continue; }
    const cur = byPhone.get(phone);
    if (!cur) { byPhone.set(phone, { ...o, phone }); continue; }
    duplicates++;
    if (isBetter(o, cur)) byPhone.set(phone, { ...o, phone });
  }
  const clients = [...byPhone.values()]
    .sort((a, b) => a.phone.localeCompare(b.phone))
    .map(o => ({ name: o.name, phone: o.phone, email: o.email ?? '', amount: Number(o.amount) || 0 }));
  return {
    clients,
    stats: { received: orders.length, unique: clients.length, duplicates_merged: duplicates, invalid_dropped: invalid },
  };
}

async function sync() {
  const res = await fetch(ORDERS_URL, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('upstream ' + res.status);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('upstream: expected array');
  return processOrders(data);
}

module.exports = { normalizePhone, processOrders, sync };
