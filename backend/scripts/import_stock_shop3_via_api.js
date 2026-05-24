#!/usr/bin/env node
const BASE = 'http://localhost:3000/api';
const EMAIL = process.env.SHOP_EMAIL || 'shop.pc.seed.1779206495109@techxchange.dev';
const PASSWORD = process.env.SHOP_PASSWORD || '123456';

async function req(path, { method='GET', token, body }={}) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error(j.message || `HTTP ${r.status}`);
  return j;
}

(async () => {
  const login = await req('/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  const token = login.data.accessToken;

  let page = 1;
  const limit = 100;
  const products = [];
  while (page < 30) {
    const rs = await req(`/products/me?page=${page}&limit=${limit}&status=all`, { token });
    const rows = rs.data?.products || [];
    products.push(...rows);
    if (!rows.length || rows.length < limit) break;
    page += 1;
  }

  let imported = 0;
  let touchedProducts = 0;
  for (const p of products) {
    const pid = Number(p.id);
    if (!pid) continue;
    let details;
    try {
      details = await req(`/stores/me/inventory/${pid}/transactions?limit=20&offset=0`, { token });
    } catch {
      continue;
    }
    const variants = details.data?.variants || [];
    if (!variants.length) continue;
    touchedProducts += 1;

    for (const v of variants) {
      const serialId = Number(v.serial_id);
      if (!serialId) continue;
      const qty = Math.max(2, Math.min(8, (pid + serialId) % 9));
      const cost = Math.max(1000, Math.round(Number(p.price || 1000000) * 0.75));
      try {
        await req('/stores/me/inventory/import', {
          method: 'POST',
          token,
          body: {
            product_id: pid,
            serial_id: serialId,
            quantity: qty,
            unit_cost: cost,
            note: 'Auto nhập kho test chatbot build PC',
          },
        });
        imported += 1;
      } catch (e) {
        console.log(`skip ${pid}/${serialId}: ${e.message}`);
      }
    }
  }

  console.log(`DONE - products touched: ${touchedProducts}, imports success: ${imported}`);
})();
