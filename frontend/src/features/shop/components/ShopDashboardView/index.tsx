"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as styles from "../styles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { getShopProducts } from "../../store";

export default function ShopDashboardView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { info, productsTotal, loading } = useAppSelector(
    (state: RootState) => state.shop
  );

  useEffect(() => {
    // Lấy danh sách sản phẩm để biết tổng số lượng
    dispatch(getShopProducts({ page: 1, limit: 1, append: false }));
  }, [dispatch]);

  const stats = useMemo(() => [
    { label: "Tổng sản phẩm", value: productsTotal.toString(), tone: "#7c3aed" },
    { label: "Đơn hàng", value: "0", tone: "#3b82f6" }, // Tạm thời để 0 vì chưa có API
    { label: "Doanh thu", value: "$0", tone: "#22c55e" }, // Tạm thời để 0 vì chưa có API
    { label: "Đánh giá", value: info?.rating?.toString() || "0", tone: "#f59e0b", sub: info?.rating?.toFixed(1) || "0.0" },
  ], [productsTotal, info]);

  // Dữ liệu giả cho đơn hàng gần đây cho đến khi có API
  const orders: any[] = []; 

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Dashboard</h1>
        <p style={themed(styles.pageSubtitle)}>
          Chào mừng trở lại, {info?.name || "Shop của bạn"}!
        </p>
      </header>

      <section style={themed(styles.statGrid)}>
        {stats.map((stat) => (
          <div key={stat.label} style={themed(styles.statCard)}>
            <div>
              <div style={themed(styles.statLabel)}>{stat.label}</div>
              <div style={themed(styles.statValue)}>{loading ? "..." : stat.value}</div>
              {stat.sub && (
                <div style={{ color: stat.tone, marginTop: 4 }}>★ {stat.sub}</div>
              )}
            </div>
            <div style={{ ...themed(styles.statIcon), background: `${stat.tone}22` }}>
              <span style={{ color: stat.tone }}>
                {stat.label === "Doanh thu" ? "$" : stat.label === "Đơn hàng" ? "📦" : stat.label === "Tổng sản phẩm" ? "🛒" : "⭐"}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section style={themed(styles.actionGrid)}>
        <Link
          href="/shop/products"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionPurple) }}
        >
          Quản lý sản phẩm
        </Link>
        <Link
          href="/shop/orders"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionBlue) }}
        >
          Xử lý đơn hàng
        </Link>
        <Link
          href="/shop/analytics"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionGreen) }}
        >
          Xem thống kê
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
          {orders.length > 0 ? (
            orders.map((order) => (
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
            ))
          ) : (
            <div style={{ padding: "24px", textAlign: "center", color: themed(styles.muted).color }}>
              Chưa có đơn hàng nào.
            </div>
          )}
        </div>
      </section>
    </ShopLayout>
  );
}
