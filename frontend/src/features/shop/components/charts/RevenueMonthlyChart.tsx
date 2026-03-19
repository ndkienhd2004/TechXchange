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
  const grid = themed((theme) => ({ stroke: theme.colors.palette.borders.dark }));
  const text = themed((theme) => ({ fill: theme.colors.palette.text.muted }));
  const barColor = themed((theme) => ({
    fill: theme.colors.palette.brand.purple[500],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid.stroke} />
        <XAxis dataKey="label" tick={text} axisLine={false} tickLine={false} />
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
