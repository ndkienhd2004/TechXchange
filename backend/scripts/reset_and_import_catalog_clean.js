/* eslint-disable no-console */
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const { sequelize, Brand, ProductCategory, ProductCatalog } = require("../src/models");

const INPUT_FILE = path.resolve(__dirname, "../tmp/products_import_cleaned.json");

const toSlug = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

async function resetCatalogTables(tx) {
  // Xoá theo đúng yêu cầu: product_catalog + brand + categories.
  // Dùng CASCADE để tránh lỗi FK từ products/product_requests/... khi dữ liệu cũ còn tham chiếu.
  await sequelize.query(
    `
    TRUNCATE TABLE
      product_catalog,
      brand,
      product_categories
    RESTART IDENTITY CASCADE;
  `,
    { transaction: tx },
  );
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Không thấy file input: ${INPUT_FILE}`);
  }

  const payload = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (!items.length) throw new Error("Input rỗng, không có items để import.");

  await sequelize.authenticate();
  console.log(`Input items: ${items.length}`);

  await sequelize.transaction(async (tx) => {
    await resetCatalogTables(tx);

    // 1) Tạo brand
    const brandNames = [...new Set(items.map((i) => String(i.brandName || "").trim()).filter(Boolean))];
    const createdBrands = [];
    for (const name of brandNames) {
      const row = await Brand.create({ name: name.slice(0, 255) }, { transaction: tx });
      createdBrands.push(row);
    }
    const brandMap = new Map(createdBrands.map((b) => [b.name, b.id]));

    // 2) Tạo category cha + con từ categoryName/subcategoryName
    const parentNames = [...new Set(items.map((i) => String(i.categoryName || "").trim()).filter(Boolean))];
    const parentRows = [];
    for (const name of parentNames) {
      // name unique toàn bảng nên tạo thẳng
      const row = await ProductCategory.create(
        {
          name,
          slug: toSlug(name),
          parent_id: null,
          level: 1,
          is_active: true,
        },
        { transaction: tx },
      );
      parentRows.push(row);
    }
    const parentMap = new Map(parentRows.map((r) => [r.name, r.id]));

    const childKeySet = new Set();
    const childRows = [];
    for (const it of items) {
      const parentName = String(it.categoryName || "").trim();
      const childName = String(it.subcategoryName || "").trim();
      if (!parentName || !childName) continue;
      const key = `${parentName}||${childName}`;
      if (childKeySet.has(key)) continue;
      childKeySet.add(key);
      const parentId = parentMap.get(parentName);
      if (!parentId) continue;
      let childNameFinal = childName;
      // product_categories.name là unique toàn bảng, nên các tên generic như "Khác" cần tránh trùng
      const existed = await ProductCategory.findOne({
        where: { name: childNameFinal },
        transaction: tx,
      });
      if (existed) {
        childNameFinal = `${parentName} - ${childName}`.slice(0, 100);
      }

      const child = await ProductCategory.create(
        {
          name: childNameFinal,
          slug: toSlug(`${parentName}-${childName}`),
          parent_id: parentId,
          level: 2,
          is_active: true,
        },
        { transaction: tx },
      );
      childRows.push({ key, id: child.id });
    }
    const childMap = new Map(childRows.map((x) => [x.key, x.id]));

    // 3) Tạo catalog sạch: specs rỗng {}, không giữ source/sourceUrl trong specs
    const normalizedCatalogRows = items.map((it) => {
      const name = String(it.name || "").trim();
      const description = String(it.description || "").trim() || null;
      const price = Number(it.price || 0);
      const brandName = String(it.brandName || "").trim();
      const parentName = String(it.categoryName || "").trim();
      const childName = String(it.subcategoryName || "").trim();
      const categoryKey = `${parentName}||${childName}`;

      return {
        name: name.slice(0, 255),
        description,
        brand_id: brandMap.get(brandName) || null,
        category_id: childMap.get(categoryKey) || parentMap.get(parentName) || null,
        specs: {}, // theo yêu cầu: để trống cho user tự thêm
        default_image: it.image ? String(it.image) : null,
        msrp:
          Number.isFinite(price) && price > 0
            ? Math.min(Math.round(price), 99_999_999)
            : 0,
        status: "active",
      };
    });

    for (const rows of chunk(normalizedCatalogRows, 500)) {
      await ProductCatalog.bulkCreate(rows, { transaction: tx });
    }
  });

  const [brandCount] = await sequelize.query(`SELECT COUNT(*)::int AS c FROM brand;`);
  const [categoryCount] = await sequelize.query(`SELECT COUNT(*)::int AS c FROM product_categories;`);
  const [catalogCount] = await sequelize.query(`SELECT COUNT(*)::int AS c FROM product_catalog;`);

  console.log("Import done:");
  console.log(`- brands: ${brandCount[0].c}`);
  console.log(`- categories: ${categoryCount[0].c}`);
  console.log(`- product_catalog: ${catalogCount[0].c}`);
}

main()
  .catch((err) => {
    console.error("reset/import failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await sequelize.close();
    } catch {
      // ignore
    }
  });
