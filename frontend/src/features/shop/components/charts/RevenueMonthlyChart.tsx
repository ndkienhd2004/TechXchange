"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppTheme } from "@/theme/ThemeProvider";

interface RevenueMonthlyPoint {
  label: string;
  revenue: number;
}

export default function RevenueMonthlyChart({
  data,
}: {
  data: RevenueMonthlyPoint[];
}) {
  const { themed } = useAppTheme();
  const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  const grid = themed((theme) => ({ stroke: theme.colors.palette.borders.dark }));
  const text = themed((theme) => ({ fill: theme.colors.palette.text.muted }));
  const barColor = themed((theme) => ({
    fill: theme.colors.palette.brand.purple[500],
  }));
  const tooltipStyle = themed((theme) => ({
    background: theme.colors.palette.backgrounds.card,
    border: `1px solid ${theme.colors.palette.borders.default}`,
    color: theme.colors.palette.text.primary,
    borderRadius: theme.spacing.sm,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid.stroke} />
        <XAxis dataKey="label" tick={text} axisLine={false} tickLine={false} />
        <YAxis tick={text} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [formatVnd(Number(value || 0)), "Doanh thu"]}
          labelFormatter={(label) => `Tháng ${label}`}
        />
        <Bar
          dataKey="revenue"
          name="Doanh thu"
          fill={barColor.fill}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
