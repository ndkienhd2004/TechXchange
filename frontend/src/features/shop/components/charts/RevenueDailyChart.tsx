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

interface RevenueDailyPoint {
  label: string;
  revenue: number;
}

export default function RevenueDailyChart({
  data,
}: {
  data: RevenueDailyPoint[];
}) {
  const { themed } = useAppTheme();
  const grid = themed((theme) => ({ stroke: theme.colors.palette.borders.dark }));
  const text = themed((theme) => ({ fill: theme.colors.palette.text.muted }));
  const lineColor = themed((theme) => ({
    stroke: theme.colors.palette.brand.purple[400],
  }));
  const tooltipStyle = themed((theme) => ({
    background: theme.colors.palette.backgrounds.card,
    border: `1px solid ${theme.colors.palette.borders.default}`,
    color: theme.colors.palette.text.primary,
    borderRadius: theme.spacing.sm,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid.stroke} />
        <XAxis dataKey="label" tick={text} axisLine={false} tickLine={false} />
        <YAxis tick={text} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
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
