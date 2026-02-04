"use client";

import { useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

const products = [
  {
    name: "iPhone 15 Pro Max 256GB",
    meta: "Storage: 256GB, Color: Natural Titanium",
    qty: 1,
    price: "$1,199",
  },
  {
    name: "iPhone 15 Pro Max 256GB",
    meta: "Storage: 1TB, Color: Natural Titanium",
    qty: 1,
    price: "$1,199",
  },
];

export default function CheckoutView() {
  const { themed } = useAppTheme();
  const [method, setMethod] = useState("bank");

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <h1 style={themed(styles.title)}>Thanh toán</h1>

        <div style={themed(styles.layout)}>
          <div>
            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>📍</span> Địa chỉ giao hàng
                </div>
                <button type="button" style={themed(styles.linkButton)}>
                  + Thêm địa chỉ
                </button>
              </div>
              <p style={themed(styles.emptyText)}>
                Chưa có địa chỉ. Vui lòng thêm địa chỉ giao hàng.
              </p>
            </section>

            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>🛍️</span> Sản phẩm
                </div>
              </div>
              {products.map((product) => (
                <div key={product.meta} style={themed(styles.productRow)}>
                  <div style={themed(styles.thumb)} />
                  <div>
                    <div style={themed(styles.productName)}>{product.name}</div>
                    <div style={themed(styles.productMeta)}>
                      {product.meta} · x{product.qty}
                    </div>
                  </div>
                  <div style={themed(styles.price)}>{product.price}</div>
                </div>
              ))}
            </section>

            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>💳</span> Phương thức thanh toán
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
                <div style={themed(styles.cardTitle)}>📝 Ghi chú</div>
              </div>
              <textarea
                style={themed(styles.noteArea)}
                placeholder="Ghi chú cho đơn hàng..."
              />
            </section>
          </div>

          <aside style={themed(styles.card)}>
            <div style={themed(styles.summaryTitle)}>Tổng đơn hàng</div>
            <div style={themed(styles.summaryRow)}>
              <span>Tạm tính</span>
              <span>$3,597</span>
            </div>
            <div style={themed(styles.summaryRow)}>
              <span>Phí vận chuyển</span>
              <span style={{ color: "#22c55e" }}>Miễn phí</span>
            </div>
            <div style={themed(styles.summaryRow)}>
              <span>Tổng cộng</span>
              <span style={themed(styles.summaryTotal)}>$3,597</span>
            </div>
            <button type="button" style={themed(styles.primaryButton)}>
              Đặt hàng
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
