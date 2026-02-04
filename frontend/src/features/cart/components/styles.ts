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

export const title = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  marginBottom: theme.spacing.lg,
});

export const layout = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing.lg,
});

export const sectionCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
});

export const tableHeader = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "32px 1.4fr 120px 140px 120px 100px",
  gap: theme.spacing.md,
  alignItems: "center",
  padding: theme.spacing.md,
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
  marginBottom: theme.spacing.md,
});

export const selectAll = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  padding: theme.spacing.md,
  marginBottom: theme.spacing.lg,
});

export const shopHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  fontWeight: theme.typography.fontWeight.semibold,
  marginBottom: theme.spacing.md,
  color: theme.colors.palette.text.secondary,
});

export const shopBadge = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.brand.purple[600],
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.xs.size,
});

export const shopPill = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.hover,
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
});

export const groupCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
});

export const itemRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "32px 1.4fr 120px 140px 120px 100px",
  gap: theme.spacing.md,
  alignItems: "center",
  padding: `${theme.spacing.md} 0`,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const productCell = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "80px 1fr",
  gap: theme.spacing.md,
  alignItems: "center",
});

export const thumb = (theme: Theme): CSSProperties => ({
  width: "72px",
  height: "72px",
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.hover,
});

export const itemName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
});

export const itemMeta = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
  marginTop: theme.spacing[1],
});

export const itemPrice = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const qtyWrap = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  justifyContent: "center",
});

export const qtyButton = (theme: Theme): CSSProperties => ({
  width: "28px",
  height: "28px",
  borderRadius: theme.spacing.sm,
  border: "none",
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  cursor: "pointer",
});

export const qtyValue = (theme: Theme): CSSProperties => ({
  minWidth: "24px",
  textAlign: "center",
});

export const removeButton = (theme: Theme): CSSProperties => ({
  background: "transparent",
  border: "none",
  color: theme.colors.palette.semantic.error,
  cursor: "pointer",
});

export const cartFooter = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.md,
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: theme.spacing.lg,
  position: "sticky",
  bottom: theme.spacing.lg,
});

export const footerLeft = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  color: theme.colors.palette.text.secondary,
  flexWrap: "wrap",
});

export const footerTotal = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
});

export const summaryTotal = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.brand.purple[400],
});

export const primaryButton = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.brand.pink[600],
  color: theme.colors.palette.text.primary,
  border: "none",
  fontWeight: theme.typography.fontWeight.semibold,
  cursor: "pointer",
});

export const couponRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing[2],
});

export const couponInput = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  minWidth: "200px",
});

export const applyButton = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.brand.purple[400]}`,
  color: theme.colors.palette.brand.purple[300],
  background: "transparent",
  cursor: "pointer",
  fontWeight: theme.typography.fontWeight.semibold,
});
