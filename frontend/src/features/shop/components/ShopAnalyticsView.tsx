"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "./ShopLayout";
import * as styles from "./styles";
import RevenueDailyChart from "./charts/RevenueDailyChart";
import RevenueMonthlyChart from "./charts/RevenueMonthlyChart";

const kpis = [
  { label: "Doanh thu", value: "$0", trend: "+12.5%", tone: "up", icon: "$" },
  { label: "Đơn hàng", value: "0", trend: "+8.2%", tone: "up", icon: "🛒" },
  { label: "Đơn hoàn thành", value: "0", trend: "0% tỷ lệ", tone: "flat", icon: "📦" },
  { label: "Giá trị TB", value: "$0", trend: "-3.1%", tone: "down", icon: "$" },
];

const topProducts = [
  { name: "DJI Mini 3 Pro Drone", units: 40, revenue: "$7,560" },
  { name: "Sony WH-1000XM5", units: 32, revenue: "$11,168" },
  { name: "DELL Gaming G15 5520", units: 12, revenue: "$14,040" },
  { name: "iPhone 15 Pro Max", units: 8, revenue: "$9,592" },
  { name: "Galaxy Tab S9", units: 6, revenue: "$5,094" },
];

export default function ShopAnalyticsView() {
  const { themed } = useAppTheme();

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Thống kê & Báo cáo</h1>
        <p style={themed(styles.pageSubtitle)}>Phân tích hiệu suất cửa hàng</p>
      </header>

      <div style={themed(styles.filterRow)}>
        {["7 ngày", "30 ngày", "90 ngày", "Tất cả"].map((label, index) => (
          <button
            key={label}
            type="button"
            style={
              index === 0
                ? themed(styles.filterButtonActive)
                : themed(styles.filterButton)
            }
          >
            {label}
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
              <span>{kpi.icon}</span>
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
            <RevenueDailyChart />
          </div>
        </div>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>Doanh thu theo tháng</h2>
          </div>
          <div style={themed(styles.chartBox)}>
            <RevenueMonthlyChart />
          </div>
        </div>
      </section>

      <section style={themed(styles.card)}>
        <div style={themed(styles.cardHeader)}>
          <h2 style={themed(styles.cardTitle)}>Top 5 sản phẩm bán chạy</h2>
        </div>
        <div style={themed(styles.topList)}>
          {topProducts.map((product, index) => (
            <div key={product.name} style={themed(styles.topItem)}>
              <div style={themed(styles.topRank)}>{index + 1}</div>
              <div style={themed(styles.topInfo)}>
                <div style={themed(styles.topName)}>{product.name}</div>
                <div style={themed(styles.orderMeta)}>
                  {product.units} đã bán
                </div>
              </div>
              <div style={themed(styles.price)}>{product.revenue}</div>
            </div>
          ))}
        </div>
      </section>
    </ShopLayout>
  );
}
