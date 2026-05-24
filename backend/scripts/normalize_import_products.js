/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const INPUT_FILES = [
  path.resolve(__dirname, "../tmp/crawled_pc_parts_gearvn_28.json"),
  path.resolve(__dirname, "../tmp/crawled_ttgshop_pc_parts_20_30.json"),
  path.resolve(__dirname, "../tmp/fptshop-1000.json"),
  path.resolve(__dirname, "../tmp/retail-products.json"),
];

const OUTPUT_FILE = path.resolve(
  __dirname,
  "../tmp/products_import_cleaned.json",
);
const REPORT_FILE = path.resolve(
  __dirname,
  "../tmp/products_import_cleaned_report.json",
);

const KNOWN_BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Oppo",
  "Honor",
  "Tecno",
  "Nubia",
  "LG",
  "Sony",
  "Asus",
  "Acer",
  "Dell",
  "HP",
  "Lenovo",
  "MSI",
  "Gigabyte",
  "Intel",
  "AMD",
  "NVIDIA",
  "Zotac",
  "Colorful",
  "Corsair",
  "Kingston",
  "Crucial",
  "Lexar",
  "SanDisk",
  "PNY",
  "Adata",
  "Cooler Master",
  "Deepcool",
  "Noctua",
  "Arctic",
  "Antec",
  "Thermaltake",
  "Gamdias",
  "Ugreen",
  "Baseus",
  "Belkin",
  "Logitech",
  "Rapoo",
  "Havit",
  "DJI",
  "Insta360",
  "Viewsonic",
  "Imou",
  "Tapo",
  "TP-Link",
  "ESR",
  "Uniq",
];

const BRAND_ALIASES = {
  tp_link: "TP-Link",
  "tp-link": "TP-Link",
  asus: "Asus",
  uniq: "Uniq",
  adata: "Adata",
  corsair: "Corsair",
  kingston: "Kingston",
  nvidia: "NVIDIA",
  amd: "AMD",
  intel: "Intel",
  lg: "LG",
  hp: "HP",
  msi: "MSI",
  dji: "DJI",
  pny: "PNY",
  esr: "ESR",
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const normalizeBrand = (rawBrand, name = "", url = "") => {
  const raw = String(rawBrand || "").trim();
  const rawNorm = normalizeText(raw);

  if (rawNorm && BRAND_ALIASES[rawNorm]) return BRAND_ALIASES[rawNorm];

  if (rawNorm && KNOWN_BRANDS.some((b) => normalizeText(b) === rawNorm)) {
    return KNOWN_BRANDS.find((b) => normalizeText(b) === rawNorm);
  }

  const text = `${name} ${url}`;
  const textNorm = normalizeText(text);
  for (const brand of KNOWN_BRANDS) {
    const bNorm = normalizeText(brand);
    if (textNorm.includes(` ${bNorm} `) || textNorm.startsWith(`${bNorm} `)) {
      return brand;
    }
  }

  if (rawNorm && !["pc", "bo", "bộ", "card", "vga", "ram", "nguon"].includes(rawNorm)) {
    return raw.length <= 3 ? raw.toUpperCase() : titleCase(raw);
  }

  const firstToken = String(name || "").split(/\s+/).find(Boolean) || "Unknown";
  const firstNorm = normalizeText(firstToken);
  if (BRAND_ALIASES[firstNorm]) return BRAND_ALIASES[firstNorm];
  return firstToken.length <= 3 ? firstToken.toUpperCase() : titleCase(firstToken);
};

const normalizePrice = (price, categoryName = "") => {
  const num = Number(price);
  if (!Number.isFinite(num) || num < 0) return 0;
  if (num === 0) return 0;

  let out = Math.round(num);
  const partsCategory = [
    "card do hoa",
    "cpu",
    "ram",
    "ssd",
    "nguon may tinh",
    "vo may tinh",
    "tan nhiet cpu",
    "bo mach chu",
  ];
  const isPart = partsCategory.includes(normalizeText(categoryName));
  // Sửa các outlier kiểu 690.000 bị parse thành 690.000.000
  if (isPart && out > 100_000_000) {
    while (out > 100_000_000) out = Math.round(out / 1000);
  }
  if (out > 5_000_000_000) {
    while (out > 5_000_000_000) out = Math.round(out / 1000);
  }
  return out;
};

const inferCategory = ({ categoryName, industry, productType, name, url }) => {
  const joined = normalizeText(
    `${categoryName || ""} ${industry || ""} ${productType || ""} ${name || ""} ${url || ""}`,
  );

  const match = (keywords) => keywords.some((kw) => joined.includes(normalizeText(kw)));

  if (match(["card đồ họa", "vga", "gpu", "rtx", "radeon"])) return "Card đồ họa";
  if (match(["bo mạch chủ", "mainboard", "motherboard"])) return "Bo mạch chủ";
  if (match(["cpu", "vi xử lý", "processor", "intel core", "ryzen"])) return "CPU";
  if (match(["ram", "ddr4", "ddr5", "memory"])) return "RAM";
  if (match(["ssd", "nvme", "m.2"])) return "SSD";
  if (match(["nguồn", "psu", "power supply"])) return "Nguồn máy tính";
  if (match(["tản nhiệt", "cooler"])) return "Tản nhiệt CPU";
  if (match(["vỏ máy", "vo case", "case máy tính"])) return "Vỏ máy tính";
  if (match(["sạc dự phòng", "pin dự phòng", "power bank"])) return "Pin sạc dự phòng";
  if (match(["sạc", "cáp", "adapter", "củ sạc", "charge", "charger"])) return "Phụ kiện sạc";
  if (match(["ốp lưng", "op lung", "bao da", "case iphone", "case samsung"])) {
    return "Ốp lưng";
  }
  if (match(["miếng dán", "dan man hinh", "kinh cuong luc", "bao ve man hinh"])) return "Phụ kiện";
  if (match(["laptop", "macbook", "notebook"])) return "Laptop";
  if (match(["điện thoại", "iphone", "samsung galaxy", "xiaomi", "oppo", "tecno", "nubia"])) {
    return "Điện thoại";
  }
  if (match(["máy tính bảng", "tablet", "ipad"])) return "Máy tính bảng";
  if (match(["màn hình", "monitor"])) return "Màn hình";
  if (match(["tivi", "tv"])) return "Tivi";
  if (match(["tai nghe", "headphone", "earbud"])) return "Tai nghe";
  if (match(["chuột", "mouse"])) return "Chuột";
  if (match(["bàn phím", "keyboard"])) return "Bàn phím";
  if (match(["camera", "webcam"])) return "Camera";
  if (match(["router", "wifi", "modem", "mesh"])) return "Thiết bị mạng";
  if (match(["ổ cứng", "hdd", "usb", "thẻ nhớ", "micro sd"])) return "Thiết bị lưu trữ";
  if (match(["loa", "speaker"])) return "Loa";
  if (match(["may tinh"])) return "PC";
  if (match(["phu kien"])) return "Phụ kiện";
  return "Khác";
};

const inferSubcategory = ({ categoryName, name, brandName, sourceUrl }) => {
  const cat = String(categoryName || "");
  const joined = normalizeText(`${name || ""} ${brandName || ""} ${sourceUrl || ""}`);
  const has = (arr) => arr.some((kw) => joined.includes(normalizeText(kw)));

  if (cat === "Điện thoại") {
    if (has(["iphone", "ios"])) return "iPhone";
    if (has(["samsung", "galaxy"])) return "Android Samsung";
    if (has(["xiaomi", "redmi", "poco"])) return "Android Xiaomi";
    if (has(["oppo", "realme", "vivo", "honor", "tecno", "nubia"])) return "Android khác";
    return "Điện thoại khác";
  }

  if (cat === "Laptop") {
    if (has(["macbook", "apple m1", "apple m2", "apple m3", "apple m4"])) return "MacBook";
    if (has(["gaming", "tuf", "rog", "legion", "predator", "katana", "g series"])) return "Laptop Gaming";
    if (has(["ultrabook", "business", "office", "văn phòng", "vivobook", "inspiron", "thinkbook"])) {
      return "Laptop Văn phòng";
    }
    return "Laptop khác";
  }

  if (cat === "Card đồ họa") {
    if (has(["rtx", "geforce", "nvidia"])) return "NVIDIA GeForce";
    if (has(["radeon", "rx ", "amd"])) return "AMD Radeon";
    if (has(["quadro", "rtx pro", "workstation"])) return "Workstation GPU";
    return "Card đồ họa khác";
  }

  if (cat === "CPU") {
    if (has(["intel core", "intel"])) return "Intel Core";
    if (has(["ryzen", "amd"])) return "AMD Ryzen";
    return "CPU khác";
  }

  if (cat === "RAM") {
    if (has(["ddr5"])) return "RAM DDR5";
    if (has(["ddr4"])) return "RAM DDR4";
    return "RAM khác";
  }

  if (cat === "SSD") {
    if (has(["nvme", "m.2"])) return "SSD NVMe";
    if (has(["sata"])) return "SSD SATA";
    return "SSD khác";
  }

  if (cat === "Nguồn máy tính") {
    if (has(["850w", "1000w", "1200w"])) return "PSU Công suất cao";
    if (has(["550w", "650w", "750w"])) return "PSU Phổ thông";
    return "PSU khác";
  }

  if (cat === "Vỏ máy tính") {
    if (has(["atx"])) return "Case ATX";
    if (has(["matx", "m-atx"])) return "Case mATX";
    if (has(["itx"])) return "Case ITX";
    return "Case khác";
  }

  if (cat === "Tản nhiệt CPU") {
    if (has(["aio", "water", "liquid"])) return "Tản nhiệt nước";
    if (has(["air", "tower", "fan"])) return "Tản nhiệt khí";
    return "Tản nhiệt khác";
  }

  if (cat === "Màn hình") {
    if (has(["gaming", "144hz", "165hz", "240hz"])) return "Màn hình Gaming";
    if (has(["ultrasharp", "professional", "2k", "4k"])) return "Màn hình Đồ họa/Văn phòng";
    return "Màn hình khác";
  }

  if (cat === "Tai nghe") {
    if (has(["true wireless", "tws", "earbud"])) return "Tai nghe TWS";
    if (has(["headphone", "over-ear", "on-ear"])) return "Tai nghe Chụp tai";
    return "Tai nghe khác";
  }

  if (cat === "Chuột") return "Chuột máy tính";
  if (cat === "Bàn phím") return "Bàn phím máy tính";
  if (cat === "Pin sạc dự phòng") return "Sạc dự phòng";
  if (cat === "Phụ kiện sạc") return "Cáp/Sạc";
  if (cat === "Ốp lưng") return "Ốp lưng điện thoại";
  if (cat === "Thiết bị lưu trữ") return "Lưu trữ ngoài";
  if (cat === "Camera") return "Camera giám sát";
  if (cat === "Loa") return "Loa nghe nhạc";
  if (cat === "Phụ kiện") return "Phụ kiện khác";

  return "Khác";
};

const normalizeItem = (item, sourceTag) => {
  const source = item.source || item.sourceSlug || sourceTag || "unknown";
  const sourceName = item.sourceName || sourceTag || "Unknown";
  const name = String(item.name || "").trim();
  const sourceUrl = item.sourceUrl || item.url || "";
  const categoryName = inferCategory({
    categoryName: item.categoryName,
    industry: item.industry,
    productType: item.productType,
    name,
    url: sourceUrl,
  });
  const brandName = normalizeBrand(item.brandName || item.brand, name, sourceUrl);
  const price = normalizePrice(item.price ?? item.currentPrice ?? item.salePrice, categoryName);
  const subcategoryName = inferSubcategory({
    categoryName,
    name,
    brandName,
    sourceUrl,
  });

  return {
    source,
    sourceName,
    sourceUrl,
    name,
    description: item.description || `${name} - imported from ${sourceName}`,
    image: item.image || null,
    price,
    brandName,
    categoryName,
    subcategoryName,
    categoryPath: `${categoryName} > ${subcategoryName}`,
    specs: item.specs || null,
    status: item.status || "active",
  };
};

const loadItems = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

const dedupe = (items) => {
  const map = new Map();
  for (const item of items) {
    const key = `${normalizeText(item.name)}|${normalizeText(item.brandName)}|${normalizeText(item.categoryName)}`;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, item);
      continue;
    }
    // giữ bản có ảnh + giá tốt hơn
    const prevScore = (prev.image ? 1 : 0) + (prev.price > 0 ? 1 : 0);
    const nextScore = (item.image ? 1 : 0) + (item.price > 0 ? 1 : 0);
    if (nextScore > prevScore) map.set(key, item);
  }
  return Array.from(map.values());
};

const main = () => {
  const all = [];
  const sourceStats = {};

  for (const filePath of INPUT_FILES) {
    const sourceTag = path.basename(filePath).replace(".json", "");
    const rawItems = loadItems(filePath);
    sourceStats[sourceTag] = { raw: rawItems.length };
    for (const item of rawItems) {
      const normalized = normalizeItem(item, sourceTag);
      if (!normalized.name) continue;
      if (normalized.price <= 0) continue;
      all.push(normalized);
    }
  }

  const deduped = dedupe(all);
  const categoryCounts = {};
  const subcategoryCounts = {};
  const brandCounts = {};

  for (const item of deduped) {
    categoryCounts[item.categoryName] = (categoryCounts[item.categoryName] || 0) + 1;
    const subKey = `${item.categoryName} > ${item.subcategoryName}`;
    subcategoryCounts[subKey] = (subcategoryCounts[subKey] || 0) + 1;
    brandCounts[item.brandName] = (brandCounts[item.brandName] || 0) + 1;
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      {
        meta: {
          generatedAt: new Date().toISOString(),
          totalRaw: all.length,
          totalDeduped: deduped.length,
          inputFiles: INPUT_FILES,
        },
        items: deduped,
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    REPORT_FILE,
    JSON.stringify(
      {
        meta: {
          generatedAt: new Date().toISOString(),
          totalRaw: all.length,
          totalDeduped: deduped.length,
        },
        sourceStats,
        topCategories: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 100),
        topSubcategories: Object.entries(subcategoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 200),
        topBrands: Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 100),
      },
      null,
      2,
    ),
  );

  console.log(`Saved cleaned data -> ${OUTPUT_FILE}`);
  console.log(`Saved report -> ${REPORT_FILE}`);
  console.log(`Raw: ${all.length} | Deduped: ${deduped.length}`);
  console.log("Top categories:", Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10));
  console.log("Top brands:", Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 10));
};

main();
