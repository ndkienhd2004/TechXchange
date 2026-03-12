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
  margin: `0 0 ${theme.spacing.lg}`,
});

export const tabs = (theme: Theme): CSSProperties => ({
  display: "inline-flex",
  gap: theme.spacing[2],
  background: theme.colors.palette.backgrounds.secondary,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  padding: theme.spacing[2],
  marginBottom: theme.spacing.lg,
});

export const tabButton = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  cursor: "pointer",
});

export const tabButtonActive = (theme: Theme): CSSProperties => ({
  ...tabButton(theme),
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const orderCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
  overflow: "hidden",
});

export const orderHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.lg,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const orderMeta = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
});

export const statusPill = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  borderRadius: theme.spacing.md,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  textTransform: "uppercase",
});

export const statusDelivered = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.delivered.bg,
  color: theme.colors.palette.status.delivered.text,
});

export const statusShipping = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.shipping.bg,
  color: theme.colors.palette.status.shipping.text,
});

export const statusConfirmed = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.confirmed.bg,
  color: theme.colors.palette.status.confirmed.text,
});

export const orderBody = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.lg,
  display: "grid",
  gridTemplateColumns: "60px 1fr auto",
  gap: theme.spacing.lg,
  alignItems: "center",
});

export const thumb = (theme: Theme): CSSProperties => ({
  width: theme.spacing["2xl"],
  height: theme.spacing["2xl"],
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
});

export const productName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
});

export const subText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.xs.size,
  marginTop: theme.spacing[1],
});

export const price = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const detailToggle = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: theme.colors.palette.text.secondary,
  cursor: "pointer",
  fontSize: theme.typography.fontSize.sm.size,
});

export const detailWrap = (theme: Theme): CSSProperties => ({
  overflow: "hidden",
  transition: "max-height 0.3s ease",
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const detailInner = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.lg,
  display: "grid",
  gap: theme.spacing.lg,
});

export const shopRow = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
});

export const itemRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "60px 1fr auto",
  gap: theme.spacing.lg,
  alignItems: "center",
  padding: `${theme.spacing.md} 0`,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const addressBox = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  padding: theme.spacing.md,
});

export const actionsRow = (theme: Theme): CSSProperties => ({
  display: "flex",
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
  border: `1px solid ${theme.colors.palette.brand.purple[500]}`,
  color: theme.colors.palette.brand.purple[300],
});

export const modalOverlay = (theme: Theme): CSSProperties => ({
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.55)",
  display: "grid",
  placeItems: "center",
  zIndex: 1200,
  padding: theme.spacing.lg,
});

export const modalCard = (theme: Theme): CSSProperties => ({
  width: "min(560px, 100%)",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
});

export const modalHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.md,
});

export const modalTitle = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const modalClose = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: "transparent",
  color: theme.colors.palette.text.secondary,
  borderRadius: theme.spacing.sm,
  width: 32,
  height: 32,
  cursor: "pointer",
});

export const starRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  marginBottom: theme.spacing.md,
});

export const starButton = (): CSSProperties => ({
  position: "relative",
  width: 28,
  height: 28,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  fontSize: 28,
  lineHeight: "28px",
});

export const starBase = (theme: Theme): CSSProperties => ({
  position: "absolute",
  inset: 0,
  color: theme.colors.palette.text.muted,
});

export const starFill = (theme: Theme): CSSProperties => ({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  color: theme.colors.palette.brand.pink[500],
  whiteSpace: "nowrap",
});

export const ratingText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
});

export const reviewTextarea = (theme: Theme): CSSProperties => ({
  width: "100%",
  minHeight: 120,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  padding: theme.spacing.md,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  resize: "vertical",
  marginBottom: theme.spacing.md,
});

export const modalActions = (theme: Theme): CSSProperties => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing[2],
});
