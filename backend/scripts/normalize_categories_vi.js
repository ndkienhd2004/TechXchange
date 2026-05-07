/* eslint-disable no-console */
require("dotenv").config();

const { sequelize, ProductCategory, Product, ProductCatalog, ProductRequest, Brand } = require("../src/models");

const VN_TRANSLATIONS = {
  case: "Ốp lưng",
  "case accessory": "Phụ kiện ốp lưng",
  "case fan": "Quạt case",
  "cpu cooler": "Tản nhiệt CPU",
  earbuds: "Tai nghe nhét tai",
  "external hard drive": "Ổ cứng gắn ngoài",
  "fan controller": "Bộ điều khiển quạt",
  headphones: "Tai nghe",
  "internal hard drive": "Ổ cứng trong",
  keyboard: "Bàn phím",
  "laptop accessories": "Phụ kiện laptop",
  laptops: "Laptop",
  memory: "RAM",
  "mobile accessories": "Phụ kiện điện thoại",
  mobilephones: "Điện thoại",
  monitor: "Màn hình",
  motherboard: "Bo mạch chủ",
  mouse: "Chuột",
  "optical drive": "Ổ đĩa quang",
  os: "Hệ điều hành",
  "power supply": "Nguồn máy tính",
  "smart watches": "Đồng hồ thông minh",
  smartwatches: "Đồng hồ thông minh",
  "sound card": "Card âm thanh",
  speakers: "Loa",
  tablets: "Máy tính bảng",
  "thermal paste": "Keo tản nhiệt",
  ups: "Bộ lưu điện UPS",
  "video card": "Card đồ họa",
  webcam: "Webcam",
  "wired network card": "Card mạng có dây",
  "wireless network card": "Card mạng không dây",
  "linh kiện điện tử": "Linh kiện",
  "cpu": "CPU",
  "ram": "RAM",
  "laptop": "Laptop",
  "điện thoại": "Điện thoại",
  "tai nghe": "Tai nghe",
  "linh kiện": "Linh kiện",
  "thiết bị điện tử": "Thiết bị điện tử",
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseArgs = () => {
  const argv = process.argv.slice(2);
  return {
    apply: argv.includes("--apply"),
  };
};

const fetchCategoriesWithUsage = async () => {
  const [categories, productCounts, catalogCounts, requestCounts] = await Promise.all([
    ProductCategory.findAll({
      attributes: ["id", "name", "slug", "parent_id", "level", "is_active"],
      raw: true,
      order: [["id", "ASC"]],
    }),
    Product.count({
      group: ["category_id"],
      attributes: ["category_id"],
      raw: true,
    }),
    ProductCatalog.count({
      group: ["category_id"],
      attributes: ["category_id"],
      raw: true,
    }),
    ProductRequest.count({
      group: ["category_id"],
      attributes: ["category_id"],
      raw: true,
    }),
  ]);

  const mapCounts = (rows, key) => {
    const out = new Map();
    (rows || []).forEach((row) => {
      const id = Number(row[key]);
      const count = Number(row.count || 0);
      if (Number.isFinite(id)) out.set(id, count);
    });
    return out;
  };

  const productMap = mapCounts(productCounts, "category_id");
  const catalogMap = mapCounts(catalogCounts, "category_id");
  const requestMap = mapCounts(requestCounts, "category_id");

  return categories.map((item) => {
    const id = Number(item.id);
    return {
      ...item,
      id,
      productCount: Number(productMap.get(id) || 0),
      catalogCount: Number(catalogMap.get(id) || 0),
      requestCount: Number(requestMap.get(id) || 0),
    };
  });
};

const chooseKeeper = (group) => {
  const ranked = [...group].sort((a, b) => {
    const usageA = a.productCount + a.catalogCount + a.requestCount;
    const usageB = b.productCount + b.catalogCount + b.requestCount;
    if (usageB !== usageA) return usageB - usageA;
    return Number(a.id) - Number(b.id);
  });
  return ranked[0];
};

const run = async () => {
  const { apply } = parseArgs();

  await sequelize.authenticate();

  const brands = await Brand.findAll({ attributes: ["name"], raw: true });
  const brandNameSet = new Set(brands.map((b) => normalize(b.name)));

  const categories = await fetchCategoriesWithUsage();
  const electronicsFallback = categories.find(
    (c) => normalize(c.name) === normalize("Thiết bị điện tử"),
  );

  const grouped = new Map();
  const categoryMeta = new Map();

  categories.forEach((category) => {
    const currentNameNorm = normalize(category.name);
    const isBrandLike = brandNameSet.has(currentNameNorm);
    let targetName = VN_TRANSLATIONS[currentNameNorm] || category.name;
    if (isBrandLike) {
      targetName = electronicsFallback ? electronicsFallback.name : "Thiết bị điện tử";
    }

    const key = normalize(targetName);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(category);
    categoryMeta.set(category.id, {
      ...category,
      targetName,
      isBrandLike,
    });
  });

  const mergePlan = [];
  const renamePlan = [];

  grouped.forEach((group, key) => {
    if (!group.length) return;
    const keeper = chooseKeeper(group);
    const targetName = categoryMeta.get(keeper.id).targetName;
    const targetSlug = slugify(targetName);

    if (normalize(keeper.name) !== normalize(targetName) || String(keeper.slug || "") !== targetSlug) {
      renamePlan.push({
        id: keeper.id,
        from: keeper.name,
        to: targetName,
        slug: targetSlug,
      });
    }

    group
      .filter((row) => Number(row.id) !== Number(keeper.id))
      .forEach((dup) => {
        mergePlan.push({
          fromId: Number(dup.id),
          fromName: dup.name,
          toId: Number(keeper.id),
          toName: targetName,
          fromUsage: dup.productCount + dup.catalogCount + dup.requestCount,
        });
      });
  });

  const brandLikeMoved = Array.from(categoryMeta.values()).filter((x) => x.isBrandLike);

  if (!apply) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          totalCategories: categories.length,
          renameCount: renamePlan.length,
          mergeCount: mergePlan.length,
          brandLikeCategoryCount: brandLikeMoved.length,
          sampleRenames: renamePlan.slice(0, 15),
          sampleMerges: mergePlan.slice(0, 15),
        },
        null,
        2,
      ),
    );
    return;
  }

  await sequelize.transaction(async (transaction) => {
    for (const plan of mergePlan) {
      // eslint-disable-next-line no-await-in-loop
      await Product.update(
        { category_id: plan.toId },
        { where: { category_id: plan.fromId }, transaction },
      );
      // eslint-disable-next-line no-await-in-loop
      await ProductCatalog.update(
        { category_id: plan.toId },
        { where: { category_id: plan.fromId }, transaction },
      );
      // eslint-disable-next-line no-await-in-loop
      await ProductRequest.update(
        { category_id: plan.toId },
        { where: { category_id: plan.fromId }, transaction },
      );

      // move children if any
      // eslint-disable-next-line no-await-in-loop
      await ProductCategory.update(
        { parent_id: plan.toId },
        {
          where: {
            parent_id: plan.fromId,
            id: { [require("sequelize").Op.ne]: plan.toId },
          },
          transaction,
        },
      );
    }

    const idsToDelete = mergePlan.map((m) => m.fromId);
    if (idsToDelete.length > 0) {
      await ProductCategory.destroy({
        where: { id: idsToDelete },
        transaction,
      });
    }

    for (const rename of renamePlan) {
      // eslint-disable-next-line no-await-in-loop
      await ProductCategory.update(
        {
          name: rename.to,
          slug: rename.slug,
          is_active: true,
        },
        { where: { id: rename.id }, transaction },
      );
    }
  });

  const after = await fetchCategoriesWithUsage();
  console.log(
    JSON.stringify(
      {
        ok: true,
        applied: true,
        beforeTotalCategories: categories.length,
        afterTotalCategories: after.length,
        renamed: renamePlan.length,
        mergedAndDeleted: mergePlan.length,
        brandLikeCategoryCount: brandLikeMoved.length,
      },
      null,
      2,
    ),
  );
};

run()
  .catch((error) => {
    console.error("[NormalizeCategoriesVI] Failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await sequelize.close();
    } catch (_) {
      // ignore
    }
  });
