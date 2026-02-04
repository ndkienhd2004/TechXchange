"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";

const tabs = [
  { key: "all", label: "Tất cả", count: 2 },
  { key: "pending", label: "Chờ duyệt", count: 1 },
  { key: "approved", label: "Đã duyệt", count: 1 },
  { key: "rejected", label: "Từ chối", count: 0 },
];

const products = [
  {
    name: "DJI Mini 3 Pro Drone",
    shop: "UGREEN Vietnam Shop",
    price: "$759",
    status: "pending",
    date: "19/12/2025",
  },
  {
    name: "Sony WH-1000XM5",
    shop: "TechMart Store",
    price: "$349",
    status: "approved",
    date: "18/12/2025",
  },
];

export default function AdminProductsView() {
  const { themed } = useAppTheme();

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý sản phẩm</h1>
        <p style={themed(styles.pageSubtitle)}>2 sản phẩm</p>
      </header>

      <section style={themed(styles.toolbar)}>
        <div style={themed(styles.searchWrap)}>
          <span style={themed(styles.searchIcon)}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            style={themed(styles.searchInput)}
          />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={themed(styles.tabGroup)}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                style={
                  tab.key === "all"
                    ? themed(styles.tabButtonActive)
                    : themed(styles.tabButton)
                }
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <button type="button" style={themed(styles.primaryButton)}>
            + Tạo sản phẩm
          </button>
        </div>
      </section>

      <section style={themed(styles.tableCard)}>
        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Sản phẩm</th>
              <th style={themed(styles.th)}>Cửa hàng</th>
              <th style={themed(styles.th)}>Giá</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Ngày tạo</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.name}>
                <td style={themed(styles.td)}>{product.name}</td>
                <td style={themed(styles.td)}>{product.shop}</td>
                <td style={themed(styles.td)}>{product.price}</td>
                <td style={themed(styles.td)}>
                  <span
                    style={{
                      ...themed(styles.statusPill),
                      ...(product.status === "approved"
                        ? themed(styles.statusApproved)
                        : themed(styles.statusPending)),
                    }}
                  >
                    {product.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                </td>
                <td style={themed(styles.td)}>{product.date}</td>
                <td style={themed(styles.td)}>
                  <div style={themed(styles.rowActions)}>
                    <button type="button" style={themed(styles.iconButton)}>
                      👁
                    </button>
                    {product.status === "pending" && (
                      <button type="button" style={themed(styles.primaryButton)}>
                        Duyệt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
