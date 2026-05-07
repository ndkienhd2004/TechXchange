require('dotenv').config();

const { ProductCategory, sequelize } = require('../src/models');

const ROOT_NAME = 'Thiết bị điện tử';
const LINH_KIEN_OLD = 'Linh kiện';
const LINH_KIEN_NEW = 'Linh kiện điện tử';

const LINH_KIEN_CHILDREN = [
  'CPU',
  'RAM',
  'Card đồ họa',
  'Bo mạch chủ',
  'Nguồn máy tính',
  'Tản nhiệt CPU',
  'Quạt case',
  'Keo tản nhiệt',
  'Bộ điều khiển quạt',
  'Ổ cứng trong',
  'Ổ đĩa quang',
  'Card mạng có dây',
  'Card mạng không dây',
  'Card âm thanh',
];

const ROOT_CHILDREN = [
  'Laptop',
  'Điện thoại',
  'Máy tính bảng',
  'Đồng hồ thông minh',
  'Màn hình',
  'Bàn phím',
  'Chuột',
  'Tai nghe',
  'Tai nghe nhét tai',
  'Loa',
  'Webcam',
  'Ổ cứng gắn ngoài',
  'Bộ lưu điện UPS',
  'Phụ kiện laptop',
  'Phụ kiện điện thoại',
  'Ốp lưng',
  'Phụ kiện ốp lưng',
  'Hệ điều hành',
  LINH_KIEN_NEW,
];

const byName = (rows) => {
  const map = new Map();
  for (const row of rows) {
    map.set(String(row.name).trim().toLowerCase(), row);
  }
  return map;
};

const recalcLevels = async () => {
  const rows = await ProductCategory.findAll({
    attributes: ['id', 'parent_id', 'level'],
    order: [['id', 'ASC']],
  });

  const childrenByParent = new Map();
  const rootIds = [];

  for (const row of rows) {
    const json = row.toJSON();
    if (!json.parent_id) {
      rootIds.push(json.id);
      continue;
    }
    const parentId = Number(json.parent_id);
    const current = childrenByParent.get(parentId) || [];
    current.push(json.id);
    childrenByParent.set(parentId, current);
  }

  const levels = new Map();
  const queue = rootIds.map((id) => ({ id, level: 1 }));

  while (queue.length > 0) {
    const current = queue.shift();
    levels.set(Number(current.id), current.level);

    const children = childrenByParent.get(Number(current.id)) || [];
    for (const childId of children) {
      queue.push({ id: childId, level: current.level + 1 });
    }
  }

  for (const row of rows) {
    const id = Number(row.id);
    const nextLevel = levels.get(id) || 1;
    if (Number(row.level) !== Number(nextLevel)) {
      await row.update({ level: nextLevel });
    }
  }
};

(async () => {
  const tx = await sequelize.transaction();
  try {
    const rows = await ProductCategory.findAll({
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    const nameMap = byName(rows);

    const root = nameMap.get(ROOT_NAME.toLowerCase());
    if (!root) {
      throw new Error(`Không tìm thấy danh mục gốc: ${ROOT_NAME}`);
    }

    const linhKien = nameMap.get(LINH_KIEN_OLD.toLowerCase()) || nameMap.get(LINH_KIEN_NEW.toLowerCase());
    if (!linhKien) {
      throw new Error(`Không tìm thấy danh mục ${LINH_KIEN_OLD} hoặc ${LINH_KIEN_NEW}`);
    }

    if (linhKien.name !== LINH_KIEN_NEW) {
      await linhKien.update({ name: LINH_KIEN_NEW }, { transaction: tx });
    }

    if (Number(linhKien.parent_id || 0) !== Number(root.id)) {
      await linhKien.update({ parent_id: root.id }, { transaction: tx });
    }

    const updatedRows = await ProductCategory.findAll({ transaction: tx });
    const updatedMap = byName(updatedRows);

    const maybeSetParent = async (categoryName, parentId) => {
      const item = updatedMap.get(String(categoryName).trim().toLowerCase());
      if (!item) return false;
      if (Number(item.id) === Number(parentId)) return false;
      if (Number(item.parent_id || 0) !== Number(parentId || 0)) {
        await item.update({ parent_id: parentId }, { transaction: tx });
      }
      return true;
    };

    for (const name of LINH_KIEN_CHILDREN) {
      await maybeSetParent(name, linhKien.id);
    }

    for (const name of ROOT_CHILDREN) {
      await maybeSetParent(name, root.id);
    }

    await tx.commit();

    await recalcLevels();

    const finalRows = await ProductCategory.findAll({
      order: [['level', 'ASC'], ['parent_id', 'ASC'], ['name', 'ASC']],
    });

    console.log('[CategoryTree] Đã cập nhật cây danh mục thành công.');
    for (const row of finalRows) {
      const c = row.toJSON();
      console.log(`${c.id}\t${c.name}\tparent=${c.parent_id ?? 'null'}\tlevel=${c.level}`);
    }
  } catch (error) {
    await tx.rollback();
    console.error('[CategoryTree] Lỗi:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
