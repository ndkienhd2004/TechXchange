"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";

const tabs = [
  { key: "all", label: "Tất cả", count: 0 },
  { key: "pending", label: "Chờ duyệt", count: 0 },
  { key: "approved", label: "Đã duyệt", count: 0 },
  { key: "rejected", label: "Từ chối", count: 0 },
];

export default function AdminBrandsView() {
  const { themed } = useAppTheme();

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý thương hiệu</h1>
        <p style={themed(styles.pageSubtitle)}>
          Phê duyệt và quản lý các thương hiệu
        </p>
      </header>

      <section style={themed(styles.toolbar)}>
        <div style={themed(styles.searchWrap)}>
          <span style={themed(styles.searchIcon)}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
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
            + Tạo thương hiệu
          </button>
        </div>
      </section>

      <section style={themed(styles.card)}>
        <div style={themed(styles.emptyState)}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⬢</div>
          Không tìm thấy thương hiệu
        </div>
      </section>
    </AdminLayout>
  );
}
