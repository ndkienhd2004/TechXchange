"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";

const tabs = [
  { key: "all", label: "Tất cả", count: 2 },
  { key: "pending", label: "Chờ duyệt", count: 0 },
  { key: "approved", label: "Đã duyệt", count: 2 },
  { key: "suspended", label: "Tạm khóa", count: 0 },
];

const stores = [
  {
    name: "TechMart Store",
    owner: "demo@example.com",
    products: 120,
    rating: 4.7,
    status: "approved",
    date: "16/12/2025",
  },
  {
    name: "UGREEN Vietnam Shop",
    owner: "22028285@vnu.edu.vn",
    products: 85,
    rating: 4.9,
    status: "approved",
    date: "16/12/2025",
  },
];

export default function AdminStoresView() {
  const { themed } = useAppTheme();

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý cửa hàng</h1>
        <p style={themed(styles.pageSubtitle)}>2 cửa hàng</p>
      </header>

      <section style={themed(styles.toolbar)}>
        <div style={themed(styles.searchWrap)}>
          <span style={themed(styles.searchIcon)}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên shop, email..."
            style={themed(styles.searchInput)}
          />
        </div>
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
      </section>

      <section style={themed(styles.tableCard)}>
        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Cửa hàng</th>
              <th style={themed(styles.th)}>Chủ shop</th>
              <th style={themed(styles.th)}>Sản phẩm</th>
              <th style={themed(styles.th)}>Đánh giá</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Ngày đăng ký</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.name}>
                <td style={themed(styles.td)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={themed(styles.adminAvatar)}>🏪</div>
                    <div style={themed(styles.pageSubtitle)}>{store.name}</div>
                  </div>
                </td>
                <td style={themed(styles.td)}>{store.owner}</td>
                <td style={themed(styles.td)}>{store.products}</td>
                <td style={themed(styles.td)}>
                  ★ {store.rating}
                </td>
                <td style={themed(styles.td)}>
                  <span
                    style={{
                      ...themed(styles.statusPill),
                      ...(store.status === "approved"
                        ? themed(styles.statusApproved)
                        : themed(styles.statusPending)),
                    }}
                  >
                    {store.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                </td>
                <td style={themed(styles.td)}>{store.date}</td>
                <td style={themed(styles.td)}>
                  <div style={themed(styles.rowActions)}>
                    <button type="button" style={themed(styles.iconButton)}>
                      👁
                    </button>
                    <button type="button" style={themed(styles.dangerButton)}>
                      ⛔
                    </button>
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
