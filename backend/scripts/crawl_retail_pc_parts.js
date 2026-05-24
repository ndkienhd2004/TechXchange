/* eslint-disable no-console */
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const SOURCES = [
  {
    key: "gearvn",
    name: "GearVN",
    baseUrl: "https://gearvn.com",
    sitemapCandidates: [
      "https://gearvn.com/sitemap_products_1.xml",
      "https://gearvn.com/sitemap.xml",
    ],
    productPathIncludes: ["/products/"],
  },
  {
    key: "ttgshop",
    name: "TTGShop",
    baseUrl: "https://ttgshop.vn",
    sitemapCandidates: [
      "https://ttgshop.vn/sitemap_products_1.xml",
      "https://ttgshop.vn/sitemap.xml",
    ],
    productPathIncludes: ["/products/", "/san-pham/"],
  },
];

const ROLE_RULES = [
  { role: "cpu", include: ["cpu", "processor", "vi xu ly"], exclude: ["tan nhiet", "cooler"] },
  { role: "gpu", include: ["vga", "gpu", "card do hoa", "graphics card"], exclude: [] },
  { role: "motherboard", include: ["mainboard", "motherboard", "bo mach chu"], exclude: [] },
  { role: "ram", include: ["ram", "ddr4", "ddr5", "memory"], exclude: [] },
  { role: "ssd", include: ["ssd", "nvme", "m.2", "o cung"], exclude: ["hdd box"] },
  { role: "psu", include: ["psu", "power supply", "nguon may tinh", "bo nguon"], exclude: [] },
  { role: "case", include: ["case", "vo may tinh"], exclude: ["case fan"] },
  { role: "cooler", include: ["cpu cooler", "tan nhiet"], exclude: [] },
];

const ROLE_TO_CATEGORY = {
  cpu: "CPU",
  gpu: "Card đồ họa",
  motherboard: "Bo mạch chủ",
  ram: "RAM",
  ssd: "SSD",
  psu: "Nguồn máy tính",
  case: "Vỏ máy tính",
  cooler: "Tản nhiệt CPU",
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    source: "all", // all | gearvn | ttgshop
    limit: 120,
    perSourceLimit: 80,
    delayMs: 1200,
    timeoutMs: 15000,
    retries: 2,
    jsonOutput: "tmp/crawled_pc_parts.json",
    verbose: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--source" && next) {
      out.source = String(next).trim();
      i += 1;
    } else if (arg === "--limit" && next) {
      out.limit = Number(next);
      i += 1;
    } else if (arg === "--per-source-limit" && next) {
      out.perSourceLimit = Number(next);
      i += 1;
    } else if (arg === "--delay-ms" && next) {
      out.delayMs = Number(next);
      i += 1;
    } else if (arg === "--timeout-ms" && next) {
      out.timeoutMs = Number(next);
      i += 1;
    } else if (arg === "--retries" && next) {
      out.retries = Number(next);
      i += 1;
    } else if (arg === "--json-output" && next) {
      out.jsonOutput = String(next).trim();
      i += 1;
    } else if (arg === "--verbose") {
      out.verbose = true;
    }
  }

  if (!Number.isInteger(out.limit) || out.limit <= 0) {
    throw new Error("--limit không hợp lệ");
  }
  if (!Number.isInteger(out.perSourceLimit) || out.perSourceLimit <= 0) {
    throw new Error("--per-source-limit không hợp lệ");
  }
  if (!Number.isInteger(out.delayMs) || out.delayMs < 0) {
    throw new Error("--delay-ms không hợp lệ");
  }
  if (!Number.isInteger(out.timeoutMs) || out.timeoutMs < 2000) {
    throw new Error("--timeout-ms không hợp lệ");
  }
  if (!Number.isInteger(out.retries) || out.retries < 0 || out.retries > 5) {
    throw new Error("--retries không hợp lệ");
  }
  return out;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stripTags = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const parsePrice = (value) => {
  if (value === null || value === undefined) return null;
  const s = String(value).replace(/[^\d.,]/g, "").trim();
  if (!s) return null;
  // hỗ trợ cả 17.990.000 và 17990000.00
  const normalized = s.includes(",") && s.includes(".")
    ? s.replace(/\./g, "").replace(",", ".")
    : s.replace(/\./g, "");
  const num = Number(normalized);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num);
};

const inferRole = (title, category = "") => {
  const text = ` ${normalizeText(title)} ${normalizeText(category)} `;
  for (const rule of ROLE_RULES) {
    const hasInclude = rule.include.some((kw) => text.includes(normalizeText(kw)));
    if (!hasInclude) continue;
    const hasExclude = rule.exclude.some((kw) => text.includes(normalizeText(kw)));
    if (hasExclude) continue;
    return rule.role;
  }
  return null;
};

const inferBrand = (title, jsonLdBrand) => {
  if (jsonLdBrand) return String(jsonLdBrand).trim();
  const words = String(title || "").trim().split(/\s+/);
  return words.length ? words[0] : "Unknown";
};

const fetchText = async (url, opts) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TechXchangeBot/1.0; +https://techxchange.local)",
        Accept: "text/html,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
};

const fetchWithRetry = async (url, opts) => {
  let error;
  for (let i = 0; i <= opts.retries; i += 1) {
    try {
      return await fetchText(url, opts);
    } catch (e) {
      error = e;
      if (i < opts.retries) {
        await sleep(350 * (i + 1));
      }
    }
  }
  throw error;
};

const extractXmlLocs = (xml) => {
  const out = [];
  const regex = /<loc>(.*?)<\/loc>/gims;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    const u = String(m[1] || "").trim();
    if (u) out.push(u);
  }
  return out;
};

const parseRobots = (content) => {
  const lines = String(content || "")
    .split(/\r?\n/)
    .map((x) => x.trim());
  let applies = false;
  const disallows = [];
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === "user-agent") {
      applies = value === "*" || value.toLowerCase().includes("techxchangebot");
      continue;
    }
    if (applies && key === "disallow" && value) {
      disallows.push(value);
    }
  }
  return disallows;
};

const canCrawlPath = (pathname, disallows) => {
  if (!disallows.length) return true;
  return !disallows.some((d) => d !== "/" && pathname.startsWith(d));
};

const extractFirstMatch = (html, regex) => {
  const m = regex.exec(html);
  return m && m[1] ? String(m[1]).trim() : null;
};

const extractJsonLd = (html) => {
  const scripts = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gim;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const raw = String(m[1] || "").trim();
    if (!raw) continue;
    try {
      scripts.push(JSON.parse(raw));
    } catch {
      // ignore malformed json-ld
    }
  }
  return scripts;
};

const flattenJsonLd = (nodes) => {
  const out = [];
  const walk = (n) => {
    if (!n) return;
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (typeof n !== "object") return;
    if (Array.isArray(n["@graph"])) {
      n["@graph"].forEach(walk);
    } else {
      out.push(n);
    }
  };
  walk(nodes);
  return out;
};

const parseProductPage = (source, url, html) => {
  const jsonLdNodes = flattenJsonLd(extractJsonLd(html));
  const productNode = jsonLdNodes.find(
    (x) =>
      String(x["@type"] || "")
        .toLowerCase()
        .includes("product"),
  );

  const title =
    productNode?.name ||
    extractFirstMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    extractFirstMatch(html, /<title>([^<]+)<\/title>/i);
  if (!title) return null;

  const image =
    (Array.isArray(productNode?.image) ? productNode.image[0] : productNode?.image) ||
    extractFirstMatch(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);

  const priceCandidates = [
    productNode?.offers?.price,
    extractFirstMatch(html, /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i),
    extractFirstMatch(html, /"price"\s*:\s*"?(\\d[\\d.,]*)"?/i),
  ];
  let price = null;
  for (const candidate of priceCandidates) {
    price = parsePrice(candidate);
    if (price) break;
  }

  const description =
    stripTags(productNode?.description) ||
    stripTags(
      extractFirstMatch(
        html,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      ),
    ) ||
    `${title} - imported from ${source.name}`;

  const category =
    productNode?.category ||
    extractFirstMatch(html, /"category"\s*:\s*"([^"]+)"/i) ||
    "Linh kiện điện tử";
  const role = inferRole(title, category);
  if (!role) return null;

  const brand = inferBrand(
    title,
    typeof productNode?.brand === "string"
      ? productNode.brand
      : productNode?.brand?.name,
  );

  return {
    source: source.key,
    sourceName: source.name,
    sourceUrl: url,
    name: String(title).trim(),
    description:
      description.length > 280
        ? `${description.slice(0, 277)}...`
        : description,
    image: image ? String(image).trim() : null,
    price,
    brandName: brand || "Unknown",
    categoryName: ROLE_TO_CATEGORY[role] || "Linh kiện điện tử",
    pcRole: role,
    crawledAt: new Date().toISOString(),
  };
};

const gatherProductUrls = async (source, opts) => {
  const robotsUrl = `${source.baseUrl}/robots.txt`;
  let disallows = [];
  try {
    const robotsTxt = await fetchWithRetry(robotsUrl, opts);
    disallows = parseRobots(robotsTxt);
  } catch (e) {
    console.warn(`[warn] ${source.key}: không đọc được robots.txt (${e.message}), sẽ crawl thận trọng.`);
  }

  const sitemapQueue = [...source.sitemapCandidates];
  const seenSitemap = new Set();
  const urls = new Set();

  while (sitemapQueue.length) {
    const sitemapUrl = sitemapQueue.shift();
    if (!sitemapUrl || seenSitemap.has(sitemapUrl)) continue;
    seenSitemap.add(sitemapUrl);

    let xml;
    try {
      // eslint-disable-next-line no-await-in-loop
      xml = await fetchWithRetry(sitemapUrl, opts);
    } catch (e) {
      if (opts.verbose) console.warn(`[warn] sitemap fail ${sitemapUrl}: ${e.message}`);
      continue;
    }

    const locs = extractXmlLocs(xml);
    for (const loc of locs) {
      try {
        const u = new URL(loc);
        if (!canCrawlPath(u.pathname, disallows)) continue;
        const maybeSitemap = /sitemap/i.test(u.pathname) || /xml$/i.test(u.pathname);
        if (maybeSitemap) {
          if (!seenSitemap.has(loc)) sitemapQueue.push(loc);
          continue;
        }
        if (!source.productPathIncludes.some((piece) => u.pathname.includes(piece))) continue;
        urls.add(loc);
      } catch {
        // ignore
      }
    }
  }

  return Array.from(urls);
};

const crawlSource = async (source, opts) => {
  const productUrls = await gatherProductUrls(source, opts);
  if (!productUrls.length) {
    return { source: source.key, totalUrls: 0, kept: 0, skipped: 0, items: [] };
  }

  const items = [];
  let skipped = 0;
  for (const url of productUrls) {
    if (items.length >= opts.perSourceLimit) break;
    try {
      // eslint-disable-next-line no-await-in-loop
      const html = await fetchWithRetry(url, opts);
      const parsed = parseProductPage(source, url, html);
      if (parsed && parsed.price && parsed.image) {
        items.push(parsed);
      } else {
        skipped += 1;
      }
    } catch (e) {
      skipped += 1;
      if (opts.verbose) console.warn(`[warn] page fail ${url}: ${e.message}`);
    }
    if (opts.delayMs > 0) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(opts.delayMs);
    }
  }

  return {
    source: source.key,
    totalUrls: productUrls.length,
    kept: items.length,
    skipped,
    items,
  };
};

const dedupeByNameAndSource = (items) => {
  const map = new Map();
  for (const item of items) {
    const key = `${item.source}|${normalizeText(item.name)}`;
    if (!map.has(key)) {
      map.set(key, item);
      continue;
    }
    const prev = map.get(key);
    // giữ bản có ảnh + giá hợp lệ hơn
    const prevScore = (prev.image ? 1 : 0) + (prev.price ? 1 : 0);
    const nextScore = (item.image ? 1 : 0) + (item.price ? 1 : 0);
    if (nextScore > prevScore) map.set(key, item);
  }
  return Array.from(map.values());
};

const run = async () => {
  const opts = parseArgs();
  const selectedSources =
    opts.source === "all"
      ? SOURCES
      : SOURCES.filter((s) => s.key === opts.source);

  if (!selectedSources.length) {
    throw new Error(`Không tìm thấy source '${opts.source}'`);
  }

  console.log(`Start retail crawl: ${selectedSources.map((x) => x.key).join(", ")}`);
  const reports = [];
  let allItems = [];

  for (const source of selectedSources) {
    console.log(`\n[source] ${source.name}`);
    // eslint-disable-next-line no-await-in-loop
    const report = await crawlSource(source, opts);
    reports.push(report);
    allItems = allItems.concat(report.items);
    console.log(
      `- urls=${report.totalUrls} kept=${report.kept} skipped=${report.skipped}`,
    );
    if (allItems.length >= opts.limit) break;
  }

  allItems = dedupeByNameAndSource(allItems).slice(0, opts.limit);

  const output = {
    meta: {
      createdAt: new Date().toISOString(),
      total: allItems.length,
      options: opts,
      reports: reports.map((r) => ({
        source: r.source,
        totalUrls: r.totalUrls,
        kept: r.kept,
        skipped: r.skipped,
      })),
    },
    items: allItems,
  };

  const outPath = path.resolve(opts.jsonOutput);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`\nDone. Saved ${allItems.length} items -> ${outPath}`);
  if (allItems[0]) {
    console.log("\nSample:");
    console.log(JSON.stringify(allItems[0], null, 2));
  }
};

run().catch((error) => {
  console.error("Retail crawl failed:", error.message);
  process.exitCode = 1;
});

