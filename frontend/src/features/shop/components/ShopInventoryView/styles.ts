import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const sectionCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
});

export const toolbar = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.md,
  flexWrap: "wrap",
});

export const searchWrap = (theme: Theme): CSSProperties => ({
  flex: 1,
  minWidth: "260px",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
});

export const searchInput = (theme: Theme): CSSProperties => ({
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const buttonRefresh = (theme: Theme): CSSProperties => ({
  border: "none",
  borderRadius: theme.spacing.md,
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  background: theme.colors.palette.semantic.success,
  color: "#fff",
  cursor: "pointer",
  fontWeight: theme.typography.fontWeight.semibold,
  minHeight: "40px",
});

export const tableWrap = (): CSSProperties => ({
  overflowX: "auto",
});

export const table = (): CSSProperties => ({
  width: "100%",
  borderCollapse: "collapse",
});

export const th = (theme: Theme): CSSProperties => ({
  textAlign: "left",
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  fontWeight: theme.typography.fontWeight.semibold,
  padding: `${theme.spacing[2]} ${theme.spacing[2]}`,
  borderBottom: `1px solid ${theme.colors.palette.borders.default}`,
  whiteSpace: "nowrap",
});

export const td = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[3]} ${theme.spacing[2]}`,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
  verticalAlign: "middle",
  fontSize: theme.typography.fontSize.sm.size,
});

export const productCell = (): CSSProperties => ({
  minWidth: "260px",
});

export const productTitle = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.semibold,
  margin: 0,
  fontSize: theme.typography.fontSize.sm.size,
  lineHeight: 1.35,
});

export const productSub = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
  marginTop: 2,
});

export const actionBtn = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.brand.purple[300],
  borderRadius: theme.spacing.md,
  cursor: "pointer",
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  fontWeight: theme.typography.fontWeight.semibold,
  fontSize: theme.typography.fontSize.xs.size,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const valueMuted = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
});

export const valueDanger = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.semantic.error,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const headerRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.md,
  flexWrap: "wrap",
});

export const backBtn = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.secondary,
  cursor: "pointer",
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing[2],
  fontSize: theme.typography.fontSize.sm.size,
});

export const importBtn = (theme: Theme): CSSProperties => ({
  border: "none",
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.semantic.success,
  color: "#fff",
  cursor: "pointer",
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const statsGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.md,
});

export const statCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  padding: theme.spacing.md,
});

export const statTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  marginBottom: 6,
});

export const statValue = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.text.primary,
});

export const modalOverlay = (): CSSProperties => ({
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 1100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
});

export const modalCard = (theme: Theme): CSSProperties => ({
  width: "min(520px, 92vw)",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  boxShadow: theme.shadows.xl,
  padding: theme.spacing.lg,
});

export const modalTitle = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.bold,
});

export const formRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: 6,
  marginTop: theme.spacing.md,
});

export const label = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const input = (theme: Theme): CSSProperties => ({
  width: "100%",
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  outline: "none",
});

export const textarea = (theme: Theme): CSSProperties => ({
  ...input(theme),
  resize: "vertical",
  minHeight: "84px",
});

export const modalActions = (theme: Theme): CSSProperties => ({
  marginTop: theme.spacing.lg,
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing[2],
});

export const buttonGhost = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.secondary,
  cursor: "pointer",
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
});

export const buttonPrimary = (theme: Theme): CSSProperties => ({
  border: "none",
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.brand.purple[600],
  color: "#fff",
  cursor: "pointer",
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  fontWeight: theme.typography.fontWeight.semibold,
});
