"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker, type DateRange } from "react-day-picker";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as styles from "../styles";
import RevenueDailyChart from "../charts/RevenueDailyChart";
import RevenueMonthlyChart from "../charts/RevenueMonthlyChart";
import AppIcon from "@/components/commons/AppIcon";
import { getShopAnalyticsService } from "../../sevices";
import { showErrorToast } from "@/components/commons/Toast";
import datePickerStyles from "./rangeDatePicker.module.css";

type ShopAnalytics = {
  range: string;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  total_profit?: number;
  total_shipping_fee?: number;
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

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd");

const parseInputDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateLabel = (value: string) =>
  format(parseInputDate(value), "d/M/yyyy", { locale: vi });

export default function ShopAnalyticsView() {
  const { themed, theme } = useAppTheme();
  const today = toDateInputValue(new Date());
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>({
    from: parseInputDate(today),
    to: parseInputDate(today),
  });
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<ShopAnalytics | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await getShopAnalyticsService({
          fromDate,
          toDate,
        });
        setAnalytics(res?.data || null);
      } catch (error) {
        showErrorToast(error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [fromDate, toDate]);

  const dateLabel = useMemo(() => {
    if (fromDate === toDate) return formatDateLabel(fromDate);
    return `${formatDateLabel(fromDate)} — ${formatDateLabel(toDate)}`;
  }, [fromDate, toDate]);

  const openDatePicker = () => {
    setDraftRange({
      from: parseInputDate(fromDate),
      to: parseInputDate(toDate),
    });
    setIsDatePickerOpen((prev) => !prev);
  };

  const onPickDate = (day: Date) => {
    const current = draftRange;
    let nextRange: DateRange;

    if (!current?.from || !current.to) {
      nextRange = { from: day, to: day };
    } else if (!isSameDay(current.from, current.to)) {
      nextRange = { from: day, to: day };
    } else if (isSameDay(current.from, day)) {
      nextRange = current;
    } else if (day > current.from) {
      nextRange = { from: current.from, to: day };
    } else {
      nextRange = { from: day, to: current.from };
    }

    setDraftRange(nextRange);
    setFromDate(toDateInputValue(nextRange.from || new Date()));
    setToDate(toDateInputValue(nextRange.to || new Date()));
  };

  useEffect(() => {
    if (!isDatePickerOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        datePickerRef.current &&
        target &&
        !datePickerRef.current.contains(target)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isDatePickerOpen]);

  const kpis = useMemo(() => {
    const totalOrders = Number(analytics?.total_orders || 0);
    const completedOrders = Number(analytics?.completed_orders || 0);
    const revenue = Number(analytics?.total_revenue || 0);
    const profit = Number(analytics?.total_profit || 0);
    const completionRate = Number(analytics?.completion_rate || 0);

    return [
      {
        label: "Doanh thu",
        value: formatVnd(revenue),
        trend: `${completionRate.toFixed(1)}% tỉ lệ hoàn thành (không gồm phí ship)`,
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
        label: "Lợi nhuận",
        value: formatVnd(profit),
        trend: "Giá bán - giá nhập",
        tone: "flat" as const,
        icon: "$",
      },
    ];
  }, [analytics]);

  const dailyData = analytics?.daily_revenue || [];
  const monthlyData = analytics?.monthly_revenue || [];
  const topProducts = analytics?.top_products || [];
  const datePickerHint =
    "Ấn 1 ngày để xem theo ngày, ấn 2 ngày để chọn khoảng.";

  const dayPickerThemeVars = useMemo(
    () =>
      ({
        "--tx-date-picker-bg": theme.colors.palette.backgrounds.card,
        "--tx-date-picker-elevated": theme.colors.palette.backgrounds.secondary,
        "--tx-date-picker-border": theme.colors.palette.borders.default,
        "--tx-date-picker-text": theme.colors.palette.text.primary,
        "--tx-date-picker-muted": theme.colors.palette.text.muted,
        "--tx-date-picker-accent": theme.colors.palette.brand.purple[600],
        "--tx-date-picker-range": "rgba(168, 85, 247, 0.22)",
      }) as CSSProperties,
    [theme],
  );

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Thống kê & Báo cáo</h1>
        <p style={themed(styles.pageSubtitle)}>
          {loading
            ? "Đang tải dữ liệu..."
            : fromDate === toDate
              ? `Phân tích hiệu suất cửa hàng (ngày ${fromDate})`
              : `Phân tích hiệu suất cửa hàng (${fromDate} đến ${toDate})`}
        </p>
      </header>

      <div style={themed(styles.filterRow)}>
        <div style={themed(styles.datePickerAnchor)} ref={datePickerRef}>
          <button
            type="button"
            style={themed(styles.datePickerTrigger)}
            onClick={openDatePicker}
          >
            <span style={themed(styles.datePickerIcon)}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
                <path d="M8 2.5v4M16 2.5v4M3 9h18" />
              </svg>
            </span>
            <span>{dateLabel}</span>
          </button>

          {isDatePickerOpen ? (
            <div style={themed(styles.datePickerPopover)}>
              <div
                className={datePickerStyles.calendarRoot}
                style={dayPickerThemeVars}
              >
                <DayPicker
                  mode="range"
                  locale={vi}
                  weekStartsOn={0}
                  selected={draftRange}
                  onDayClick={onPickDate}
                  formatters={{
                    formatCaption: (date) =>
                      format(date, "'tháng' M 'năm' yyyy", { locale: vi }),
                    formatWeekdayName: (day) =>
                      (["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const)[
                        day.getDay()
                      ],
                  }}
                  className={datePickerStyles.calendar}
                />
              </div>
              <p style={themed(styles.datePickerHint)}>{datePickerHint}</p>
            </div>
          ) : null}
        </div>
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
                    : kpi.tone === "flat"
                      ? themed(styles.trendDown)
                      : themed(styles.trendFlat)),
                }}
              >
                {kpi.tone === "up" ? "↑" : kpi.tone === "flat" ? "—" : "↓"}{" "}
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
                <div style={themed(styles.price)}>
                  {formatVnd(product.revenue)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </ShopLayout>
  );
}
