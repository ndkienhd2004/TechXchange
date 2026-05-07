import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const sidebar = (theme: Theme): CSSProperties => ({
  width: "280px",
  minWidth: "280px",
  flexShrink: 0,
  background: theme.colors.palette.backgrounds.card,
  borderRight: `1px solid ${theme.colors.palette.borders.dark}`,
  padding: theme.spacing.lg,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
});

export const filterTitle = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.palette.text.primary,
  margin: 0,
  paddingBottom: theme.spacing[3],
  borderBottom: `1px solid ${theme.colors.palette.borders.default}`,
});

export const section = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
});

export const sectionHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: 0,
  background: "none",
  border: "none",
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  letterSpacing: theme.typography.letterSpacing.widest,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
});

export const sectionContent = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
  paddingLeft: theme.spacing[2],
});

export const categoriesTreeContainer = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[1],
  paddingLeft: theme.spacing[2],
  maxHeight: "none",
  overflowY: "visible",
});

export const checkboxRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  cursor: "pointer",
});

export const optionRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  border: "none",
  background: "transparent",
  color: theme.colors.palette.text.primary,
  padding: `${theme.spacing[1]} 0`,
  cursor: "pointer",
  textAlign: "left",
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  fontSize: theme.typography.fontSize.sm.size,
});

export const optionLabel = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const optionTrailing = (theme: Theme): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing[2],
  marginLeft: theme.spacing[2],
});

export const optionSelectedCheck = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[500],
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
  lineHeight: 1,
});

export const categoryNode = (): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
});

export const categoryNodeRow = (): CSSProperties => ({
  justifyContent: "space-between",
});

export const categoryDepthIndent = (depth: number): CSSProperties => ({
  paddingLeft: `${depth * 12}px`,
});

export const categoryChildren = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[1],
  marginTop: theme.spacing[1],
});

export const categoryExpandButton = (theme: Theme): CSSProperties => ({
  background: "none",
  border: "none",
  color: theme.colors.palette.text.muted,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
});

export const checkbox = (theme: Theme): CSSProperties => ({
  width: theme.spacing[4],
  height: theme.spacing[4],
  accentColor: theme.colors.palette.brand.purple[500],
  cursor: "pointer",
});

export const checkboxLabel = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
  margin: 0,
});
