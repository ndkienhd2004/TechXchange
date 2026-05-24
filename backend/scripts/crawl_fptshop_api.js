/* eslint-disable no-console */
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const CATEGORY_API =
  "https://papi.fptshop.com.vn/gw/v1/public/fulltext-search-service/category";
const BY_UPCS_API = "https://fptshop.com.vn/api/products/by-upcs";

const DEFAULT_SLUGS = [
  "dien-thoai",
  "laptop",
  "man-hinh",
  "ban-phim",
  "chuot",
  "o-cung",
  "camera",
  "phu-kien",
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    slugs: DEFAULT_SLUGS,
    targetCount: 1000,
    pageSize: 24,
    sortMethod: "noi-bat",
    delayMs: 800,
    maxPerSlug: null,
    jsonOutput: null,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--slugs") {
      out.slugs = String(args[++i] || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    } else if (arg === "--target-count") {
      out.targetCount = Number(args[++i]);
    } else if (arg === "--page-size") {
      out.pageSize = Number(args[++i]);
    } else if (arg === "--sort-method") {
      out.sortMethod = String(args[++i] || "noi-bat");
    } else if (arg === "--delay-ms") {
      out.delayMs = Number(args[++i]);
    } else if (arg === "--max-per-slug") {
      out.maxPerSlug = Number(args[++i]);
    } else if (arg === "--json-output") {
      out.jsonOutput = String(args[++i] || "");
    }
  }

  if (!out.slugs.length) throw new Error("Thiếu slug");
  if (!Number.isInteger(out.targetCount) || out.targetCount <= 0) {
    throw new Error("target-count không hợp lệ");
  }
  if (!Number.isInteger(out.pageSize) || out.pageSize <= 0 || out.pageSize > 100) {
    throw new Error("page-size không hợp lệ");
  }
  if (!Number.isInteger(out.delayMs) || out.delayMs < 0) {
    throw new Error("delay-ms không hợp lệ");
  }
  if (
    out.maxPerSlug !== null &&
    (!Number.isInteger(out.maxPerSlug) || out.maxPerSlug <= 0)
  ) {
    throw new Error("max-per-slug không hợp lệ");
  }

  return out;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const postJson = async (url, payload) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`POST ${url} thất bại: ${res.status}`);
  }
  return res.json();
};

const getJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} thất bại: ${res.status}`);
  }
  return res.json();
};

const normalizeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const mapItem = (item, slug) => ({
  source: "fptshop",
  sourceSlug: slug,
  code: String(item.code || ""),
  name: String(item.displayName || item.name || "").trim(),
  slug: String(item.slug || "").trim(),
  url: item.slug ? `https://fptshop.com.vn/${item.slug}` : null,
  brand: item.brand?.name ? String(item.brand.name).trim() : null,
  industry: item.industry?.name ? String(item.industry.name).trim() : null,
  productType: item.productType?.name ? String(item.productType.name).trim() : null,
  currentPrice: normalizeNumber(item.currentPrice),
  originalPrice: normalizeNumber(item.originalPrice),
  totalInventory: normalizeNumber(item.totalInventory),
  image: item.image?.src ? String(item.image.src).trim() : null,
  crawledAt: new Date().toISOString(),
});

const mergeDetail = (base, detail) => {
  const merged = { ...base };
  if (detail.name) merged.name = detail.name;
  if (detail.slug) {
    merged.slug = detail.slug;
    merged.url = `https://fptshop.com.vn/${detail.slug}`;
  }
  if (detail.brand?.name) merged.brand = String(detail.brand.name).trim();
  if (detail.industry?.name) merged.industry = String(detail.industry.name).trim();
  if (detail.productType?.name) {
    merged.productType = String(detail.productType.name).trim();
  }
  if (detail.image?.src) merged.image = String(detail.image.src).trim();
  if (normalizeNumber(detail.currentPrice) !== null) {
    merged.currentPrice = normalizeNumber(detail.currentPrice);
  }
  if (normalizeNumber(detail.originalPrice) !== null) {
    merged.originalPrice = normalizeNumber(detail.originalPrice);
  }
  if (normalizeNumber(detail.totalInventory) !== null) {
    merged.totalInventory = normalizeNumber(detail.totalInventory);
  }
  return merged;
};

const enrichByCodes = async (items, delayMs = 0, batchSize = 24) => {
  const itemMap = new Map(items.map((x) => [x.code, x]));
  const codes = Array.from(itemMap.keys()).filter(Boolean);
  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize);
    const url = `${BY_UPCS_API}?upcs=${encodeURIComponent(batch.join(","))}`;
    try {
      // eslint-disable-next-line no-await-in-loop
      const detailResp = await getJson(url);
      const detailItems = Array.isArray(detailResp?.items) ? detailResp.items : [];
      detailItems.forEach((d) => {
        const code = String(d.code || "");
        const base = itemMap.get(code);
        if (base) itemMap.set(code, mergeDetail(base, d));
      });
    } catch (error) {
      console.warn(`[warn] by-upcs failed batch ${i / batchSize + 1}:`, error.message);
    }
    if (delayMs > 0) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(delayMs);
    }
  }
  return Array.from(itemMap.values());
};

const crawlSlug = async (slug, opts, globalMap) => {
  let skipCount = 0;
  let totalCount = null;
  let localCount = 0;

  while (true) {
    const payload = {
      skipCount,
      maxResultCount: opts.pageSize,
      sortMethod: opts.sortMethod,
      slug,
      categoryType: "category",
      location: {},
    };

    // eslint-disable-next-line no-await-in-loop
    const data = await postJson(CATEGORY_API, payload);
    const items = Array.isArray(data?.items) ? data.items : [];
    if (totalCount === null) totalCount = Number(data?.totalCount || 0);

    if (!items.length) break;

    items.forEach((item) => {
      const code = String(item.code || "");
      if (!code) return;
      if (globalMap.has(code)) return;
      const mapped = mapItem(item, slug);
      if (!mapped.name) return;
      globalMap.set(code, mapped);
      localCount += 1;
    });

    if (globalMap.size >= opts.targetCount) break;
    if (opts.maxPerSlug && localCount >= opts.maxPerSlug) break;

    skipCount += opts.pageSize;
    if (skipCount >= totalCount) break;

    if (opts.delayMs > 0) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(opts.delayMs);
    }
  }

  return { slug, localCount, totalCount: totalCount || 0 };
};

const run = async () => {
  const opts = parseArgs();
  const globalMap = new Map();
  const crawlStats = [];
  const failedSlugs = [];

  console.log("Starting FPTShop API crawl...");
  console.log("Slugs:", opts.slugs.join(", "));
  console.log("Target count:", opts.targetCount);

  for (const slug of opts.slugs) {
    if (globalMap.size >= opts.targetCount) break;
    console.log(`\n[slug] ${slug}`);
    try {
      // eslint-disable-next-line no-await-in-loop
      const stat = await crawlSlug(slug, opts, globalMap);
      crawlStats.push(stat);
      console.log(
        `- fetched new: ${stat.localCount} | total unique: ${globalMap.size} | category total: ${stat.totalCount}`,
      );
    } catch (error) {
      failedSlugs.push({ slug, error: error.message });
      console.warn(`- skip slug '${slug}': ${error.message}`);
    }
  }

  let items = Array.from(globalMap.values()).slice(0, opts.targetCount);
  console.log(`\nCollected unique items: ${items.length}`);

  items = await enrichByCodes(items, opts.delayMs, opts.pageSize);
  console.log(`Enriched by by-upcs: ${items.length}`);
  if (failedSlugs.length) {
    console.log(
      `Failed slugs (${failedSlugs.length}): ${failedSlugs
        .map((x) => `${x.slug}`)
        .join(", ")}`,
    );
  }

  if (opts.jsonOutput) {
    const outPath = path.resolve(opts.jsonOutput);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(
      outPath,
      JSON.stringify(
        {
          meta: {
            source: "fptshop",
            generatedAt: new Date().toISOString(),
            options: opts,
            crawlStats,
            failedSlugs,
            count: items.length,
          },
          items,
        },
        null,
        2,
      ),
    );
    console.log(`Saved JSON: ${outPath}`);
  } else {
    console.log(JSON.stringify({ meta: { count: items.length, crawlStats }, items }, null, 2));
  }
};

run().catch((error) => {
  console.error("FPTShop crawl failed:", error.message);
  process.exit(1);
});
