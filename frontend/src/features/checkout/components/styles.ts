import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const container = (theme: Theme): CSSProperties => ({
  maxWidth: "1100px",
  margin: "0 auto",
  padding: `${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing["2xl"]}`,
});

export const title = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  marginBottom: theme.spacing.lg,
});

export const layout = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 320px",
  gap: theme.spacing.xl,
  alignItems: "start",
});

export const card = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
});

export const cardHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.md,
});

export const cardTitle = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const linkButton = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: theme.colors.palette.brand.purple[400],
  cursor: "pointer",
  fontWeight: theme.typography.fontWeight.semibold,
});

export const emptyText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
});

export const productRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "64px 1fr auto",
  gap: theme.spacing.md,
  alignItems: "center",
  padding: `${theme.spacing.md} 0`,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const thumb = (theme: Theme): CSSProperties => ({
  width: "64px",
  height: "64px",
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
});

export const productName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
});

export const productMeta = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
  marginTop: theme.spacing[1],
});

export const price = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const paymentList = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing.md,
});

export const paymentOption = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
});

export const paymentOptionActive = (theme: Theme): CSSProperties => ({
  ...paymentOption(theme),
  border: `1px solid ${theme.colors.palette.brand.purple[500]}`,
  background: "rgba(168, 85, 247, 0.12)",
});

export const noteArea = (theme: Theme): CSSProperties => ({
  width: "100%",
  minHeight: "120px",
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  padding: theme.spacing.md,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const summaryTitle = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
  marginBottom: theme.spacing.md,
});

export const summaryRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: theme.colors.palette.text.secondary,
  marginBottom: theme.spacing[2],
});

export const summaryTotal = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.brand.purple[400],
});

export const primaryButton = (theme: Theme): CSSProperties => ({
  width: "100%",
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.brand.pink[600],
  color: theme.colors.palette.text.primary,
  border: "none",
  fontWeight: theme.typography.fontWeight.semibold,
  cursor: "pointer",
  marginTop: theme.spacing.md,
});
