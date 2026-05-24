#!/usr/bin/env node
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@techxchange.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
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
    const msg = json?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.response = json;
    err.status = res.status;
    throw err;
  }
  return json;
}

function pickPrice(catalog) {
  const msrp = Number(catalog.msrp || 0);
  if (!Number.isFinite(msrp) || msrp <= 0) return 1000000;
  return Math.max(1000, Math.round(msrp * 0.98));
}

function isPcPart(c) {
  const category = String(c?.category?.name || '').toLowerCase();
  const name = String(c?.name || '').toLowerCase();

  // Nhóm category linh kiện PC chuẩn trong hệ thống của bạn
  const pcCategoryKeywords = [
    'cpu',
    'ram',
    'ssd',
    'hdd',
    'ổ cứng',
    'card đồ họa',
    'card do hoa',
    'gpu',
    'nguồn máy tính',
    'nguon may tinh',
    'psu',
    'bo mạch chủ',
    'bo mach chu',
    'mainboard',
    'motherboard',
    'tản nhiệt cpu',
    'tan nhiet cpu',
    'vỏ máy tính',
    'vo may tinh',
    'case pc',
    'quạt case',
    'quat case',
    'linh kiện điện tử',
    'linh kien dien tu',
  ];

  if (pcCategoryKeywords.some((k) => category.includes(k))) return true;

  // Fallback theo tên để không sót item
  const nameKeywords = [
    'rtx', 'radeon', 'geforce', 'ryzen', 'core i', 'ddr4', 'ddr5',
    'nvme', 'pcie', 'mainboard', 'motherboard', 'psu', 'cooler'
  ];
  return nameKeywords.some((k) => name.includes(k));
}

async function login(email, password) {
  const r = await api('/auth/login', { method: 'POST', body: { email, password } });
  return r.data;
}

(async () => {
  const stamp = Date.now();
  const shopUser = {
    email: `shop.pc.seed.${stamp}@techxchange.dev`,
    password: '123456',
    username: `shop_pc_seed_${String(stamp).slice(-6)}`,
    phone: `09${String(stamp).slice(-8)}`,
  };

  console.log('[1/8] Reset admin password...');
  await api('/auth/reset-password', {
    method: 'POST',
    body: {
      email: ADMIN_EMAIL,
      newPassword: ADMIN_PASSWORD,
      confirmPassword: ADMIN_PASSWORD,
    },
  });

  console.log('[2/8] Login admin...');
  const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const adminToken = admin.accessToken;

  console.log('[3/8] Register shop user...');
  await api('/auth/register', { method: 'POST', body: shopUser });

  console.log('[4/8] Login shop user (role=user)...');
  const userLogin = await login(shopUser.email, shopUser.password);
  const userToken = userLogin.accessToken;

  console.log('[5/8] Create store request...');
  await api('/stores/requests', {
    method: 'POST',
    token: userToken,
    body: {
      store_name: `Shop PC Seed ${String(stamp).slice(-4)}`,
      store_description: 'Shop chuyên linh kiện PC phục vụ test chatbot build máy',
      contact_phone: shopUser.phone,
      address_line: '120 Văn Tự',
      ward: 'Xã Văn Tự',
      district: 'Huyện Thường Tín',
      city: 'Hà Nội',
      province: 'Hà Nội',
      ghn_province_id: 201,
      ghn_district_id: 3303,
      ghn_ward_code: '1B2729',
    },
  });

  console.log('[6/8] Approve store request as admin...');
  const reqList = await api('/admin/store-requests?status=pending&limit=50&page=1', {
    token: adminToken,
  });
  const req = (reqList.data?.requests || []).find((r) => Number(r.user_id) === Number(userLogin.user.id));
  if (!req) throw new Error('Không tìm thấy store request pending để duyệt');
  await api(`/admin/store-requests/${req.id}/approve`, { method: 'PUT', token: adminToken });

  console.log('[7/8] Login lại shop user (role=shop) và lấy store...');
  const shopLogin = await login(shopUser.email, shopUser.password);
  const shopToken = shopLogin.accessToken;
  const myStores = await api('/stores/me', { token: shopToken });
  const store = myStores.data?.[0];
  if (!store?.id) throw new Error('Không lấy được store sau khi duyệt');

  console.log('[8/8] Tạo listing linh kiện PC từ catalog...');
  let page = 1;
  const limit = 100;
  const all = [];
  while (page <= 20) {
    const rs = await api(`/products/catalogs?status=active&limit=${limit}&page=${page}`);
    const rows = rs.data?.catalogs || [];
    if (!rows.length) break;
    all.push(...rows);
    if (rows.length < limit) break;
    page += 1;
  }

  const candidates = all.filter(isPcPart);
  const selected = candidates;
  let created = 0;
  for (const c of selected) {
    try {
      await api('/products', {
        method: 'POST',
        token: shopToken,
        body: {
          catalog_id: Number(c.id),
          store_id: Number(store.id),
          price: pickPrice(c),
          description: `Listing test chatbot build PC - ${c.name}`,
          status: 'active',
        },
      });
      created += 1;
    } catch (e) {
      if (!String(e.message).toLowerCase().includes('đã tồn tại')) {
        console.log(`  - skip catalog ${c.id}: ${e.message}`);
      }
    }
  }

  console.log('\n=== DONE ===');
  console.log('Shop account:');
  console.log(`- email: ${shopUser.email}`);
  console.log(`- password: ${shopUser.password}`);
  console.log(`- phone: ${shopUser.phone}`);
  console.log(`- store_id: ${store.id}`);
  console.log(`- listings created: ${created}`);
})();
