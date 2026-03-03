"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import AppIcon from "@/components/commons/AppIcon";
import { fetchCart } from "@/features/cart/store/cartSlice";
import { selectCartItems } from "@/features/cart/store/cartSelectors";
import { getAxiosInstance } from "@/services/axiosConfig";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0),
  );

export default function CheckoutView() {
  const { themed } = useAppTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

  const [method, setMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const selectedCartIds = useMemo(() => {
    const raw = searchParams.get("cart_item_ids");
    if (!raw) return [];
    return raw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);
  }, [searchParams]);

  const checkoutItems = useMemo(() => {
    if (selectedCartIds.length === 0) return cartItems;
    return cartItems.filter((item) => selectedCartIds.includes(Number(item.id)));
  }, [cartItems, selectedCartIds]);

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [checkoutItems],
  );

  const onPlaceOrder = async () => {
    if (checkoutItems.length === 0 || placing) return;
    try {
      setPlacing(true);
      const api = getAxiosInstance();
      await api.post("/orders/checkout", {
        cart_item_ids: checkoutItems.map((item) => Number(item.id)),
        payment_method: method,
        note: note.trim() || undefined,
      });
      showSuccessToast("Đặt hàng thành công");
      dispatch(fetchCart());
      router.push("/orders");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <h1 style={themed(styles.title)}>Thanh toán</h1>

        <div style={themed(styles.layout)}>
          <div>
            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>
                    <AppIcon name="location" />
                  </span>{" "}
                  Địa chỉ giao hàng
                </div>
              </div>
              <p style={themed(styles.emptyText)}>
                Chưa có module địa chỉ. Tạm thời dùng địa chỉ mặc định tài khoản.
              </p>
            </section>

            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>
                    <AppIcon name="bag" />
                  </span>{" "}
                  Sản phẩm
                </div>
              </div>
              {checkoutItems.length === 0 ? (
                <p style={themed(styles.emptyText)}>Không có sản phẩm để thanh toán.</p>
              ) : (
                checkoutItems.map((item) => (
                  <div key={item.id} style={themed(styles.productRow)}>
                    <div style={themed(styles.thumb)} />
                    <div>
                      <div style={themed(styles.productName)}>
                        {item.product?.name || `#${item.product_id}`}
                      </div>
                      <div style={themed(styles.productMeta)}>x{item.quantity}</div>
                    </div>
                    <div style={themed(styles.price)}>
                      {currency(Number(item.subtotal || 0))}
                    </div>
                  </div>
                ))
              )}
            </section>

            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>
                    <AppIcon name="payment" />
                  </span>{" "}
                  Phương thức thanh toán
                </div>
              </div>
              <div style={themed(styles.paymentList)}>
                <button
                  type="button"
                  onClick={() => setMethod("cod")}
                  style={
                    method === "cod"
                      ? themed(styles.paymentOptionActive)
                      : themed(styles.paymentOption)
                  }
                >
                  <input type="radio" checked={method === "cod"} readOnly />
                  Thanh toán khi nhận hàng (COD)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("bank")}
                  style={
                    method === "bank"
                      ? themed(styles.paymentOptionActive)
                      : themed(styles.paymentOption)
                  }
                >
                  <input type="radio" checked={method === "bank"} readOnly />
                  Chuyển khoản ngân hàng
                </button>
              </div>
            </section>

            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <AppIcon name="note" /> Ghi chú
                </div>
              </div>
              <textarea
                style={themed(styles.noteArea)}
                placeholder="Ghi chú cho đơn hàng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </section>
          </div>

          <aside style={themed(styles.card)}>
            <div style={themed(styles.summaryTitle)}>Tổng đơn hàng</div>
            <div style={themed(styles.summaryRow)}>
              <span>Tạm tính</span>
              <span>{currency(subtotal)}</span>
            </div>
            <div style={themed(styles.summaryRow)}>
              <span>Phí vận chuyển</span>
              <span style={{ color: "#22c55e" }}>Miễn phí</span>
            </div>
            <div style={themed(styles.summaryRow)}>
              <span>Tổng cộng</span>
              <span style={themed(styles.summaryTotal)}>{currency(subtotal)}</span>
            </div>
            <button
              type="button"
              style={themed(styles.primaryButton)}
              onClick={onPlaceOrder}
              disabled={placing || checkoutItems.length === 0}
            >
              {placing ? "Đang đặt..." : "Đặt hàng"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
