import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const container = (theme: Theme): CSSProperties => ({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: `${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing["2xl"]}`,
});

export const hero = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: theme.spacing.xl,
  alignItems: "center",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.xl,
  padding: theme.spacing.xl,
  marginBottom: theme.spacing.xl,
});

export const heroCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.secondary,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
  display: "grid",
  gap: theme.spacing.md,
});

export const shopBanner = (theme: Theme): CSSProperties => ({
  height: "160px",
  borderRadius: theme.spacing.md,
  background:
    "linear-gradient(120deg, rgba(59, 7, 100, 0.8), rgba(17, 24, 39, 0.9))",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  padding: theme.spacing.md,
});

export const shopAvatar = (theme: Theme): CSSProperties => ({
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  background: theme.colors.palette.backgrounds.card,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.brand.purple[500],
});

export const shopName = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const shopBadge = (theme: Theme): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing[1],
  fontSize: theme.typography.fontSize.xs.size,
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.brand.pink[600],
  color: theme.colors.palette.text.primary,
});

export const heroActions = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing.md,
});

export const button = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  borderRadius: theme.spacing.md,
  border: "none",
  background: theme.colors.palette.brand.purple[600],
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.semibold,
  cursor: "pointer",
});

export const outlineButton = (theme: Theme): CSSProperties => ({
  ...button(theme),
  background: "transparent",
  border: `1px solid ${theme.colors.palette.borders.light}`,
  color: theme.colors.palette.text.primary,
});

export const stats = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
  gap: theme.spacing.md,
});

export const statItem = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  color: theme.colors.palette.text.secondary,
});

export const statValue = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const tabs = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.lg,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
  marginBottom: theme.spacing.xl,
});

export const tab = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing.md} 0`,
  color: theme.colors.palette.text.secondary,
  textDecoration: "none",
  borderBottom: "2px solid transparent",
});

export const tabActive = (theme: Theme): CSSProperties => ({
  ...tab(theme),
  color: theme.colors.palette.brand.pink[500],
  borderBottom: `2px solid ${theme.colors.palette.brand.pink[500]}`,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const voucherRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.xl,
});

export const voucherCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px dashed ${theme.colors.palette.brand.pink[500]}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: theme.spacing.md,
  alignItems: "center",
});

export const voucherTitle = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.pink[500],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const voucherButton = (theme: Theme): CSSProperties => ({
  ...button(theme),
  background: theme.colors.palette.brand.pink[600],
});

export const sectionHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.md,
});

export const sectionTitle = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.palette.text.secondary,
});

export const linkButton = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: theme.colors.palette.brand.pink[500],
  cursor: "pointer",
});

export const productGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: theme.spacing.lg,
});

export const productCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.md,
  display: "grid",
  gap: theme.spacing[2],
});

export const productThumb = (theme: Theme): CSSProperties => ({
  height: "140px",
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
});

export const productName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
  fontSize: theme.typography.fontSize.sm.size,
});

export const productPrice = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
  fontWeight: theme.typography.fontWeight.semibold,
});
