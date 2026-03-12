const {
  CartItem,
  Product,
  ProductCatalog,
  ProductImage,
  Brand,
  ProductCategory,
  Store,
} = require("../../models");
const UserEventService = require("./userEventService");

class CartService {
  static async getCart(userId) {
    const items = await CartItem.findAll({
      where: { user_id: userId },
      order: [["added_at", "DESC"]],
      include: [
        {
          model: Product,
          as: "product",
          required: true,
          where: { status: "active" },
          include: [
            {
              model: ProductCatalog,
              as: "catalog",
              required: false,
              include: [
                { model: Brand, as: "brand", attributes: ["id", "name", "image"] },
                { model: ProductCategory, as: "category", attributes: ["id", "name"] },
              ],
            },
            { model: Store, as: "store", attributes: ["id", "name"] },
            {
              model: ProductImage,
              as: "images",
              attributes: ["id", "url", "sort_order"],
              separate: true,
              order: [["sort_order", "ASC"]],
              limit: 1,
            },
          ],
        },
      ],
    });

    const mapped = items.map((item) => {
      const p = item.product;
      const price = Number(p?.price || 0);
      const quantity = Number(item.quantity || 0);
      return {
        id: item.id,
        product_id: item.product_id,
        quantity,
        added_at: item.added_at,
        subtotal: Number((price * quantity).toFixed(2)),
        product: p,
      };
    });

    const subtotal = mapped.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalItems = mapped.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    return {
      items: mapped,
      subtotal: Number(subtotal.toFixed(2)),
      total_items: totalItems,
      total_lines: mapped.length,
    };
  }

  static async addItem(userId, payload) {
    const productId = Number(payload.product_id);
    const quantity = Math.max(1, Number(payload.quantity || 1));
    if (!productId) throw new Error("product_id không hợp lệ");

    const product = await Product.findByPk(productId);
    if (!product || product.status !== "active") {
      throw new Error("Sản phẩm không khả dụng");
    }
    const store = await Store.findByPk(Number(product.store_id), {
      attributes: ["id", "owner_id"],
    });
    if (store && Number(store.owner_id) === Number(userId)) {
      throw new Error("Không thể mua sản phẩm của chính cửa hàng của bạn");
    }
    if (Number(product.quantity || 0) <= 0) {
      throw new Error("Sản phẩm đã hết hàng");
    }

    const existing = await CartItem.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      const nextQty = Math.min(
        Number(product.quantity || 0),
        Number(existing.quantity || 0) + quantity
      );
      await existing.update({ quantity: nextQty });
    } else {
      const safeQty = Math.min(Number(product.quantity || 0), quantity);
      await CartItem.create({
        user_id: userId,
        product_id: productId,
        quantity: safeQty,
      });
    }

    try {
      await UserEventService.track(userId, {
        product_id: productId,
        event_type: "add_to_cart",
        meta: { quantity },
      });
    } catch (error) {
      console.error("[Event] track add_to_cart failed:", error.message);
    }

    return CartService.getCart(userId);
  }

  static async updateItem(userId, itemId, quantityInput) {
    const item = await CartItem.findByPk(itemId);
    if (!item || Number(item.user_id) !== Number(userId)) {
      throw new Error("Không tìm thấy item trong giỏ hàng");
    }

    const nextQty = Number(quantityInput);
    if (!Number.isFinite(nextQty)) throw new Error("Số lượng không hợp lệ");
    if (nextQty <= 0) {
      await item.destroy();
      return CartService.getCart(userId);
    }

    const product = await Product.findByPk(item.product_id);
    if (!product || product.status !== "active") {
      throw new Error("Sản phẩm không khả dụng");
    }

    const safeQty = Math.min(nextQty, Number(product.quantity || 0));
    if (safeQty <= 0) throw new Error("Sản phẩm đã hết hàng");
    await item.update({ quantity: safeQty });
    return CartService.getCart(userId);
  }

  static async removeItem(userId, itemId) {
    const item = await CartItem.findByPk(itemId);
    if (!item || Number(item.user_id) !== Number(userId)) {
      throw new Error("Không tìm thấy item trong giỏ hàng");
    }
    await item.destroy();
    return CartService.getCart(userId);
  }

  static async clearCart(userId) {
    await CartItem.destroy({ where: { user_id: userId } });
    return { items: [], subtotal: 0, total_items: 0, total_lines: 0 };
  }
}

module.exports = CartService;
