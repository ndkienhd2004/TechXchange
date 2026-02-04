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

const data = [
  { month: "T1", revenue: 2400 },
  { month: "T2", revenue: 1800 },
  { month: "T3", revenue: 3200 },
  { month: "T4", revenue: 2800 },
  { month: "T5", revenue: 3600 },
  { month: "T6", revenue: 2100 },
];

export default function RevenueMonthlyChart() {
  const { themed } = useAppTheme();
  const grid = themed((theme) => ({ stroke: theme.colors.palette.borders.dark }));
  const text = themed((theme) => ({ fill: theme.colors.palette.text.muted }));
  const barColor = themed((theme) => ({
    fill: theme.colors.palette.brand.purple[500],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid.stroke} />
        <XAxis dataKey="month" tick={text} axisLine={false} tickLine={false} />
        <YAxis tick={text} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#1f1f1f",
            border: "1px solid #2f2f2f",
            color: "#fff",
          }}
        />
        <Bar dataKey="revenue" fill={barColor.fill} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
