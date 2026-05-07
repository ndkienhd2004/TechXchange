require('dotenv').config();

const bcrypt = require('bcryptjs');
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
} = require('../src/models');

const DEFAULTS = {
  username: 'shop_c_owner',
  email: 'shopc@techxchange.dev',
  phone: '0900000007',
  password: '123456',
  storeName: 'TechX Store C',
  storeDescription: 'Cửa hàng chuyên linh kiện điện tử phục vụ test AI chatbot',
  limit: 120,
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = { ...DEFAULTS };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--limit' && next) {
      const parsed = Number(next);
      if (Number.isFinite(parsed) && parsed > 0) {
        out.limit = Math.floor(parsed);
      }
      i += 1;
    }
  }

  return out;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const buildPricing = (catalogId, msrp) => {
  const base = msrp > 0 ? msrp : 100000 + (catalogId % 50) * 10000;
  const price = round2(base * 1.08);
  const unitCost = round2(price * 0.78);
  const quantity = 12 + (catalogId % 25);
  return { price, unitCost, quantity };
};

(async () => {
  const opts = parseArgs();

  try {
    const passwordHash = await bcrypt.hash(opts.password, 10);

    const user = await sequelize.transaction(async (tx) => {
      let existing = await User.findOne({
        where: { email: opts.email },
        transaction: tx,
        lock: tx.LOCK.UPDATE,
      });

      if (!existing) {
        existing = await User.create(
          {
            username: opts.username,
            email: opts.email,
            phone: opts.phone,
            role: 'shop',
            password_hash: passwordHash,
          },
          { transaction: tx },
        );
      } else {
        const patch = {};
        if (existing.role !== 'shop') patch.role = 'shop';
        if (existing.username !== opts.username) patch.username = opts.username;
        if (!existing.phone) patch.phone = opts.phone;
        patch.password_hash = passwordHash;
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
            name: opts.storeName,
            description: opts.storeDescription,
            rating: 4.7,
            address_line: '88 Lý Thường Kiệt',
            ward: 'Phường 15',
            district: 'Quận 10',
            city: 'Hồ Chí Minh',
            province: 'Hồ Chí Minh',
            ghn_province_id: 202,
            ghn_district_id: 1454,
            ghn_ward_code: '21211',
          },
          { transaction: tx },
        );
      } else {
        await existing.update(
          {
            name: existing.name || opts.storeName,
            description: existing.description || opts.storeDescription,
          },
          { transaction: tx },
        );
      }

      return existing;
    });

    const rootCategory = await ProductCategory.findOne({
      where: { name: 'Linh kiện điện tử' },
    });

    if (!rootCategory) {
      throw new Error('Không tìm thấy category "Linh kiện điện tử"');
    }

    const childCategories = await ProductCategory.findAll({
      where: { parent_id: rootCategory.id, is_active: true },
      attributes: ['id'],
    });
    const childIds = childCategories.map((item) => Number(item.id));

    if (childIds.length === 0) {
      throw new Error('Linh kiện điện tử chưa có category con để import');
    }

    const existingListings = await Product.findAll({
      where: { store_id: store.id },
      attributes: ['catalog_id'],
    });
    const existingCatalogIds = new Set(
      existingListings
        .map((item) => toNumber(item.catalog_id, 0))
        .filter((id) => id > 0),
    );

    const candidateCatalogs = await ProductCatalog.findAll({
      where: {
        status: 'active',
        category_id: childIds,
      },
      attributes: ['id', 'name', 'description', 'default_image', 'msrp', 'brand_id', 'category_id'],
      order: [['id', 'ASC']],
      limit: opts.limit * 3,
    });

    const catalogsToImport = candidateCatalogs
      .filter((catalog) => !existingCatalogIds.has(toNumber(catalog.id, 0)))
      .slice(0, opts.limit);

    let createdProducts = 0;

    await sequelize.transaction(async (tx) => {
      for (const catalog of catalogsToImport) {
        const catalogId = toNumber(catalog.id, 0);
        const msrp = toNumber(catalog.msrp, 0);
        const { price, unitCost, quantity } = buildPricing(catalogId, msrp);

        const product = await Product.create(
          {
            catalog_id: catalogId,
            category_id: toNumber(catalog.category_id, rootCategory.id),
            brand_id: catalog.brand_id ? toNumber(catalog.brand_id, null) : null,
            name: catalog.name,
            description: catalog.description || null,
            seller_id: user.id,
            store_id: store.id,
            price,
            quantity,
            quality: 'new',
            condition_percent: 100,
            buyturn: 0,
            status: 'active',
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
            type: 'import',
            quantity,
            unit_cost: unitCost,
            note: `Seed linh kiện từ catalog #${catalogId}`,
            reference_type: 'seed',
            reference_id: product.id,
            created_by: user.id,
          },
          { transaction: tx },
        );

        createdProducts += 1;
      }
    });

    console.log('[ShopCSeed] Done');
    console.log({
      user: {
        id: Number(user.id),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      store: {
        id: Number(store.id),
        name: store.name,
        owner_id: Number(store.owner_id),
      },
      requestedLimit: opts.limit,
      imported: createdProducts,
      skippedBecauseExists: Math.max(0, candidateCatalogs.length - catalogsToImport.length),
      password: opts.password,
    });
  } catch (error) {
    console.error('[ShopCSeed] Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
