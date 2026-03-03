"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import {
  fetchCart,
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../store/cartSlice";
import {
  selectCartItems,
  selectCartLoading,
  selectCartTotalItems,
} from "../store/cartSelectors";

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

export default function CartView() {
  const router = useRouter();
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const loading = useAppSelector(selectCartLoading);
  const totalItems = useAppSelector(selectCartTotalItems);
  const [deselectedIds, setDeselectedIds] = useState<number[]>([]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    items.forEach((item) => {
      const key = item.product?.store?.name || "Cửa hàng";
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [items]);

  const onChangeQty = (id: number, quantity: number) => {
    dispatch(updateCartItemQuantity({ id, quantity }));
  };

  const selectedItems = useMemo(
    () => items.filter((item) => !deselectedIds.includes(item.id)),
    [items, deselectedIds],
  );

  const selectedTotalItems = useMemo(
    () => selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [selectedItems],
  );

  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [selectedItems],
  );

  const selectedIds = selectedItems.map((item) => item.id);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const onToggleAll = () => {
    if (allSelected) {
      setDeselectedIds((prev) => {
        const next = new Set(prev);
        items.forEach((item) => next.add(item.id));
        return Array.from(next);
      });
      return;
    }
    setDeselectedIds((prev) => prev.filter((id) => !items.some((item) => item.id === id)));
  };

  const onToggleOne = (id: number) => {
    setDeselectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const onCheckoutSelected = () => {
    if (selectedIds.length === 0) return;
    router.push(`/checkout?cart_item_ids=${selectedIds.join(",")}`);
  };

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <h1 style={themed(styles.title)}>Giỏ hàng ({totalItems} sản phẩm)</h1>

        <div style={themed(styles.layout)}>
          <div style={themed(styles.tableHeader)}>
            <label style={themed(styles.checkboxCell)}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                style={themed(styles.checkboxInput)}
              />
            </label>
            <span>Mặt hàng</span>
            <span>Đơn giá</span>
            <span>Số lượng</span>
            <span>Tạm tính</span>
            <span>Thao tác</span>
          </div>

          {loading && items.length === 0 ? (
            <div style={themed(styles.emptyState)}>Đang tải giỏ hàng...</div>
          ) : items.length === 0 ? (
            <div style={themed(styles.emptyState)}>Giỏ hàng đang trống.</div>
          ) : (
            grouped.map(([shopName, shopItems]) => (
              <div key={shopName} style={themed(styles.groupCard)}>
                <div style={themed(styles.shopHeader)}>
                  <span>{shopName}</span>
                </div>
                {shopItems.map((item) => {
                  const price = Number(item.product?.price || 0);
                  return (
                    <div key={item.id} style={themed(styles.itemRow)}>
                      <label style={themed(styles.checkboxCell)}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => onToggleOne(item.id)}
                          style={themed(styles.checkboxInput)}
                        />
                      </label>
                      <div style={themed(styles.productCell)}>
                        <div style={themed(styles.thumb)} />
                        <div>
                          <div style={themed(styles.itemName)}>
                            {item.product?.name ?? `#${item.product_id}`}
                          </div>
                        </div>
                      </div>
                      <div style={themed(styles.itemPrice)}>{currency(price)}</div>
                      <div style={themed(styles.qtyWrap)}>
                        <button
                          type="button"
                          style={themed(styles.qtyButton)}
                          onClick={() =>
                            onChangeQty(item.id, Math.max(1, item.quantity - 1))
                          }
                        >
                          –
                        </button>
                        <span style={themed(styles.qtyValue)}>{item.quantity}</span>
                        <button
                          type="button"
                          style={themed(styles.qtyButton)}
                          onClick={() => onChangeQty(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div style={themed(styles.itemPrice)}>
                        {currency(Number(item.subtotal || 0))}
                      </div>
                      <button
                        type="button"
                        style={themed(styles.removeButton)}
                        onClick={() => dispatch(removeCartItem(item.id))}
                      >
                        Xóa
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          <div style={themed(styles.cartFooter)}>
            <div style={themed(styles.footerLeft)}>
              <button
                type="button"
                style={themed(styles.removeButton)}
                onClick={() => dispatch(clearCart())}
              >
                Xóa tất cả
              </button>
            </div>
            <div style={themed(styles.footerTotal)}>
              <span>Đã chọn ({selectedTotalItems}/{totalItems} sản phẩm):</span>
              <span style={themed(styles.summaryTotal)}>
                {currency(selectedSubtotal)}
              </span>
              <button
                type="button"
                style={{
                  ...themed(styles.primaryButton),
                  ...(selectedIds.length === 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                }}
                disabled={selectedIds.length === 0}
                onClick={onCheckoutSelected}
              >
                Mua hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
