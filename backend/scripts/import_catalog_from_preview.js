/* eslint-disable no-console */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { QueryTypes } = require("sequelize");
const {
  sequelize,
  Brand,
  ProductCategory,
  ProductCatalog,
} = require("../src/models");

const DEFAULT_INPUT =
  "/Users/kien/Codes/TechXchange_Chatbot/docs/import_preview/products_staging.jsonl";
const DEFAULT_USD_RATE = 26000;
const DEFAULT_PKR_RATE = 92;
const DEFAULT_BATCH_SIZE = 1000;
const MAX_MSRP = 99999999.99;

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeKey = (value) => normalizeText(value).toLowerCase();

const slugify = (value) =>
  normalizeText(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toChunked = (rows, size) => {
  const chunks = [];
  for (let i = 0; i < rows.length; i += size) chunks.push(rows.slice(i, i + size));
  return chunks;
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    input: DEFAULT_INPUT,
    usdRate: DEFAULT_USD_RATE,
    pkrRate: DEFAULT_PKR_RATE,
    batchSize: DEFAULT_BATCH_SIZE,
    limit: null,
    status: "active",
    updateExisting: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--input") out.input = args[++i];
    else if (arg === "--usd-rate") out.usdRate = Number(args[++i]);
    else if (arg === "--pkr-rate") out.pkrRate = Number(args[++i]);
    else if (arg === "--batch-size") out.batchSize = Number(args[++i]);
    else if (arg === "--limit") out.limit = Number(args[++i]);
    else if (arg === "--status") out.status = String(args[++i] || "active");
    else if (arg === "--update-existing") out.updateExisting = true;
    else if (arg === "--dry-run") out.dryRun = true;
  }

  if (!Number.isFinite(out.usdRate) || out.usdRate <= 0) {
    throw new Error("USD rate không hợp lệ");
  }
  if (!Number.isFinite(out.pkrRate) || out.pkrRate <= 0) {
    throw new Error("PKR rate không hợp lệ");
  }
  if (!Number.isInteger(out.batchSize) || out.batchSize <= 0) {
    throw new Error("batch-size không hợp lệ");
  }
  if (out.limit !== null && (!Number.isInteger(out.limit) || out.limit <= 0)) {
    throw new Error("limit không hợp lệ");
  }

  return out;
};

const getRateMap = (opts) => ({
  VND: 1,
  USD: opts.usdRate,
  PKR: opts.pkrRate,
});

const buildCatalogKey = (name, brandName, categoryName) =>
  `${normalizeKey(name)}|${normalizeKey(brandName)}|${normalizeKey(categoryName)}`;

const aggregateFromJsonl = async (inputPath, rateMap, limit = null) => {
  const groupMap = new Map();
  let readProducts = 0;
  let skippedCurrency = 0;
  let skippedInvalid = 0;

  const stream = fs.createReadStream(inputPath, { encoding: "utf-8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch (error) {
      skippedInvalid += 1;
      continue;
    }

    const name = normalizeText(row.name);
    const brandName = normalizeText(row.brand_name || "Unknown");
    const categoryName = normalizeText(row.category_name || "Uncategorized");
    if (!name || !brandName || !categoryName) {
      skippedInvalid += 1;
      continue;
    }

    const currency = normalizeText(row.currency).toUpperCase();
    const rate = rateMap[currency];
    const rawPrice = Number(row.price);
    const hasPrice = Number.isFinite(rawPrice) && rawPrice > 0;
    const priceVnd = hasPrice && rate ? Math.round(rawPrice * rate) : null;
    if (hasPrice && !rate) skippedCurrency += 1;

    const key = buildCatalogKey(name, brandName, categoryName);
    const existing = groupMap.get(key);

    if (!existing) {
      groupMap.set(key, {
        name,
        brandName,
        categoryName,
        description: normalizeText(row.description),
        defaultImage: normalizeText(row.image_url),
        count: 1,
        minVnd: priceVnd,
        maxVnd: priceVnd,
        sumVnd: priceVnd || 0,
        countPriced: priceVnd ? 1 : 0,
        currencies: new Set(currency ? [currency] : []),
      });
    } else {
      existing.count += 1;
      if (!existing.description) existing.description = normalizeText(row.description);
      if (!existing.defaultImage) existing.defaultImage = normalizeText(row.image_url);
      if (currency) existing.currencies.add(currency);
      if (priceVnd) {
        existing.minVnd = existing.minVnd === null ? priceVnd : Math.min(existing.minVnd, priceVnd);
        existing.maxVnd = existing.maxVnd === null ? priceVnd : Math.max(existing.maxVnd, priceVnd);
        existing.sumVnd += priceVnd;
        existing.countPriced += 1;
      }
    }

    readProducts += 1;
    if (limit && readProducts >= limit) break;
  }

  return { groupMap, readProducts, skippedCurrency, skippedInvalid };
};

const mapByNormalizedName = (rows) => {
  const map = new Map();
  rows.forEach((row) => {
    map.set(normalizeKey(row.name), Number(row.id));
  });
  return map;
};

const upsertBrands = async (brandNames, dryRun) => {
  const existing = await Brand.findAll({ attributes: ["id", "name"], raw: true });
  const existingMap = mapByNormalizedName(existing);
  const missing = brandNames.filter((name) => !existingMap.has(normalizeKey(name)));

  if (!dryRun && missing.length > 0) {
    const chunks = toChunked(
      missing.map((name) => ({ name })),
      2000,
    );
    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop
      await Brand.bulkCreate(chunk, { ignoreDuplicates: true });
    }
  }

  const latest = await Brand.findAll({ attributes: ["id", "name"], raw: true });
  return {
    created: missing.length,
    map: mapByNormalizedName(latest),
  };
};

const upsertCategories = async (categoryNames, dryRun) => {
  const existing = await ProductCategory.findAll({
    attributes: ["id", "name"],
    raw: true,
  });
  const existingMap = mapByNormalizedName(existing);
  const missing = categoryNames.filter((name) => !existingMap.has(normalizeKey(name)));

  if (!dryRun && missing.length > 0) {
    const rows = missing.map((name) => ({
      name,
      slug: slugify(name),
      parent_id: null,
      level: 1,
      is_active: true,
    }));
    const chunks = toChunked(rows, 1000);
    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop
      await ProductCategory.bulkCreate(chunk, { ignoreDuplicates: true });
    }
  }

  const latest = await ProductCategory.findAll({
    attributes: ["id", "name"],
    raw: true,
  });
  return {
    created: missing.length,
    map: mapByNormalizedName(latest),
  };
};

const loadExistingCatalogMap = async () => {
  const rows = await sequelize.query(
    `
      SELECT
        pc.id,
        pc.name,
        b.name AS brand_name,
        c.name AS category_name
      FROM product_catalog pc
      LEFT JOIN brand b ON b.id = pc.brand_id
      LEFT JOIN product_categories c ON c.id = pc.category_id
    `,
    { type: QueryTypes.SELECT },
  );

  const map = new Map();
  rows.forEach((row) => {
    const key = buildCatalogKey(row.name, row.brand_name || "", row.category_name || "");
    map.set(key, Number(row.id));
  });
  return map;
};

const run = async () => {
  const opts = parseArgs();
  const inputPath = path.resolve(opts.input);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Không tìm thấy file input: ${inputPath}`);
  }

  const rateMap = getRateMap(opts);
  console.log("[CatalogImport] Start", {
    input: inputPath,
    dryRun: opts.dryRun,
    updateExisting: opts.updateExisting,
    rates: rateMap,
    batchSize: opts.batchSize,
    limit: opts.limit,
    status: opts.status,
  });

  await sequelize.authenticate();

  const { groupMap, readProducts, skippedCurrency, skippedInvalid } =
    await aggregateFromJsonl(inputPath, rateMap, opts.limit);

  const grouped = Array.from(groupMap.values());
  const brandNames = Array.from(new Set(grouped.map((item) => item.brandName)));
  const categoryNames = Array.from(new Set(grouped.map((item) => item.categoryName)));

  const brandResult = await upsertBrands(brandNames, opts.dryRun);
  const categoryResult = await upsertCategories(categoryNames, opts.dryRun);
  const existingCatalogMap = await loadExistingCatalogMap();

  const toCreate = [];
  const toUpdate = [];
  let skippedExisting = 0;
  let cappedMsrp = 0;

  grouped.forEach((item) => {
    const key = buildCatalogKey(item.name, item.brandName, item.categoryName);
    const avgVnd =
      item.countPriced > 0 ? Math.round(item.sumVnd / item.countPriced) : null;
    const boundedMsrp =
      avgVnd === null ? null : Math.min(MAX_MSRP, Math.max(0, avgVnd));
    if (avgVnd !== null && boundedMsrp !== avgVnd) cappedMsrp += 1;
    const payload = {
      name: item.name,
      brand_id: brandResult.map.get(normalizeKey(item.brandName)) || null,
      category_id: categoryResult.map.get(normalizeKey(item.categoryName)) || null,
      description: item.description || null,
      default_image: item.defaultImage || null,
      msrp: boundedMsrp,
      status: opts.status,
      specs: {
        import_source: "products_staging.jsonl",
        price_vnd: {
          min: item.minVnd,
          max: item.maxVnd,
          avg: boundedMsrp,
          sample_count: item.countPriced,
        },
        product_count: item.count,
        original_currencies: Array.from(item.currencies).sort(),
      },
    };

    const existingId = existingCatalogMap.get(key);
    if (existingId) {
      if (opts.updateExisting) {
        toUpdate.push({ id: existingId, ...payload });
      } else {
        skippedExisting += 1;
      }
      return;
    }
    toCreate.push(payload);
  });

  let created = 0;
  let updated = 0;

  if (!opts.dryRun) {
    const createChunks = toChunked(toCreate, opts.batchSize);
    for (const chunk of createChunks) {
      // eslint-disable-next-line no-await-in-loop
      await ProductCatalog.bulkCreate(chunk);
      created += chunk.length;
      console.log(`[CatalogImport] Created ${created}/${toCreate.length}`);
    }

    if (opts.updateExisting && toUpdate.length > 0) {
      for (const row of toUpdate) {
        // eslint-disable-next-line no-await-in-loop
        await ProductCatalog.update(
          {
            name: row.name,
            brand_id: row.brand_id,
            category_id: row.category_id,
            description: row.description,
            default_image: row.default_image,
            msrp: row.msrp,
            status: row.status,
            specs: row.specs,
          },
          { where: { id: row.id } },
        );
        updated += 1;
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun: opts.dryRun,
        readProducts,
        groupedCatalogs: grouped.length,
        createdBrands: brandResult.created,
        createdCategories: categoryResult.created,
        createdCatalogs: opts.dryRun ? toCreate.length : created,
        updatedCatalogs: opts.dryRun ? toUpdate.length : updated,
        skippedExisting,
        skippedInvalid,
        skippedUnknownCurrencyWithPrice: skippedCurrency,
        cappedMsrp,
        rates: rateMap,
      },
      null,
      2,
    ),
  );
};

run()
  .catch((error) => {
    console.error("[CatalogImport] Failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await sequelize.close();
    } catch (error) {
      // ignore
    }
  });
