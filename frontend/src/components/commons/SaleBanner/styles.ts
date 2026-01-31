import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const list = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: theme.spacing[4],
});

export const card = (theme: Theme): CSSProperties => ({
  borderRadius: theme.spacing[4],
  padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  boxShadow: theme.shadows.lg,
  minHeight: "110px",
});

export const content = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
});

export const tag = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  letterSpacing: theme.typography.letterSpacing.wider,
  textTransform: "uppercase",
  color: theme.colors.palette.text.secondary,
});

export const title = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.bold,
});

export const subtitle = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
});

export const priceText = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.base.size,
  color: theme.colors.palette.text.secondary,
});

export const imageWrap = (theme: Theme): CSSProperties => ({
  width: "88px",
  height: "72px",
  borderRadius: theme.spacing[3],
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const image = (): CSSProperties => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});
