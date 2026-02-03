import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const backdrop = (theme: Theme): CSSProperties => ({
  background: `radial-gradient(70% 50% at 10% 10%, ${theme.colors.palette.brand.purple[800]}22 0%, transparent 60%)`,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
});

export const contentRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  flex: 1,
  minWidth: 0,
});

export const mainContent = (theme: Theme): CSSProperties => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
});

export const shell = (theme: Theme): CSSProperties => ({
  maxWidth: "100%",
  flex: 1,
  padding: `${theme.spacing["2xl"]} ${theme.spacing.lg} ${theme.spacing["3xl"]}`,
  display: "flex",
  flexDirection: "column",
});

export const title = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["3xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  margin: `0 0 ${theme.spacing.xl}`,
});

export const grid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: theme.spacing.lg,
});

export const fallback = (theme: Theme): CSSProperties => ({
  minHeight: "60vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.colors.palette.text.secondary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});
