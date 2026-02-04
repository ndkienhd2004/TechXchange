"use client";

import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";

const stats = [
  { label: "Cửa hàng", value: "2", tone: "#a855f7" },
  { label: "Sản phẩm", value: "6", tone: "#3b82f6" },
  { label: "Đơn hàng", value: "8", tone: "#22c55e" },
  { label: "Đánh giá", value: "0", tone: "#f59e0b", sub: "Chờ duyệt" },
];

export default function AdminDashboardView() {
  const { themed } = useAppTheme();

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Admin Dashboard</h1>
        <p style={themed(styles.pageSubtitle)}>
          Quản lý hệ thống TechXchange
        </p>
      </header>

      <section style={themed(styles.statGrid)}>
        {stats.map((stat) => (
          <div key={stat.label} style={themed(styles.statCard)}>
            <div>
              <div style={themed(styles.statLabel)}>{stat.label}</div>
              <div style={themed(styles.statValue)}>{stat.value}</div>
              {stat.sub && (
                <div style={{ color: stat.tone, marginTop: 4 }}>
                  {stat.sub}
                </div>
              )}
            </div>
            <div style={{ ...themed(styles.statIcon), background: `${stat.tone}22` }}>
              <span style={{ color: stat.tone }}>★</span>
            </div>
          </div>
        ))}
      </section>

      <section style={themed(styles.cardRow)}>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>Cửa hàng chờ duyệt</h2>
            <Link href="/admin/stores" style={themed(styles.cardLink)}>
              Xem tất cả →
            </Link>
          </div>
          <div style={themed(styles.emptyState)}>
            Không có cửa hàng chờ duyệt
          </div>
        </div>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>Đánh giá chờ duyệt</h2>
            <Link href="/admin/reviews" style={themed(styles.cardLink)}>
              Xem tất cả →
            </Link>
          </div>
          <div style={themed(styles.emptyState)}>
            Không có đánh giá chờ duyệt
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
