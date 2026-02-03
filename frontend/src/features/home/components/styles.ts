import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100%",
  minWidth: "100%",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const backdrop = (theme: Theme): CSSProperties => ({
  background: `radial-gradient(70% 50% at 10% 10%, ${theme.colors.palette.brand.purple[800]}33 0%, transparent 60%), radial-gradient(60% 50% at 85% 15%, ${theme.colors.palette.brand.pink[700]}22 0%, transparent 55%)`,
});

export const shell = (theme: Theme): CSSProperties => ({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: `${theme.spacing["3xl"]} ${theme.spacing.lg} ${theme.spacing["3xl"]}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing["2xl"],
});

export const section = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing.lg,
});

export const sectionHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  flexWrap: "wrap",
});

export const sectionTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  margin: 0,
});

export const viewAllLink = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.brand.purple[400],
  textDecoration: "none",
  fontWeight: theme.typography.fontWeight.semibold,
});

export const saleBannerList = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: theme.spacing[4],
});

export const productGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: theme.spacing.lg,
});
