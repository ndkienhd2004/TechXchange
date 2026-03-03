const { Op } = require("sequelize");
const {
  sequelize,
  CartItem,
  Order,
  OrderItem,
  Product,
  ProductInventory,
  ProductSerial,
  ProductImage,
  Review,
  Store,
} = require("../../models");

class OrderService {
  static async createOrderFromCart(userId, payload = {}) {
    const itemIds = Array.isArray(payload.cart_item_ids)
      ? payload.cart_item_ids.map((id) => Number(id)).filter(Boolean)
      : [];
    const note = payload.note ? String(payload.note).trim() : null;

    const where = { user_id: userId };
    if (itemIds.length > 0) where.id = { [Op.in]: itemIds };

    const cartItems = await CartItem.findAll({
      where,
      include: [
        {
          model: Product,
          as: "product",
          required: true,
          where: { status: "active" },
        },
      ],
      order: [["id", "ASC"]],
    });

    if (cartItems.length === 0) {
      throw new Error("Không có sản phẩm để đặt hàng");
    }

    return sequelize.transaction(async (transaction) => {
      let totalPrice = 0;
      const orderLineInputs = [];

      for (const cartItem of cartItems) {
        const product = cartItem.product;
        const qty = Math.max(1, Number(cartItem.quantity || 1));
        const unitPrice = Number(product.price || 0);

        // ưu tiên kho theo serial nếu có
        const invRows = await ProductInventory.findAll({
          where: { product_id: product.id },
          include: [
            {
              model: ProductSerial,
              as: "serial",
              required: false,
              attributes: ["id"],
            },
          ],
          order: [["id", "ASC"]],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (invRows.length > 0) {
          let remaining = qty;
          for (const inv of invRows) {
            if (remaining <= 0) break;
            const available =
              Math.max(0, Number(inv.on_hand || 0) - Number(inv.reserved || 0));
            if (available <= 0) continue;
            const deduct = Math.min(available, remaining);
            await inv.update(
              { on_hand: Number(inv.on_hand || 0) - deduct },
              { transaction },
            );
            remaining -= deduct;
          }
          if (remaining > 0) {
            throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
          }
          const nextTotal = (await ProductInventory.sum("on_hand", {
            where: { product_id: product.id },
            transaction,
          })) || 0;
          await product.update({ quantity: Number(nextTotal) }, { transaction });
        } else {
          const stock = Number(product.quantity || 0);
          if (stock < qty) {
            throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
          }
          await product.update({ quantity: stock - qty }, { transaction });
        }

        orderLineInputs.push({
          product_id: product.id,
          quantity: qty,
          price: unitPrice,
        });
        totalPrice += unitPrice * qty;
      }

      const order = await Order.create(
        {
          customer_id: userId,
          total_price: Number(totalPrice.toFixed(2)),
          status: "completed",
          note,
        },
        { transaction },
      );

      for (const line of orderLineInputs) {
        await OrderItem.create(
          {
            order_id: order.id,
            product_id: line.product_id,
            quantity: line.quantity,
            price: line.price,
          },
          { transaction },
        );
      }

      await CartItem.destroy({
        where: { id: { [Op.in]: cartItems.map((i) => i.id) } },
        transaction,
      });

      return order;
    });
  }

  static async getMyOrders(userId) {
    const orders = await Order.findAll({
      where: { customer_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "store_id"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  attributes: ["id", "url", "sort_order"],
                  separate: true,
                  limit: 1,
                  order: [["sort_order", "ASC"]],
                },
                { model: Store, as: "store", attributes: ["id", "name"] },
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const productIds = orders.flatMap((o) =>
      (o.items || []).map((it) => Number(it.product_id)),
    );

    const myReviews = productIds.length
      ? await Review.findAll({
          where: { reviewer_id: userId, product_id: { [Op.in]: productIds } },
          attributes: ["id", "product_id"],
        })
      : [];
    const reviewedSet = new Set(myReviews.map((r) => Number(r.product_id)));

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      total_price: order.total_price,
      created_at: order.created_at,
      note: order.note,
      items: (order.items || []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product: item.product,
        can_review:
          order.status === "completed" &&
          !reviewedSet.has(Number(item.product_id)),
      })),
    }));
  }
}

module.exports = OrderService;
