"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as styles from "../styles";
import RevenueDailyChart from "../charts/RevenueDailyChart";
import RevenueMonthlyChart from "../charts/RevenueMonthlyChart";
import AppIcon from "@/components/commons/AppIcon";
import { getShopAnalyticsService } from "../../sevices";
import { showErrorToast } from "@/components/commons/Toast";

type AnalyticsRange = "7d" | "30d" | "90d" | "all";

type ShopAnalytics = {
  range: AnalyticsRange;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  average_order_value: number;
  completion_rate: number;
  daily_revenue: Array<{ date: string; label: string; revenue: number }>;
  monthly_revenue: Array<{ month: string; label: string; revenue: number }>;
  top_products: Array<{
    product_id: number;
    name: string;
    units_sold: number;
    revenue: number;
  }>;
};

const rangeOptions: Array<{ key: AnalyticsRange; label: string }> = [
  { key: "7d", label: "7 ngày" },
  { key: "30d", label: "30 ngày" },
  { key: "90d", label: "90 ngày" },
  { key: "all", label: "Tất cả" },
];

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ShopAnalyticsView() {
  const { themed } = useAppTheme();
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<ShopAnalytics | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await getShopAnalyticsService(range);
        setAnalytics(res?.data || null);
      } catch (error) {
        showErrorToast(error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [range]);

  const kpis = useMemo(() => {
    const totalOrders = Number(analytics?.total_orders || 0);
    const completedOrders = Number(analytics?.completed_orders || 0);
    const revenue = Number(analytics?.total_revenue || 0);
    const avgOrderValue = Number(analytics?.average_order_value || 0);
    const completionRate = Number(analytics?.completion_rate || 0);

    return [
      {
        label: "Doanh thu",
        value: formatVnd(revenue),
        trend: `${completionRate.toFixed(1)}% tỉ lệ hoàn thành`,
        tone: "up" as const,
        icon: "$",
      },
      {
        label: "Đơn hàng",
        value: totalOrders.toString(),
        trend: `${Math.max(totalOrders - completedOrders, 0)} chưa hoàn thành`,
        tone: "flat" as const,
        icon: "cart",
      },
      {
        label: "Đơn hoàn thành",
        value: completedOrders.toString(),
        trend: `${completionRate.toFixed(1)}% tổng đơn`,
        tone: "up" as const,
        icon: "box",
      },
      {
        label: "Giá trị TB",
        value: formatVnd(avgOrderValue),
        trend: "AOV",
        tone: "flat" as const,
        icon: "$",
      },
    ];
  }, [analytics]);

  const dailyData = analytics?.daily_revenue || [];
  const monthlyData = analytics?.monthly_revenue || [];
  const topProducts = analytics?.top_products || [];

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Thống kê & Báo cáo</h1>
        <p style={themed(styles.pageSubtitle)}>
          {loading ? "Đang tải dữ liệu..." : "Phân tích hiệu suất cửa hàng"}
        </p>
      </header>

      <div style={themed(styles.filterRow)}>
        {rangeOptions.map((item) => (
          <button
            key={item.key}
            type="button"
            style={
              range === item.key
                ? themed(styles.filterButtonActive)
                : themed(styles.filterButton)
            }
            onClick={() => setRange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section style={themed(styles.statGrid)}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={themed(styles.statCard)}>
            <div>
              <div style={themed(styles.statLabel)}>{kpi.label}</div>
              <div style={themed(styles.statValue)}>{kpi.value}</div>
              <div
                style={{
                  ...themed(styles.trend),
                  ...(kpi.tone === "up"
                    ? themed(styles.trendUp)
                    : kpi.tone === "down"
                      ? themed(styles.trendDown)
                      : themed(styles.trendFlat)),
                }}
              >
                {kpi.tone === "up" ? "↑" : kpi.tone === "down" ? "↓" : "—"}{" "}
                {kpi.trend}
              </div>
            </div>
            <div style={themed(styles.statIcon)}>
              <span>
                {kpi.icon === "cart" ? (
                  <AppIcon name="cart" />
                ) : kpi.icon === "box" ? (
                  <AppIcon name="box" />
                ) : (
                  kpi.icon
                )}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section style={themed(styles.analyticsGrid)}>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>Doanh thu theo ngày</h2>
          </div>
          <div style={themed(styles.chartBox)}>
            {dailyData.length === 0 ? (
              <div style={themed(styles.muted)}>Chưa có dữ liệu</div>
            ) : (
              <RevenueDailyChart data={dailyData} />
            )}
          </div>
        </div>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>Doanh thu theo tháng</h2>
          </div>
          <div style={themed(styles.chartBox)}>
            {monthlyData.length === 0 ? (
              <div style={themed(styles.muted)}>Chưa có dữ liệu</div>
            ) : (
              <RevenueMonthlyChart data={monthlyData} />
            )}
          </div>
        </div>
      </section>

      <section style={themed(styles.card)}>
        <div style={themed(styles.cardHeader)}>
          <h2 style={themed(styles.cardTitle)}>Top 5 sản phẩm bán chạy</h2>
        </div>
        <div style={themed(styles.topList)}>
          {topProducts.length === 0 ? (
            <div style={themed(styles.muted)}>Chưa có dữ liệu bán hàng</div>
          ) : (
            topProducts.map((product, index) => (
              <div key={product.product_id} style={themed(styles.topItem)}>
                <div style={themed(styles.topRank)}>{index + 1}</div>
                <div style={themed(styles.topInfo)}>
                  <div style={themed(styles.topName)}>{product.name}</div>
                  <div style={themed(styles.orderMeta)}>
                    {product.units_sold} đã bán
                  </div>
                </div>
                <div style={themed(styles.price)}>{formatVnd(product.revenue)}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </ShopLayout>
  );
}
