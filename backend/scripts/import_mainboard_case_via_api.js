#!/usr/bin/env node
const fs = require('fs');

const BASE = process.env.API_BASE_URL || 'http://localhost:3000/api';
const SHOP_EMAIL = process.env.SHOP_EMAIL || 'shop.pc.seed.1779206495109@techxchange.dev';
const SHOP_PASSWORD = process.env.SHOP_PASSWORD || '123456';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@techxchange.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const INPUT = process.env.INPUT_JSON || '/Users/kien/Codes/TechXchange/backend/tmp/crawled_mainboard_case_gearvn_ttgshop.json';

const CATEGORY_MAP = {
  'Bo mạch chủ': 6,
  'Vỏ máy tính': 5,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, { method='GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok || json.success === false) {
    const e = new Error(json.message || `HTTP ${res.status}`);
    e.status = res.status;
    e.response = json;
    throw e;
  }
  return json;
}

async function login(email, password) {
  const r = await api('/auth/login', { method: 'POST', body: { email, password } });
  return r.data;
}

function normalizeName(s = '') {
  return String(s).trim().replace(/\s+/g, ' ');
}

function normalizePrice(n) {
  const num = Number(n || 0);
  if (!Number.isFinite(num) || num <= 0) return 1000000;
  return Math.round(num);
}

async function findCatalogByName(name) {
  const q = encodeURIComponent(name);
  const rs = await api(`/products/catalogs?status=all&limit=20&page=1&q=${q}`);
  const rows = rs.data?.catalogs || [];
  const exact = rows.find((c) => normalizeName(c.name).toLowerCase() === normalizeName(name).toLowerCase());
  return exact || null;
}

(async () => {
  const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const items = Array.isArray(raw) ? raw : (raw.items || []);
  const dedupMap = new Map();

  for (const item of items) {
    const categoryName = String(item.categoryName || '').trim();
    const category_id = CATEGORY_MAP[categoryName];
    if (!category_id) continue;

    const name = normalizeName(item.name || '');
    if (!name) continue;

    const key = name.toLowerCase();
    if (dedupMap.has(key)) continue;
    dedupMap.set(key, {
      name,
      category_id,
      brand_name: normalizeName(item.brandName || 'Unknown'),
      default_image: item.image || null,
      description: normalizeName(item.description || `${name} - imported`),
      price: normalizePrice(item.price),
      sourceUrl: item.sourceUrl || null,
    });
  }

  const dataset = Array.from(dedupMap.values());
  console.log('[info] dataset after dedupe:', dataset.length);

  const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const shop = await login(SHOP_EMAIL, SHOP_PASSWORD);
  const adminToken = admin.accessToken;
  const shopToken = shop.accessToken;

  const myStore = await api('/stores/me', { token: shopToken });
  const storeId = Number(myStore.data?.[0]?.id || 0);
  if (!storeId) throw new Error('Không tìm thấy store của shop');

  let requested = 0;
  let approved = 0;
  let listed = 0;
  let skipped = 0;

  for (const item of dataset) {
    let catalogId = null;

    try {
      const created = await api('/products/requests', {
        method: 'POST',
        token: shopToken,
        body: {
          name: item.name,
          category_id: item.category_id,
          brand_name: item.brand_name,
          description: item.description,
          specs: {},
          default_image: item.default_image,
        },
      });
      requested += 1;
      const requestId = Number(created.data?.id || 0);
      if (requestId) {
        const ar = await api(`/admin/product-requests/${requestId}/approve`, {
          method: 'PUT',
          token: adminToken,
        });
        approved += 1;
        catalogId = Number(ar.data?.catalog?.id || ar.data?.request?.catalog_id || 0);
      }
    } catch (e) {
      const msg = String(e.message || '').toLowerCase();
      if (msg.includes('sản phẩm đã có trong catalog') || msg.includes('yêu cầu sản phẩm đang chờ duyệt')) {
        const existing = await findCatalogByName(item.name);
        if (existing?.id) {
          catalogId = Number(existing.id);
        } else {
          skipped += 1;
          continue;
        }
      } else {
        skipped += 1;
        continue;
      }
    }

    if (!catalogId) {
      const existing = await findCatalogByName(item.name);
      if (existing?.id) catalogId = Number(existing.id);
    }
    if (!catalogId) {
      skipped += 1;
      continue;
    }

    try {
      await api('/products', {
        method: 'POST',
        token: shopToken,
        body: {
          catalog_id: catalogId,
          store_id: storeId,
          price: item.price,
          description: `${item.description}${item.sourceUrl ? ` | Source: ${item.sourceUrl}` : ''}`.slice(0, 900),
          status: 'active',
        },
      });
      listed += 1;
    } catch (e) {
      const msg = String(e.message || '').toLowerCase();
      if (!msg.includes('đã tồn tại')) skipped += 1;
    }

    await sleep(50);
  }

  console.log('\n=== IMPORT DONE ===');
  console.log({ storeId, requested, approved, listed, skipped, totalInput: dataset.length });
})();
