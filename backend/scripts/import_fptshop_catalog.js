/* eslint-disable no-console */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { sequelize, Brand, ProductCategory, ProductCatalog } = require("../src/models");

const DEFAULT_INPUT = "tmp/fptshop-1000.json";
const MAX_MSRP = 99999999.99;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    input: DEFAULT_INPUT,
    dryRun: false,
    updateExisting: false,
    status: "active",
    limit: null,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--input") out.input = String(args[++i] || DEFAULT_INPUT);
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--update-existing") out.updateExisting = true;
    else if (arg === "--status") out.status = String(args[++i] || "active");
    else if (arg === "--limit") out.limit = Number(args[++i]);
  }

  const allowedStatus = new Set([
    "draft",
    "pending",
    "active",
    "inactive",
    "rejected",
    "sold_out",
    "deleted",
  ]);
  if (!allowedStatus.has(out.status)) {
    throw new Error(`status không hợp lệ: ${out.status}`);
  }
  if (out.limit !== null && (!Number.isInteger(out.limit) || out.limit <= 0)) {
    throw new Error(`limit không hợp lệ: ${out.limit}`);
  }

  return out;
};

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

const clampMsrp = (price) => {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > MAX_MSRP) return MAX_MSRP;
  return Math.round(n * 100) / 100;
};

const buildCatalogIdentity = (name, brandName, categoryName) =>
  `${normalizeKey(name)}|${normalizeKey(brandName)}|${normalizeKey(categoryName)}`;

const loadInputRows = (inputPath, limit = null) => {
  const resolved = path.resolve(inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Không tìm thấy file input: ${resolved}`);
  }

  const payload = JSON.parse(fs.readFileSync(resolved, "utf-8"));
  const rows = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];
  const sliced = limit ? rows.slice(0, limit) : rows;

  const uniqueByIdentity = new Map();
  for (const row of sliced) {
    const name = normalizeText(row.name || row.displayName);
    if (!name) continue;
    const brandName = normalizeText(row.brand || row.brandName || "Unknown");
    const categoryName = normalizeText(
      row.productType ||
        row.categoryName ||
        row.industry ||
        row.sourceSlug ||
        "Uncategorized",
    );
    const identity = buildCatalogIdentity(name, brandName, categoryName);

    if (!uniqueByIdentity.has(identity)) {
      uniqueByIdentity.set(identity, {
        identity,
        name,
        brandName,
        categoryName,
        description: normalizeText(row.description || ""),
        defaultImage: normalizeText(row.image || ""),
        msrp: clampMsrp(row.currentPrice || row.originalPrice || row.price),
        source: normalizeText(row.source || "fptshop"),
        sourceSlug: normalizeText(row.sourceSlug || ""),
        sourceCode: normalizeText(row.code || ""),
        sourceUrl: normalizeText(row.url || row.sourceUrl || ""),
        sourceImageUrl: normalizeText(row.image || ""),
      });
      continue;
    }

    const existing = uniqueByIdentity.get(identity);
    if (!existing.description && row.description) existing.description = normalizeText(row.description);
    if (!existing.defaultImage && row.image) existing.defaultImage = normalizeText(row.image);
    if (!existing.msrp) {
      existing.msrp = clampMsrp(row.currentPrice || row.originalPrice || row.price);
    }
  }

  return Array.from(uniqueByIdentity.values());
};

const mapByName = (rows) => {
  const map = new Map();
  rows.forEach((row) => {
    map.set(normalizeKey(row.name), Number(row.id));
  });
  return map;
};

const upsertBrands = async (brandNames, dryRun) => {
  const existing = await Brand.findAll({ attributes: ["id", "name"], raw: true });
  const existingMap = mapByName(existing);
  const missing = brandNames.filter((name) => !existingMap.has(normalizeKey(name)));

  if (!dryRun && missing.length) {
    await Brand.bulkCreate(missing.map((name) => ({ name })), { ignoreDuplicates: true });
  }

  const latest = await Brand.findAll({ attributes: ["id", "name"], raw: true });
  const latestMap = mapByName(latest);
  if (dryRun) {
    let tempId = -1;
    missing.forEach((name) => {
      latestMap.set(normalizeKey(name), tempId);
      tempId -= 1;
    });
  }
  return { map: latestMap, created: missing.length };
};

const upsertCategories = async (categoryNames, dryRun) => {
  const existing = await ProductCategory.findAll({
    attributes: ["id", "name"],
    raw: true,
  });
  const existingMap = mapByName(existing);
  const missing = categoryNames.filter((name) => !existingMap.has(normalizeKey(name)));

  if (!dryRun && missing.length) {
    await ProductCategory.bulkCreate(
      missing.map((name) => ({
        name,
        slug: slugify(name),
        parent_id: null,
        level: 1,
        is_active: true,
      })),
      { ignoreDuplicates: true },
    );
  }

  const latest = await ProductCategory.findAll({
    attributes: ["id", "name"],
    raw: true,
  });
  const latestMap = mapByName(latest);
  if (dryRun) {
    let tempId = -100000;
    missing.forEach((name) => {
      latestMap.set(normalizeKey(name), tempId);
      tempId -= 1;
    });
  }
  return { map: latestMap, created: missing.length };
};

const loadExistingCatalogMap = async () => {
  const rows = await ProductCatalog.findAll({
    attributes: ["id", "name", "brand_id", "category_id"],
    raw: true,
  });
  const map = new Map();
  rows.forEach((row) => {
    const key = `${normalizeKey(row.name)}|${row.brand_id || 0}|${row.category_id || 0}`;
    map.set(key, row);
  });
  return map;
};

const run = async () => {
  const opts = parseArgs();
  const rows = loadInputRows(opts.input, opts.limit);
  if (!rows.length) throw new Error("File input không có items hợp lệ");

  console.log(`Input rows (unique catalog identity): ${rows.length}`);

  await sequelize.authenticate();
  console.log("Database connected");

  const uniqueBrandNames = Array.from(new Set(rows.map((x) => x.brandName)));
  const uniqueCategoryNames = Array.from(new Set(rows.map((x) => x.categoryName)));

  const brandResult = await upsertBrands(uniqueBrandNames, opts.dryRun);
  const categoryResult = await upsertCategories(uniqueCategoryNames, opts.dryRun);

  const existingMap = await loadExistingCatalogMap();
  let inserted = 0;
  let updated = 0;
  let skippedExisting = 0;

  const createPayload = [];
  for (const row of rows) {
    const brandId = brandResult.map.get(normalizeKey(row.brandName));
    const categoryId = categoryResult.map.get(normalizeKey(row.categoryName));
    if (!brandId || !categoryId) continue;

    const key = `${normalizeKey(row.name)}|${brandId}|${categoryId}`;
    const existing = existingMap.get(key);

    const payload = {
      name: row.name,
      brand_id: brandId,
      category_id: categoryId,
      description: row.description || null,
      default_image: row.defaultImage || null,
      msrp: row.msrp,
      status: opts.status,
      specs: {
        import_source: row.source || "fptshop",
        source_slug: row.sourceSlug || null,
        source_code: row.sourceCode || null,
        source_url: row.sourceUrl || null,
        source_image_url: row.sourceImageUrl || row.defaultImage || null,
        imported_at: new Date().toISOString(),
      },
    };

    if (!existing) {
      inserted += 1;
      if (!opts.dryRun) createPayload.push(payload);
      continue;
    }

    if (!opts.updateExisting) {
      skippedExisting += 1;
      continue;
    }

    updated += 1;
    if (!opts.dryRun) {
      // eslint-disable-next-line no-await-in-loop
      await ProductCatalog.update(payload, { where: { id: existing.id } });
    }
  }

  if (!opts.dryRun && createPayload.length) {
    await ProductCatalog.bulkCreate(createPayload);
  }

  const summary = {
    dryRun: opts.dryRun,
    updateExisting: opts.updateExisting,
    inputRows: rows.length,
    brandsCreated: brandResult.created,
    categoriesCreated: categoryResult.created,
    catalogInserted: inserted,
    catalogUpdated: updated,
    catalogSkippedExisting: skippedExisting,
  };
  console.log("Import summary:", JSON.stringify(summary, null, 2));
};

run()
  .catch((error) => {
    console.error("Import failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await sequelize.close();
    } catch (_e) {
      // ignore
    }
  });
