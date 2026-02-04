import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing.lg,
});

export const backdrop = (theme: Theme): CSSProperties => ({
  background: `radial-gradient(70% 50% at 50% 0%, ${theme.colors.palette.brand.purple[800]}22 0%, transparent 50%)`,
  width: "100%",
  maxWidth: "520px",
});

export const card = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  borderRadius: theme.spacing.xl,
  padding: theme.spacing["2xl"],
  boxShadow: theme.shadows["2xl"],
});

export const title = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  margin: `0 0 ${theme.spacing.sm}`,
  textAlign: "center",
});

export const subtitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
  margin: `0 0 ${theme.spacing.xl}`,
  textAlign: "center",
});

export const form = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
});

export const label = (theme: Theme): CSSProperties => ({
  display: "block",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  color: theme.colors.palette.text.secondary,
  marginBottom: theme.spacing[2],
});

export const input = (theme: Theme): CSSProperties => ({
  width: "100%",
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  boxSizing: "border-box",
});

export const textarea = (theme: Theme): CSSProperties => ({
  ...input(theme),
  minHeight: "120px",
  resize: "vertical",
});

export const button = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  background: `linear-gradient(130deg, ${theme.colors.palette.brand.purple[600]} 0%, ${theme.colors.palette.brand.pink[600]} 100%)`,
  border: "none",
  borderRadius: theme.spacing.md,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
  marginTop: theme.spacing[2],
});

export const helper = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  marginTop: theme.spacing[1],
});

export const error = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.semantic.error,
  margin: 0,
});

export const listSection = (theme: Theme): CSSProperties => ({
  marginTop: theme.spacing["2xl"],
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
  paddingTop: theme.spacing.xl,
});

export const listTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.semibold,
  margin: `0 0 ${theme.spacing.md}`,
});

export const list = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.md,
});

export const listItem = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
});

export const listName = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const listDesc = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.secondary,
  marginTop: theme.spacing[1],
});

export const statusBadge = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  borderRadius: theme.spacing.md,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  textTransform: "uppercase",
  letterSpacing: theme.typography.letterSpacing.wide,
  whiteSpace: "nowrap",
});

export const statusPending = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.pending.bg,
  color: theme.colors.palette.status.pending.text,
});

export const statusApproved = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.approved.bg,
  color: theme.colors.palette.status.approved.text,
});

export const statusRejected = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.rejected.bg,
  color: theme.colors.palette.status.rejected.text,
});
