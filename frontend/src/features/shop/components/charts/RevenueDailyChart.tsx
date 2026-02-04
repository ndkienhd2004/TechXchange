"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppTheme } from "@/theme/ThemeProvider";

const data = [
  { day: "T2", revenue: 120 },
  { day: "T3", revenue: 180 },
  { day: "T4", revenue: 90 },
  { day: "T5", revenue: 260 },
  { day: "T6", revenue: 210 },
  { day: "T7", revenue: 320 },
  { day: "CN", revenue: 140 },
];

export default function RevenueDailyChart() {
  const { themed } = useAppTheme();
  const grid = themed((theme) => ({ stroke: theme.colors.palette.borders.dark }));
  const text = themed((theme) => ({ fill: theme.colors.palette.text.muted }));
  const lineColor = themed((theme) => ({
    stroke: theme.colors.palette.brand.purple[400],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid.stroke} />
        <XAxis dataKey="day" tick={text} axisLine={false} tickLine={false} />
        <YAxis tick={text} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#1f1f1f",
            border: "1px solid #2f2f2f",
            color: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={lineColor.stroke}
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
