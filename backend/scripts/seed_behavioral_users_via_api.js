#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const BASE_URL = String(process.env.BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);
const API_BASE = `${BASE_URL}/api`;
const USER_COUNT = Math.max(1, Number(process.env.USER_COUNT || 20));
const START_INDEX = Math.max(1, Number(process.env.START_INDEX || 1));
const DEFAULT_PASSWORD = String(process.env.DEFAULT_PASSWORD || "123456");
const EMAIL_DOMAIN = String(process.env.EMAIL_DOMAIN || "techxchange.test");
const OUTPUT_DIR = path.resolve(
  __dirname,
  "../../output/seed-users",
);
const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");

const PERSONAS = [
  {
    key: "laptop",
    queries: ["laptop", "macbook", "asus", "thinkpad"],
    prompts: [
      "Tu van laptop hoc tap tam 20 trieu",
      "Laptop nao phu hop lap trinh va van phong?",
    ],
    chatMessage:
      "Cho minh hoi laptop ben shop co phu hop hoc tap va lap trinh khong?",
  },
  {
    key: "phone",
    queries: ["iphone", "samsung", "xiaomi", "dien thoai"],
    prompts: [
      "Dien thoai nao chup anh tot tam 15 trieu?",
      "Goi y smartphone pin tot cho dung hang ngay",
    ],
    chatMessage:
      "Shop co the tu van giup minh mot mau dien thoai pin tot trong tam gia vua phai khong?",
  },
  {
    key: "pc",
    queries: ["gpu", "rtx", "mainboard", "ssd", "ram", "pc"],
    prompts: [
      "Build pc tam 20 trieu cho choi game nhe va hoc tap",
      "Nen uu tien gpu hay cpu cho may tinh tam trung?",
    ],
    chatMessage:
      "Cho minh hoi cau hinh pc ben shop co phu hop gaming tam trung khong?",
  },
  {
    key: "monitor",
    queries: ["monitor", "man hinh", "viewsonic", "lg"],
    prompts: [
      "Man hinh nao phu hop lam viec van phong va giai tri?",
      "Goi y monitor tam gia tot cho hoc tap",
    ],
    chatMessage:
      "Ben shop co man hinh nao phu hop lam viec van phong, kich thuoc 24 inch khong?",
  },
  {
    key: "accessory",
    queries: ["chuot", "ban phim", "tai nghe", "loa"],
    prompts: [
      "Goi y phu kien cong nghe co gia mem",
      "Nen chon chuot va ban phim nao cho hoc tap?",
    ],
    chatMessage:
      "Shop co the tu van giup minh mot vai phu kien cong nghe de hoc tap va lam viec khong?",
  },
];

function pad(num, width = 3) {
  return String(num).padStart(width, "0");
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, rand) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestApi(endpoint, options = {}) {
  const {
    method = "GET",
    token,
    body,
    headers = {},
    allowStatuses = [],
  } = options;

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok && !allowStatuses.includes(response.status)) {
    const message =
      payload?.message || payload?.detail || payload?.raw || response.statusText;
    throw new Error(`${method} ${endpoint} failed (${response.status}): ${message}`);
  }

  return { status: response.status, payload };
}

async function ensureBackendHealthy() {
  for (let i = 0; i < 15; i += 1) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) return;
    } catch {}
    await sleep(1000);
  }
  throw new Error(`Backend not reachable at ${BASE_URL}`);
}

function toProductRecord(raw) {
  if (!raw) return null;
  const productId = Number(raw.id || raw.product_id);
  const storeId = Number(raw.store_id || raw.store?.id || 0);
  if (!productId || !storeId) return null;
  return {
    id: productId,
    store_id: storeId,
    name: raw.name || raw.catalog?.name || `product-${productId}`,
    quantity: Number(raw.quantity || 0),
    price: Number(raw.price || 0),
  };
}

async function fetchProducts(query, limit = 30) {
  const queryString = new URLSearchParams({
    page: "1",
    limit: String(limit),
    ...(query ? { q: query } : {}),
  }).toString();
  const { payload } = await requestApi(`/products?${queryString}`);
  const items = payload?.data?.products || payload?.data?.items || [];
  return uniqueBy(
    items.map(toProductRecord).filter(Boolean).filter((p) => p.quantity > 0),
    (p) => p.id,
  );
}

async function buildProductPools() {
  const allProducts = await fetchProducts("", 100);
  const pools = {};

  for (const persona of PERSONAS) {
    let personaProducts = [];
    for (const query of persona.queries) {
      const result = await fetchProducts(query, 30);
      personaProducts = personaProducts.concat(result);
    }
    personaProducts = uniqueBy(personaProducts, (p) => p.id);
    if (personaProducts.length < 8) {
      personaProducts = uniqueBy(personaProducts.concat(allProducts), (p) => p.id);
    }
    pools[persona.key] = personaProducts;
  }

  return { allProducts, pools };
}

async function registerOrLoginUser(index) {
  const email = `user${index}@${EMAIL_DOMAIN}`;
  const username = `user${index}`;
  const phone = `09${pad(index, 8)}`;
  await requestApi("/auth/register", {
    method: "POST",
    body: {
      email,
      password: DEFAULT_PASSWORD,
      username,
      phone,
      gender: index % 2 === 0 ? "male" : "female",
    },
    allowStatuses: [400],
  }).catch((error) => {
    if (!String(error.message).includes("Email đã được đăng ký")) throw error;
  });

  const login = await requestApi("/auth/login", {
    method: "POST",
    body: {
      email,
      password: DEFAULT_PASSWORD,
    },
  });

  return {
    index,
    email,
    password: DEFAULT_PASSWORD,
    token: login.payload?.data?.accessToken,
    userId: Number(login.payload?.data?.user?.id || 0),
    username,
    phone,
  };
}

async function ensureAddress(user, rand) {
  const existing = await requestApi("/users/addresses", {
    token: user.token,
  });
  const addresses = existing.payload?.data?.addresses || [];
  if (addresses.length > 0) {
    return Number(addresses[0].id);
  }

  const cityOptions = [
    ["Ho Chi Minh", "Quan 1", "Phuong Ben Nghe"],
    ["Ha Noi", "Cau Giay", "Dich Vong"],
    ["Da Nang", "Hai Chau", "Thach Thang"],
  ];
  const [province, district, ward] =
    cityOptions[Math.floor(rand() * cityOptions.length)];
  const created = await requestApi("/users/addresses", {
    method: "POST",
    token: user.token,
    body: {
      full_name: `User ${user.index}`,
      phone: user.phone,
      address_line: `${100 + user.index} Duong Seed`,
      ward,
      district,
      city: province,
      province,
      is_default: true,
    },
  });
  return Number(created.payload?.data?.id || 0);
}

async function trackEvent(user, productId, eventType, sessionId, meta = {}) {
  await requestApi("/events/product", {
    method: "POST",
    token: user.token,
    body: {
      product_id: productId,
      event_type: eventType,
      session_id: sessionId,
      meta,
    },
  });
}

async function addToCart(user, productId, quantity = 1) {
  await requestApi("/cart/items", {
    method: "POST",
    token: user.token,
    body: {
      product_id: productId,
      quantity,
    },
  });
}

async function sendAssistantPrompt(user, prompt) {
  return requestApi("/assistant/chat", {
    method: "POST",
    token: user.token,
    body: {
      message: prompt,
      locale: "vi-VN",
    },
    allowStatuses: [500, 503, 504],
  });
}

async function fetchUserRecommendations(user, mode) {
  return requestApi(
    `/products/recommendations/me?limit=8&mode=${encodeURIComponent(mode)}`,
    {
      token: user.token,
      allowStatuses: [500],
    },
  );
}

async function fetchSimilarRecommendations(productId, mode) {
  return requestApi(
    `/products/${productId}/recommendations?limit=8&mode=${encodeURIComponent(mode)}`,
    {
      allowStatuses: [500],
    },
  );
}

async function sendStoreChat(user, storeId, message) {
  const opened = await requestApi("/chat/open-store", {
    method: "POST",
    token: user.token,
    body: { store_id: storeId },
    allowStatuses: [400],
  });

  const peerUserId = Number(opened.payload?.data?.peer_user_id || 0);
  if (!peerUserId) return false;

  await requestApi("/chat/messages", {
    method: "POST",
    token: user.token,
    body: {
      receiver_id: peerUserId,
      message,
    },
  });

  await requestApi(`/chat/messages/${peerUserId}?limit=20`, {
    token: user.token,
  });
  return true;
}

async function runForUser(user, persona, productPool) {
  const rand = mulberry32(user.index * 7919);
  const sessionId = `seed-${RUN_ID}-${user.index}`;
  const selectedProducts = shuffle(productPool, rand).slice(
    0,
    Math.min(8, productPool.length),
  );

  if (selectedProducts.length === 0) {
    throw new Error(`No products available for persona ${persona.key}`);
  }

  const summary = {
    ...user,
    persona: persona.key,
    address_id: 0,
    products_sampled: selectedProducts.map((p) => p.id).join("|"),
    impression_count: 0,
    view_count: 0,
    click_count: 0,
    wishlist_count: 0,
    synthetic_purchase_count: 0,
    add_to_cart_count: 0,
    assistant_chat_count: 0,
    shop_chat_count: 0,
    recommendation_calls: 0,
  };

  summary.address_id = await ensureAddress(user, rand);

  const impressions = selectedProducts.slice(0, 6);
  for (const product of impressions) {
    await trackEvent(user, product.id, "impression", sessionId, {
      synthetic: true,
      persona: persona.key,
      source: "seed_behavioral_users_via_api",
    });
    summary.impression_count += 1;
  }

  const views = selectedProducts.slice(0, 5);
  for (const product of views) {
    await requestApi(`/products/${product.id}`, { token: user.token });
    await trackEvent(user, product.id, "view", sessionId, {
      synthetic: true,
      persona: persona.key,
      source: "seed_behavioral_users_via_api",
    });
    summary.view_count += 1;
  }

  const clicks = selectedProducts.slice(0, 4);
  for (const product of clicks) {
    await trackEvent(user, product.id, "click", sessionId, {
      synthetic: true,
      persona: persona.key,
      source: "seed_behavioral_users_via_api",
    });
    summary.click_count += 1;
  }

  const wishlists = selectedProducts.slice(0, 2);
  for (const product of wishlists) {
    await trackEvent(user, product.id, "wishlist", sessionId, {
      synthetic: true,
      persona: persona.key,
      source: "seed_behavioral_users_via_api",
    });
    summary.wishlist_count += 1;
  }

  const purchaseCandidates = selectedProducts.slice(0, 1);
  for (const product of purchaseCandidates) {
    await trackEvent(user, product.id, "purchase", sessionId, {
      synthetic: true,
      persona: persona.key,
      source: "seed_behavioral_users_via_api",
      note: "synthetic purchase event for recommendation seeding",
    });
    summary.synthetic_purchase_count += 1;
  }

  const cartCandidates = selectedProducts.slice(0, 3);
  for (const product of cartCandidates) {
    await addToCart(user, product.id, 1 + Math.floor(rand() * 2));
    summary.add_to_cart_count += 1;
  }

  const prompt =
    persona.prompts[Math.floor(rand() * persona.prompts.length)] ||
    persona.prompts[0];
  try {
    const chatResponse = await sendAssistantPrompt(user, prompt);
    if (chatResponse.status === 200) {
      summary.assistant_chat_count += 1;
    }
  } catch {}

  try {
    const didChat = await sendStoreChat(
      user,
      selectedProducts[0].store_id,
      persona.chatMessage,
    );
    if (didChat) summary.shop_chat_count += 1;
  } catch {}

  for (const mode of ["content", "hybrid", "collaborative"]) {
    try {
      await fetchUserRecommendations(user, mode);
      summary.recommendation_calls += 1;
    } catch {}
  }

  for (const mode of ["content", "collaborative"]) {
    try {
      await fetchSimilarRecommendations(selectedProducts[0].id, mode);
      summary.recommendation_calls += 1;
    } catch {}
  }

  return summary;
}

function toCsv(rows) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const raw = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(raw)) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await ensureBackendHealthy();

  const { allProducts, pools } = await buildProductPools();
  if (allProducts.length === 0) {
    throw new Error("Không lấy được sản phẩm nào từ API /products");
  }

  const summaries = [];

  for (let i = 0; i < USER_COUNT; i += 1) {
    const index = START_INDEX + i;
    const user = await registerOrLoginUser(index);
    const persona = PERSONAS[i % PERSONAS.length];
    const pool = pools[persona.key] && pools[persona.key].length > 0
      ? pools[persona.key]
      : allProducts;

    const summary = await runForUser(user, persona, pool);
    summaries.push(summary);
    console.log(
      `[${i + 1}/${USER_COUNT}] seeded ${summary.email} persona=${summary.persona} products=${summary.products_sampled}`,
    );
  }

  const csvPath = path.join(OUTPUT_DIR, `behavioral_users_${RUN_ID}.csv`);
  const jsonPath = path.join(OUTPUT_DIR, `behavioral_users_${RUN_ID}.json`);

  fs.writeFileSync(csvPath, toCsv(summaries), "utf8");
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        base_url: BASE_URL,
        user_count: USER_COUNT,
        start_index: START_INDEX,
        password: DEFAULT_PASSWORD,
        email_domain: EMAIL_DOMAIN,
        summaries,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\nDone.`);
  console.log(`CSV: ${csvPath}`);
  console.log(`JSON: ${jsonPath}`);
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
