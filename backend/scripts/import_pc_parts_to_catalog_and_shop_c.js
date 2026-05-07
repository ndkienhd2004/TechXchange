require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const {
  sequelize,
  User,
  Store,
  ProductCategory,
  ProductCatalog,
  Product,
  ProductImage,
  ProductSerial,
  ProductInventory,
  ShopInventoryLedger,
} = require("../src/models");

const DATASET_DIR =
  "/Users/kien/Downloads/dataset/TechXchange-Pc part data/dataset";
const EXCLUDED_FILES = new Set(["case-fan.json"]);
const DEFAULT_USD_TO_VND = 26000;
const MAX_MSRP = 99999999.99;

const SHOP_C = {
  username: "shop_c_owner",
  email: "shopc@techxchange.dev",
  phone: "0900000007",
  password: "123456",
  storeName: "TechX Store C",
  storeDescription:
    "Cửa hàng chuyên linh kiện điện tử phục vụ test AI chatbot",
};

const FILE_CATEGORY_MAP = {
  "case-accessory.json": "Phụ kiện vỏ case",
  "case.json": "Vỏ case",
  "cpu-cooler.json": "Tản nhiệt CPU",
  "cpu.json": "CPU",
  "external-hard-drive.json": "Ổ cứng gắn ngoài",
  "fan-controller.json": "Bộ điều khiển quạt",
  "headphones.json": "Tai nghe",
  "internal-hard-drive.json": "Ổ cứng trong",
  "keyboard.json": "Bàn phím",
  "memory.json": "RAM",
  "monitor.json": "Màn hình",
  "motherboard.json": "Bo mạch chủ",
  "mouse.json": "Chuột",
  "optical-drive.json": "Ổ đĩa quang",
  "os.json": "Hệ điều hành",
  "power-supply.json": "Nguồn máy tính",
  "sound-card.json": "Card âm thanh",
  "speakers.json": "Loa",
  "thermal-paste.json": "Keo tản nhiệt",
  "ups.json": "Bộ lưu điện UPS",
  "video-card.json": "Card đồ họa",
  "webcam.json": "Webcam",
  "wired-network-card.json": "Card mạng có dây",
  "wireless-network-card.json": "Card mạng không dây",
};

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    perFile: 10,
    usdToVnd: DEFAULT_USD_TO_VND,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--per-file" && next) {
      const value = Number(next);
      if (Number.isFinite(value) && value > 0) out.perFile = Math.floor(value);
      i += 1;
      continue;
    }
    if (arg === "--usd-to-vnd" && next) {
      const value = Number(next);
      if (Number.isFinite(value) && value > 0) out.usdToVnd = value;
      i += 1;
      continue;
    }
  }

  return out;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampMsrp = (value) => Math.min(MAX_MSRP, Math.max(0, value));

const pickItems = (rows, max) => {
  const selected = [];
  const seen = new Set();

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const name = String(row.name || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(row);
    if (selected.length >= max) break;
  }

  return selected;
};

const buildCatalogSpecs = (row, sourceFile) => {
  const out = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    if (key === "name" || key === "price") return;
    if (value === null || value === undefined || value === "") return;
    out[key] = value;
  });
  out.import_source = "pc-part-dataset";
  out.import_file = sourceFile;
  return out;
};

const buildDescription = (specs) => {
  const pairs = Object.entries(specs)
    .filter(([key]) => !String(key).startsWith("import_"))
    .slice(0, 8)
    .map(([key, value]) => `${key}: ${value}`);
  if (pairs.length === 0) return null;
  return pairs.join(" | ");
};

const ensureShopC = async () => {
  const passwordHash = await bcrypt.hash(SHOP_C.password, 10);

  const user = await sequelize.transaction(async (tx) => {
    let existing = await User.findOne({
      where: { email: SHOP_C.email },
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (!existing) {
      existing = await User.create(
        {
          username: SHOP_C.username,
          email: SHOP_C.email,
          phone: SHOP_C.phone,
          role: "shop",
          password_hash: passwordHash,
        },
        { transaction: tx },
      );
    } else {
      const patch = {
        role: "shop",
        password_hash: passwordHash,
      };
      if (!existing.username) patch.username = SHOP_C.username;
      if (!existing.phone) patch.phone = SHOP_C.phone;
      await existing.update(patch, { transaction: tx });
    }

    return existing;
  });

  const store = await sequelize.transaction(async (tx) => {
    let existing = await Store.findOne({
      where: { owner_id: user.id },
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (!existing) {
      existing = await Store.create(
        {
          owner_id: user.id,
          name: SHOP_C.storeName,
          description: SHOP_C.storeDescription,
          rating: 4.7,
          address_line: "88 Lý Thường Kiệt",
          ward: "Phường 15",
          district: "Quận 10",
          city: "Hồ Chí Minh",
          province: "Hồ Chí Minh",
          ghn_province_id: 202,
          ghn_district_id: 1454,
          ghn_ward_code: "21211",
        },
        { transaction: tx },
      );
    } else {
      await existing.update(
        {
          name: existing.name || SHOP_C.storeName,
          description: existing.description || SHOP_C.storeDescription,
        },
        { transaction: tx },
      );
    }

    return existing;
  });

  return { user, store };
};

const ensureCategories = async () => {
  const root = await ProductCategory.findOne({
    where: { name: "Linh kiện điện tử" },
  });
  if (!root) {
    throw new Error('Không tìm thấy category "Linh kiện điện tử"');
  }

  const allRows = await ProductCategory.findAll();
  const mapByName = new Map(
    allRows.map((row) => [String(row.name).trim().toLowerCase(), row]),
  );

  const categoryIdByFile = {};
  for (const [fileName, categoryName] of Object.entries(FILE_CATEGORY_MAP)) {
    const key = categoryName.toLowerCase();
    let category = mapByName.get(key);
    if (!category) {
      const baseSlug = slugify(categoryName) || `category-${Date.now()}`;
      let slug = baseSlug;
      let suffix = 1;
      // tránh trùng slug
      while (await ProductCategory.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }

      category = await ProductCategory.create({
        name: categoryName,
        slug,
        parent_id: root.id,
        level: Number(root.level || 1) + 1,
        is_active: true,
      });
      mapByName.set(key, category);
    }

    categoryIdByFile[fileName] = Number(category.id);
  }

  return { rootId: Number(root.id), categoryIdByFile };
};

const buildPrice = (catalogId, msrp) => {
  const base = msrp > 0 ? msrp : 100000 + (catalogId % 90) * 10000;
  const price = clampMsrp(Math.round(base * 1.09 * 100) / 100);
  const unitCost = Math.round(price * 0.8 * 100) / 100;
  const quantity = 15 + (catalogId % 20);
  return { price, unitCost, quantity };
};

(async () => {
  const opts = parseArgs();

  try {
    if (!fs.existsSync(DATASET_DIR)) {
      throw new Error(`Không tìm thấy dataset: ${DATASET_DIR}`);
    }

    const { user, store } = await ensureShopC();
    const { categoryIdByFile } = await ensureCategories();

    const files = fs
      .readdirSync(DATASET_DIR)
      .filter((name) => name.endsWith(".json"))
      .filter((name) => !EXCLUDED_FILES.has(name))
      .sort((a, b) => a.localeCompare(b));

    const importedCatalogIds = [];
    let createdCatalogs = 0;
    let reusedCatalogs = 0;
    let fileUsedCount = 0;

    for (const fileName of files) {
      const categoryId = categoryIdByFile[fileName];
      if (!categoryId) continue;

      const fullPath = path.join(DATASET_DIR, fileName);
      const rows = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      if (!Array.isArray(rows) || rows.length === 0) continue;

      const chosen = pickItems(rows, opts.perFile);
      if (chosen.length === 0) continue;
      fileUsedCount += 1;

      const existing = await ProductCatalog.findAll({
        where: { category_id: categoryId },
        attributes: ["id", "name"],
      });
      const existingByName = new Map(
        existing.map((item) => [String(item.name).trim().toLowerCase(), item]),
      );

      for (const row of chosen) {
        const name = String(row.name || "").trim();
        if (!name) continue;

        const existingRow = existingByName.get(name.toLowerCase());
        if (existingRow) {
          importedCatalogIds.push(Number(existingRow.id));
          reusedCatalogs += 1;
          continue;
        }

        const usdPrice = toNumber(row.price, 0);
        const msrp = clampMsrp(usdPrice * opts.usdToVnd);
        const specs = buildCatalogSpecs(row, fileName);
        const description = buildDescription(specs);

        const created = await ProductCatalog.create({
          name,
          category_id: categoryId,
          brand_id: null,
          description,
          specs,
          msrp,
          status: "active",
          default_image: null,
        });

        importedCatalogIds.push(Number(created.id));
        existingByName.set(name.toLowerCase(), created);
        createdCatalogs += 1;
      }
    }

    const uniqueCatalogIds = Array.from(new Set(importedCatalogIds));

    const alreadyListed = await Product.findAll({
      where: { store_id: store.id, catalog_id: uniqueCatalogIds },
      attributes: ["catalog_id"],
    });
    const listedSet = new Set(
      alreadyListed.map((row) => toNumber(row.catalog_id, 0)).filter(Boolean),
    );

    let createdListings = 0;
    for (const catalogId of uniqueCatalogIds) {
      if (listedSet.has(catalogId)) continue;

      const catalog = await ProductCatalog.findByPk(catalogId, {
        attributes: [
          "id",
          "name",
          "description",
          "default_image",
          "msrp",
          "brand_id",
          "category_id",
        ],
      });
      if (!catalog) continue;

      const msrp = toNumber(catalog.msrp, 0);
      const { price, unitCost, quantity } = buildPrice(catalogId, msrp);

      await sequelize.transaction(async (tx) => {
        const product = await Product.create(
          {
            catalog_id: catalogId,
            category_id: toNumber(catalog.category_id, null),
            brand_id: catalog.brand_id ? toNumber(catalog.brand_id, null) : null,
            name: catalog.name,
            description: catalog.description || null,
            seller_id: user.id,
            store_id: store.id,
            price,
            quantity,
            quality: "new",
            condition_percent: 100,
            buyturn: 0,
            status: "active",
          },
          { transaction: tx },
        );

        if (catalog.default_image) {
          await ProductImage.create(
            {
              product_id: product.id,
              url: catalog.default_image,
              sort_order: 0,
            },
            { transaction: tx },
          );
        }

        const serial = await ProductSerial.create(
          {
            product_id: product.id,
            serial_code: `SC-${catalogId}-STD`,
            serial_specs: {},
          },
          { transaction: tx },
        );

        const inventory = await ProductInventory.create(
          {
            product_id: product.id,
            serial_id: serial.id,
            on_hand: quantity,
            reserved: 0,
          },
          { transaction: tx },
        );

        await ShopInventoryLedger.create(
          {
            store_id: store.id,
            product_id: product.id,
            serial_id: serial.id,
            inventory_id: inventory.id,
            type: "import",
            quantity,
            unit_cost: unitCost,
            note: `Seed từ dataset pc-parts, catalog #${catalogId}`,
            reference_type: "seed_pc_parts",
            reference_id: product.id,
            created_by: user.id,
          },
          { transaction: tx },
        );
      });

      createdListings += 1;
    }

    console.log("[ImportPcParts] Done");
    console.log({
      datasetDir: DATASET_DIR,
      excluded: Array.from(EXCLUDED_FILES),
      filesUsed: fileUsedCount,
      perFile: opts.perFile,
      usdToVnd: opts.usdToVnd,
      createdCatalogs,
      reusedCatalogs,
      selectedCatalogs: uniqueCatalogIds.length,
      createdListingsForShopC: createdListings,
      existingListingsSkipped: listedSet.size,
      shopC: {
        user_id: Number(user.id),
        store_id: Number(store.id),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[ImportPcParts] Failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
