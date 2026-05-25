import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  display: "grid",
  gridTemplateColumns: "280px 1fr",
});

export const sidebar = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.secondary,
  borderRight: `1px solid ${theme.colors.palette.borders.dark}`,
  paddingTop: theme.spacing.lg,
  paddingRight: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
  paddingLeft: theme.spacing.lg,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
});

export const backLink = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  textDecoration: "none",
  fontSize: theme.typography.fontSize.sm.size,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
});

export const logoutButton = (theme: Theme): CSSProperties => ({
  ...navItem(theme),
  width: "100%",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: theme.colors.palette.semantic.error,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  fontSize: theme.typography.fontSize.base.size,
  fontWeight: theme.typography.fontWeight.medium,
});

export const adminCard = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  paddingTop: theme.spacing.md,
  paddingRight: theme.spacing.md,
  paddingBottom: theme.spacing.md,
  paddingLeft: theme.spacing.md,
  borderRadius: theme.spacing.lg,
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
});

export const adminAvatar = (theme: Theme): CSSProperties => ({
  width: theme.spacing["2xl"],
  height: theme.spacing["2xl"],
  borderRadius: theme.spacing.lg,
  background: theme.colors.palette.brand.pink[600],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.fontSize.lg.size,
});

export const adminName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
  fontSize: theme.typography.fontSize.sm.size,
});

export const adminSubtitle = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
});

export const nav = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
});

export const navItem = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  textDecoration: "none",
  paddingTop: theme.spacing[3],
  paddingBottom: theme.spacing[3],
  paddingLeft: theme.spacing.md,
  paddingRight: theme.spacing.md,
  borderRadius: theme.spacing.md,
  transition: "background 0.2s ease, color 0.2s ease",
});

export const navItemActive = (theme: Theme): CSSProperties => ({
  ...navItem(theme),
  background: theme.colors.palette.brand.pink[600],
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const content = (theme: Theme): CSSProperties => ({
  paddingTop: theme.spacing["2xl"],
  paddingRight: theme.spacing["2xl"],
  paddingBottom: theme.spacing["2xl"],
  paddingLeft: theme.spacing["2xl"],
});

export const pageHeader = (theme: Theme): CSSProperties => ({
  marginBottom: theme.spacing.xl,
});

export const pageTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  margin: 0,
});

export const pageSubtitle = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  marginTop: theme.spacing[2],
});

export const statGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.xl,
});

export const statCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  paddingTop: theme.spacing.lg,
  paddingRight: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
  paddingLeft: theme.spacing.lg,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
});

export const statLabel = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
});

export const statValue = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.bold,
});

export const statIcon = (theme: Theme): CSSProperties => ({
  width: theme.spacing["2xl"],
  height: theme.spacing["2xl"],
  borderRadius: theme.spacing.lg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.colors.palette.backgrounds.hover,
});

export const cardRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: theme.spacing.lg,
});

export const dashboardWideCard = (theme: Theme): CSSProperties => ({
  ...card(theme),
  marginTop: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
});

export const topShopRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  paddingTop: theme.spacing[2],
  paddingBottom: theme.spacing[2],
  paddingLeft: 0,
  paddingRight: 0,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const topShopRank = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.brand.pink[500],
  minWidth: theme.spacing["2xl"],
});

export const topShopMeta = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.sm.size,
});

export const card = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  paddingTop: theme.spacing.lg,
  paddingRight: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
  paddingLeft: theme.spacing.lg,
});

export const cardHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.md,
});

export const cardTitle = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg.size,
});

export const cardLink = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.pink[400],
  textDecoration: "none",
  fontSize: theme.typography.fontSize.sm.size,
});

export const emptyState = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  textAlign: "center",
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.xl,
  paddingLeft: 0,
  paddingRight: 0,
});

export const toolbar = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
});

export const toolbarStack = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
});

export const summaryGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.lg,
});

export const summaryCard = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
  display: "grid",
  gap: theme.spacing[2],
});

export const summaryLabel = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.sm.size,
});

export const summaryValue = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.bold,
  lineHeight: 1.1,
});

export const toolbarRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "minmax(280px, 420px) 1fr",
  gap: theme.spacing.md,
  alignItems: "center",
});

export const searchWrap = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  paddingTop: theme.spacing[2],
  paddingBottom: theme.spacing[2],
  paddingLeft: theme.spacing[3],
  paddingRight: theme.spacing[3],
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  minWidth: 0,
  width: "100%",
});

export const searchIcon = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
});

export const searchInput = (theme: Theme): CSSProperties => ({
  flex: 1,
  border: "none",
  background: "transparent",
  color: theme.colors.palette.text.primary,
  outline: "none",
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const tabGroup = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  paddingTop: theme.spacing[2],
  paddingRight: theme.spacing[2],
  paddingBottom: theme.spacing[2],
  paddingLeft: theme.spacing[2],
  background: theme.colors.palette.backgrounds.secondary,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
});

export const tabButton = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
  cursor: "pointer",
  paddingTop: theme.spacing[1],
  paddingBottom: theme.spacing[1],
  paddingLeft: theme.spacing[2],
  paddingRight: theme.spacing[2],
  borderRadius: theme.spacing.md,
});

export const tabButtonActive = (theme: Theme): CSSProperties => ({
  ...tabButton(theme),
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const tableCard = (theme: Theme): CSSProperties => ({
  ...card(theme),
  overflow: "hidden",
});

export const tableHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.md,
});

export const tableHeaderMeta = (): CSSProperties => ({
  display: "grid",
  gap: 6,
});

export const tableHeaderTitle = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.bold,
});

export const tableHeaderSubtitle = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.sm.size,
});

export const tableWrap = (): CSSProperties => ({
  width: "100%",
  overflowX: "auto",
});

export const table = (theme: Theme): CSSProperties => ({
  width: "100%",
  borderCollapse: "collapse",
  fontSize: theme.typography.fontSize.sm.size,
  tableLayout: "fixed",
  minWidth: 980,
});

export const th = (theme: Theme): CSSProperties => ({
  textAlign: "left",
  color: theme.colors.palette.text.secondary,
  fontWeight: theme.typography.fontWeight.semibold,
  paddingTop: theme.spacing[2],
  paddingBottom: theme.spacing[2],
  paddingLeft: theme.spacing[3],
  paddingRight: theme.spacing[3],
  verticalAlign: "top",
});

export const td = (theme: Theme): CSSProperties => ({
  paddingTop: theme.spacing[2],
  paddingBottom: theme.spacing[2],
  paddingLeft: theme.spacing[3],
  paddingRight: theme.spacing[3],
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
  verticalAlign: "top",
});

export const productCell = (): CSSProperties => ({
  display: "grid",
  gap: 8,
  minWidth: 0,
});

export const productTitle = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.base.size,
  fontWeight: theme.typography.fontWeight.semibold,
  lineHeight: 1.35,
  wordBreak: "break-word",
});

export const inlineMeta = (): CSSProperties => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
});

export const inlineMetaPill = (theme: Theme): CSSProperties => ({
  borderRadius: 999,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
  padding: "3px 8px",
});

export const cellTextStrong = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.medium,
  lineHeight: 1.35,
});

export const cellTextMuted = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  lineHeight: 1.35,
});

export const statusPill = (theme: Theme): CSSProperties => ({
  paddingTop: theme.spacing[1],
  paddingBottom: theme.spacing[1],
  paddingLeft: theme.spacing[2],
  paddingRight: theme.spacing[2],
  borderRadius: theme.spacing.md,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  textTransform: "uppercase",
});

export const statusApproved = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.delivered.bg,
  color: theme.colors.palette.status.delivered.text,
});

export const statusPending = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.pending.bg,
  color: theme.colors.palette.status.pending.text,
});

export const statusRejected = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.semantic.error + "22",
  color: theme.colors.palette.semantic.error,
});

export const rowActions = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
});

export const iconButton = (theme: Theme): CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  color: theme.colors.palette.text.secondary,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const dangerButton = (theme: Theme): CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.semantic.error}`,
  color: theme.colors.palette.semantic.error,
  background: "transparent",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const muted = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
});

export const primaryButton = (theme: Theme): CSSProperties => ({
  paddingTop: theme.spacing[2],
  paddingBottom: theme.spacing[2],
  paddingLeft: theme.spacing[4],
  paddingRight: theme.spacing[4],
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.brand.pink[600],
  color: theme.colors.palette.text.primary,
  border: "none",
  fontWeight: theme.typography.fontWeight.semibold,
  cursor: "pointer",
});

export const paginationRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing[3],
  marginTop: theme.spacing.lg,
});

export const modalOverlay = (theme: Theme): CSSProperties => ({
  position: "fixed",
  inset: 0,
  background:
    theme.theme === "dark" ? "rgba(2, 6, 23, 0.72)" : "rgba(2, 6, 23, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: theme.spacing.md,
  paddingRight: theme.spacing.md,
  paddingBottom: theme.spacing.md,
  paddingLeft: theme.spacing.md,
  zIndex: 1100,
});

export const modalCard = (theme: Theme): CSSProperties => ({
  width: "min(620px, 92vw)",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  boxShadow: theme.shadows.lg,
  overflow: "hidden",
  display: "grid",
});

export const formGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing.md,
});

export const formField = (): CSSProperties => ({
  display: "grid",
  gap: 6,
});

export const formFieldFull = (): CSSProperties => ({
  display: "grid",
  gap: 6,
  gridColumn: "1 / -1",
});

export const formLabel = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
});

export const formInput = (theme: Theme): CSSProperties => ({
  width: "100%",
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  padding: "10px 12px",
  outline: "none",
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const formTextarea = (theme: Theme): CSSProperties => ({
  ...formInput(theme),
  minHeight: 120,
  resize: "vertical",
});

export const modalHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: theme.spacing.md,
  paddingBottom: theme.spacing.md,
  paddingLeft: theme.spacing.lg,
  paddingRight: theme.spacing.lg,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
  background:
    "linear-gradient(180deg, rgba(236,72,153,0.14) 0%, rgba(236,72,153,0.02) 100%)",
});

export const modalTitle = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.bold,
});

export const modalBody = (theme: Theme): CSSProperties => ({
  paddingTop: theme.spacing.lg,
  paddingRight: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
  paddingLeft: theme.spacing.lg,
  display: "grid",
  gap: theme.spacing.md,
});

export const modalSection = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing[2],
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  borderRadius: theme.spacing.md,
  paddingTop: theme.spacing.md,
  paddingRight: theme.spacing.md,
  paddingBottom: theme.spacing.md,
  paddingLeft: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
});

export const modalFooter = (theme: Theme): CSSProperties => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing[2],
  paddingTop: theme.spacing.md,
  paddingBottom: theme.spacing.md,
  paddingLeft: theme.spacing.lg,
  paddingRight: theme.spacing.lg,
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
});
