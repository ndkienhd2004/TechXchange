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

export default function AdminReviewsView() {
  const { themed } = useAppTheme();

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý đánh giá</h1>
        <p style={themed(styles.pageSubtitle)}>0 đánh giá</p>
      </header>

      <section style={themed(styles.toolbar)}>
        <div style={themed(styles.searchWrap)}>
          <span style={themed(styles.searchIcon)}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên người dùng, nội dung..."
            style={themed(styles.searchInput)}
          />
        </div>
        <div style={themed(styles.tabGroup)}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              style={
                tab.key === "pending"
                  ? themed(styles.tabButtonActive)
                  : themed(styles.tabButton)
              }
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </section>

      <section style={themed(styles.card)}>
        <div style={themed(styles.emptyState)}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>☆</div>
          Không có đánh giá nào
        </div>
      </section>
    </AdminLayout>
  );
}
