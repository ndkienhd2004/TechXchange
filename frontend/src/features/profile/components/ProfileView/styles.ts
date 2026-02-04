import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  padding: theme.spacing.xl,
});

export const container = (theme: Theme): CSSProperties => ({
  maxWidth: "900px",
  margin: "0 auto",
});

export const section = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  borderRadius: theme.spacing.xl,
  padding: theme.spacing["2xl"],
  marginBottom: theme.spacing.xl,
  boxShadow: theme.shadows.lg,
});

export const sectionTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.semibold,
  margin: `0 0 ${theme.spacing.xl}`,
  color: theme.colors.palette.text.primary,
});

export const summaryCard = (theme: Theme): CSSProperties => ({
  ...section(theme),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.xl,
  flexWrap: "wrap",
});

export const summaryLeft = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.xl,
  flex: 1,
  minWidth: 0,
});

export const summaryAvatar = (theme: Theme): CSSProperties => ({
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: `linear-gradient(130deg, ${theme.colors.palette.brand.purple[600]} 0%, ${theme.colors.palette.brand.pink[600]} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.text.primary,
  flexShrink: 0,
});

export const summaryAvatarImg = (theme: Theme): CSSProperties => ({
  width: 80,
  height: 80,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
});

export const summaryInfo = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
  minWidth: 0,
});

export const summaryName = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.palette.text.primary,
  margin: 0,
});

export const summaryEmail = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
  margin: 0,
});

export const summaryStats = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing[6],
  flexWrap: "wrap",
});

export const summaryStat = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
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
  alignSelf: "flex-start",
});

export const summaryButton = (theme: Theme): CSSProperties => ({
  ...button(theme),
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing[2],
  flexShrink: 0,
  textDecoration: "none",
});

export const actionsRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.xl,
});

export const actionCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.xl,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  cursor: "pointer",
  transition: "border-color 0.2s ease, background 0.2s ease",
  textDecoration: "none",
  color: "inherit",
});

export const actionIcon = (theme: Theme): CSSProperties => ({
  width: 40,
  height: 40,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const actionContent = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[1],
  minWidth: 0,
});

export const actionTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.palette.text.primary,
});

export const actionSub = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.secondary,
});

export const tabsRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing[2],
  marginBottom: theme.spacing.xl,
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor: theme.colors.palette.borders.dark,
});

export const tab = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  color: theme.colors.palette.text.secondary,
  background: "none",
  borderWidth: 0,
  borderStyle: "none",
  borderColor: "transparent",
  borderBottomWidth: 2,
  borderBottomStyle: "solid",
  borderBottomColor: "transparent",
  marginBottom: -1,
  cursor: "pointer",
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const tabActive = (theme: Theme): CSSProperties => ({
  ...tab(theme),
  color: theme.colors.palette.brand.purple[400],
  borderBottomColor: theme.colors.palette.brand.purple[500],
});
