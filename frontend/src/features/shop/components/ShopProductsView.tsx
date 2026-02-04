"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "./ShopLayout";
import * as styles from "./styles";

const products = [
  {
    id: 1,
    name: "DJI Mini 3 Pro Drone",
    category: "Drone",
    price: "$759",
    compare: "$859",
    stock: 25,
    sold: 40,
    status: "Đang bán",
  },
  {
    id: 2,
    name: "Sony WH-1000XM5 Wireless Headphones",
    category: "Headphones",
    price: "$349",
    compare: "$399",
    stock: 100,
    sold: 250,
    status: "Đang bán",
  },
  {
    id: 3,
    name: "DELL Gaming G15 5520",
    category: "Laptop",
    price: "$1,170",
    compare: "$1,300",
    stock: 50,
    sold: 120,
    status: "Đang bán",
  },
];

export default function ShopProductsView() {
  const { themed } = useAppTheme();

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý sản phẩm</h1>
        <p style={themed(styles.pageSubtitle)}>3 sản phẩm</p>
      </header>

      <section style={themed(styles.tableCard)}>
        <div style={themed(styles.tableHeader)}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            style={themed(styles.search)}
          />
          <button type="button" style={themed(styles.primaryButton)}>
            + Thêm sản phẩm
          </button>
        </div>

        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Sản phẩm</th>
              <th style={themed(styles.th)}>Giá</th>
              <th style={themed(styles.th)}>Kho</th>
              <th style={themed(styles.th)}>Đã bán</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={themed(styles.td)}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={themed(styles.orderThumb)} />
                    <div>
                      <div style={themed(styles.orderName)}>{product.name}</div>
                      <div style={themed(styles.orderMeta)}>{product.category}</div>
                    </div>
                  </div>
                </td>
                <td style={themed(styles.td)}>
                  <div style={themed(styles.price)}>{product.price}</div>
                  <div style={themed(styles.muted)}>{product.compare}</div>
                </td>
                <td style={themed(styles.td)}>{product.stock}</td>
                <td style={themed(styles.td)}>{product.sold}</td>
                <td style={themed(styles.td)}>
                  <span style={{ ...themed(styles.statusPill), ...themed(styles.statusDelivered) }}>
                    {product.status}
                  </span>
                </td>
                <td style={themed(styles.td)}>
                  <div style={themed(styles.rowActions)}>
                    <button type="button" style={themed(styles.iconButton)}>
                      👁
                    </button>
                    <button type="button" style={themed(styles.iconButton)}>
                      ✏️
                    </button>
                    <button type="button" style={themed(styles.iconButton)}>
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </ShopLayout>
  );
}
