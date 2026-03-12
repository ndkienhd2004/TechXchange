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

export const muted = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
});

export const headerRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.lg,
});

const badgeBase = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const badgePending = (theme: Theme): CSSProperties => ({
  ...badgeBase(theme),
  background: theme.colors.palette.status.pending.bg,
  color: theme.colors.palette.status.pending.text,
});

export const badgePaid = (theme: Theme): CSSProperties => ({
  ...badgeBase(theme),
  background: theme.colors.palette.status.delivered.bg,
  color: theme.colors.palette.status.delivered.text,
});

export const badgeExpired = (theme: Theme): CSSProperties => ({
  ...badgeBase(theme),
  background: theme.colors.palette.status.cancelled.bg,
  color: theme.colors.palette.status.cancelled.text,
});

export const card = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
});

export const orderTitle = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
  marginBottom: theme.spacing.md,
});

export const cardGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 260px",
  gap: theme.spacing.lg,
  alignItems: "start",
});

export const infoCol = (): CSSProperties => ({
  display: "grid",
  gap: 10,
});

export const infoLine = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  paddingBottom: theme.spacing[1],
  borderBottom: `1px dashed ${theme.colors.palette.borders.default}`,
});

export const copyRow = (theme: Theme): CSSProperties => ({
  marginTop: theme.spacing.sm,
  display: "flex",
  gap: theme.spacing[2],
});

export const copyButton = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  borderRadius: theme.spacing.md,
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  cursor: "pointer",
});

export const qrCol = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  minHeight: "240px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.colors.palette.backgrounds.secondary,
});

export const qr = (): CSSProperties => ({
  width: 240,
  height: 240,
  borderRadius: 12,
  objectFit: "cover",
});

export const footerActions = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing.md,
  justifyContent: "flex-end",
});

export const primaryButton = (theme: Theme): CSSProperties => ({
  border: "none",
  background: theme.colors.palette.brand.pink[600],
  color: theme.colors.palette.text.primary,
  borderRadius: theme.spacing.md,
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  fontWeight: theme.typography.fontWeight.semibold,
  cursor: "pointer",
});

export const ghostButton = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  borderRadius: theme.spacing.md,
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  cursor: "pointer",
});
