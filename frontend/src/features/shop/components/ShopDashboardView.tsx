"use client";

import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "./ShopLayout";
import * as styles from "./styles";

const stats = [
  { label: "Tổng sản phẩm", value: "3", tone: "#7c3aed" },
  { label: "Đơn hàng", value: "8", tone: "#3b82f6" },
  { label: "Doanh thu", value: "$7,319", tone: "#22c55e" },
  { label: "Đánh giá", value: "0", tone: "#f59e0b", sub: "4.9" },
];

const orders = [
  {
    id: "ORD2025121903",
    items: "1 sản phẩm · $789",
    status: "confirmed",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121902",
    items: "1 sản phẩm · $713",
    status: "shipping",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121901",
    items: "1 sản phẩm · $1,195",
    status: "delivered",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121904",
    items: "2 sản phẩm · $1,544",
    status: "delivered",
    date: "19/12/2025",
  },
];

export default function ShopDashboardView() {
  const { themed } = useAppTheme();

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Dashboard</h1>
        <p style={themed(styles.pageSubtitle)}>
          Chào mừng trở lại, UGREEN Vietnam Shop!
        </p>
      </header>

      <section style={themed(styles.statGrid)}>
        {stats.map((stat) => (
          <div key={stat.label} style={themed(styles.statCard)}>
            <div>
              <div style={themed(styles.statLabel)}>{stat.label}</div>
              <div style={themed(styles.statValue)}>{stat.value}</div>
              {stat.sub && (
                <div style={{ color: stat.tone, marginTop: 4 }}>★ {stat.sub}</div>
              )}
            </div>
            <div style={{ ...themed(styles.statIcon), background: `${stat.tone}22` }}>
              <span style={{ color: stat.tone }}>$</span>
            </div>
          </div>
        ))}
      </section>

      <section style={themed(styles.actionGrid)}>
        <Link
          href="/shop/products"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionPurple) }}
        >
          Thêm sản phẩm mới
        </Link>
        <Link
          href="/shop/orders"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionBlue) }}
        >
          Xử lý đơn hàng
        </Link>
        <Link
          href="/shop/products"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionGreen) }}
        >
          Quản lý kho
        </Link>
      </section>

      <section style={themed(styles.card)}>
        <div style={themed(styles.cardHeader)}>
          <h2 style={themed(styles.cardTitle)}>Đơn hàng gần đây</h2>
          <Link href="/shop/orders" style={themed(styles.cardLink)}>
            Xem tất cả →
          </Link>
        </div>
        <div style={themed(styles.orderList)}>
          {orders.map((order) => (
            <div key={order.id} style={themed(styles.orderItem)}>
              <div style={themed(styles.orderThumb)} />
              <div>
                <div style={themed(styles.orderName)}>{order.id}</div>
                <div style={themed(styles.orderMeta)}>{order.items}</div>
              </div>
              <span
                style={{
                  ...themed(styles.statusPill),
                  ...(order.status === "confirmed"
                    ? themed(styles.statusConfirmed)
                    : order.status === "shipping"
                    ? themed(styles.statusShipping)
                    : themed(styles.statusDelivered)),
                }}
              >
                {order.status === "confirmed"
                  ? "Đã xác nhận"
                  : order.status === "shipping"
                  ? "Đang giao"
                  : "Đã giao"}
              </span>
              <div style={themed(styles.orderMeta)}>{order.date}</div>
            </div>
          ))}
        </div>
      </section>
    </ShopLayout>
  );
}
