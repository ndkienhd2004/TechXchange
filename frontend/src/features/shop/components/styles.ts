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
  padding: theme.spacing.lg,
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

export const shopCard = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.spacing.lg,
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
});

export const shopAvatar = (theme: Theme): CSSProperties => ({
  width: theme.spacing["2xl"],
  height: theme.spacing["2xl"],
  borderRadius: theme.spacing.lg,
  background: theme.colors.palette.brand.purple[600],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.fontSize.lg.size,
});

export const shopName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
  fontSize: theme.typography.fontSize.sm.size,
});

export const shopSubtitle = (theme: Theme): CSSProperties => ({
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
  padding: `${theme.spacing[3]} ${theme.spacing.md}`,
  borderRadius: theme.spacing.md,
  transition: "background 0.2s ease, color 0.2s ease",
});

export const navItemActive = (theme: Theme): CSSProperties => ({
  ...navItem(theme),
  background: theme.colors.palette.brand.purple[600],
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const content = (theme: Theme): CSSProperties => ({
  padding: theme.spacing["2xl"],
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
  padding: theme.spacing.lg,
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

export const filterRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing[2],
  marginBottom: theme.spacing.lg,
});

export const filterButton = (theme: Theme): CSSProperties => ({
  border: "none",
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.secondary,
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  cursor: "pointer",
});

export const filterButtonActive = (theme: Theme): CSSProperties => ({
  ...filterButton(theme),
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const trend = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  marginTop: theme.spacing[1],
});

export const trendUp = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.semantic.success,
});

export const trendDown = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.semantic.error,
});

export const trendFlat = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
});

export const analyticsGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.xl,
});

export const chartPlaceholder = (theme: Theme): CSSProperties => ({
  height: "260px",
  borderRadius: theme.spacing.md,
  border: `1px dashed ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
});

export const chartBox = (theme: Theme): CSSProperties => ({
  height: "260px",
  width: "100%",
});

export const topList = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.md,
});

export const topItem = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const topRank = (theme: Theme): CSSProperties => ({
  width: theme.spacing.xl,
  height: theme.spacing.xl,
  borderRadius: "50%",
  background: theme.colors.palette.brand.purple[600],
  color: theme.colors.palette.text.primary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: theme.typography.fontWeight.semibold,
});

export const topInfo = (theme: Theme): CSSProperties => ({
  flex: 1,
});

export const topName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
});

export const actionGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.xl,
});

export const actionCard = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  padding: theme.spacing.lg,
  borderRadius: theme.spacing.lg,
  color: theme.colors.palette.text.primary,
  textDecoration: "none",
  fontWeight: theme.typography.fontWeight.semibold,
});

export const actionPurple = (theme: Theme): CSSProperties => ({
  background: `linear-gradient(135deg, ${theme.colors.palette.brand.purple[600]} 0%, ${theme.colors.palette.brand.purple[700]} 100%)`,
});

export const actionBlue = (theme: Theme): CSSProperties => ({
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
});

export const actionGreen = (theme: Theme): CSSProperties => ({
  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
});

export const card = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  padding: theme.spacing.lg,
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
  color: theme.colors.palette.brand.purple[400],
  textDecoration: "none",
  fontSize: theme.typography.fontSize.sm.size,
});

export const orderList = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.md,
});

export const orderItem = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "48px 1fr auto auto",
  gap: theme.spacing.md,
  alignItems: "center",
  padding: theme.spacing.md,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const orderThumb = (theme: Theme): CSSProperties => ({
  width: "48px",
  height: "48px",
  flexShrink: 0,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.hover,
  aspectRatio: "1 / 1",
  objectFit: "cover",
});

export const orderName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
  fontSize: theme.typography.fontSize.sm.size,
  display: "-webkit-box",
  WebkitLineClamp: 5,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-word",
  lineHeight: "1.4",
});

export const orderMeta = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.xs.size,
  marginTop: theme.spacing[1],
});

export const statusPill = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  borderRadius: theme.spacing.md,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  textTransform: "uppercase",
});

export const statusConfirmed = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.confirmed.bg,
  color: theme.colors.palette.status.confirmed.text,
});

export const statusShipping = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.shipping.bg,
  color: theme.colors.palette.status.shipping.text,
});

export const statusDelivered = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.status.delivered.bg,
  color: theme.colors.palette.status.delivered.text,
});

export const tableCard = (theme: Theme): CSSProperties => ({
  ...card(theme),
  padding: theme.spacing.lg,
});

export const tableHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.md,
});

export const search = (theme: Theme): CSSProperties => ({
  width: "320px",
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  outline: "none",
});

export const ordersToolbar = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
});

export const searchWrap = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  minWidth: "360px",
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
  padding: theme.spacing[2],
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
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  borderRadius: theme.spacing.md,
});

export const tabButtonActive = (theme: Theme): CSSProperties => ({
  ...tabButton(theme),
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const primaryButton = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.brand.purple[600],
  color: theme.colors.palette.text.primary,
  border: "none",
  fontWeight: theme.typography.fontWeight.semibold,
  cursor: "pointer",
});

export const paginationRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: theme.spacing.lg,
  paddingTop: theme.spacing.lg,
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const paginationInfo = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
});

export const paginationButtons = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
});

export const pageButton = (theme: Theme): CSSProperties => ({
  minWidth: 36,
  height: 36,
  padding: `0 ${theme.spacing[2]}`,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  cursor: "pointer",
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const pageButtonActive = (theme: Theme): CSSProperties => ({
  ...pageButton(theme),
  background: theme.colors.palette.brand.purple[600],
  borderColor: theme.colors.palette.brand.purple[600],
  color: theme.colors.palette.text.primary,
});

export const pageButtonDisabled = (theme: Theme): CSSProperties => ({
  ...pageButton(theme),
  opacity: 0.5,
  cursor: "not-allowed",
});

export const formCard = (theme: Theme): CSSProperties => ({
  ...card(theme),
  marginBottom: theme.spacing.xl,
});

export const formGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: theme.spacing.lg,
});

export const formField = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
});

export const formFieldFull = (theme: Theme): CSSProperties => ({
  gridColumn: "1 / -1",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
});

export const formLabel = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
});

export const formInput = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
});

export const formTextarea = (theme: Theme): CSSProperties => ({
  ...formInput(theme),
  minHeight: "120px",
  resize: "vertical",
});

export const formActions = (theme: Theme): CSSProperties => ({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: theme.spacing.lg,
});

export const table = (theme: Theme): CSSProperties => ({
  width: "100%",
  borderCollapse: "collapse",
  fontSize: theme.typography.fontSize.sm.size,
});

export const th = (theme: Theme): CSSProperties => ({
  textAlign: "left",
  color: theme.colors.palette.text.secondary,
  fontWeight: theme.typography.fontWeight.semibold,
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
});

export const td = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const price = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const muted = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
});

export const rowActions = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
});

export const iconButton = (theme: Theme): CSSProperties => ({
  background: "transparent",
  border: "none",
  color: theme.colors.palette.text.secondary,
  cursor: "pointer",
});

export const shipButton = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  border: "none",
  background: theme.colors.palette.brand.purple[600],
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  cursor: "pointer",
});

export const modalOverlay = (theme: Theme): CSSProperties => ({
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: theme.spacing.md,
});

export const modalCard = (theme: Theme): CSSProperties => ({
  width: "min(720px, 92vw)",
  maxHeight: "85vh",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.lg,
  display: "flex",
  flexDirection: "column",
  boxShadow: theme.shadows.lg,
  overflow: "hidden",
});

export const modalHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.lg,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const modalTitle = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const modalClose = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: theme.colors.palette.text.secondary,
  cursor: "pointer",
  fontSize: theme.typography.fontSize.sm.size,
});

export const modalTabs = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing.md,
  padding: `${theme.spacing.md} ${theme.spacing.lg} 0`,
});

export const modalTab = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.secondary,
  padding: theme.spacing.md,
  borderRadius: theme.spacing.md,
  cursor: "pointer",
  textAlign: "center",
});

export const modalTabActive = (theme: Theme): CSSProperties => ({
  ...modalTab(theme),
  border: `1px solid ${theme.colors.palette.brand.purple[500]}`,
  color: theme.colors.palette.text.primary,
  background: "rgba(168, 85, 247, 0.12)",
  fontWeight: theme.typography.fontWeight.semibold,
});

export const modalBody = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.lg,
  overflowY: "auto",
  display: "grid",
  gap: theme.spacing.md,
  flex: 1,
});

export const modalHint = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
});

export const modalList = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing.md,
  width: "100%",
});

export const modalProductContainer = (theme: Theme): CSSProperties => ({
  borderRadius: "12px",
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  background: theme.colors.palette.backgrounds.secondary,
  overflow: "hidden",
  transition: "all 0.2s ease",
});

export const modalProductContainerSelected = (theme: Theme): CSSProperties => ({
  ...modalProductContainer(theme),
  borderColor: theme.colors.palette.brand.purple[500],
});

export const modalProductExpanded = (theme: Theme): CSSProperties => ({
  padding: "0 16px 16px",
  display: "flex",
  gap: theme.spacing.md,
  background: theme.colors.palette.backgrounds.secondary,
  boxSizing: "border-box",
  width: "100%",
});

export const modalProductField = (theme: Theme): CSSProperties => ({
  flex: 1,
});

export const modalProductSmallLabel = (theme: Theme): CSSProperties => ({
  fontSize: "12px",
  color: theme.colors.palette.text.secondary,
  marginBottom: theme.spacing[2],
  display: "block",
});

export const modalFooter = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.lg,
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
  display: "flex",
  justifyContent: "flex-end",
  background: theme.colors.palette.backgrounds.secondary,
});

export const modalActions = (theme: Theme): CSSProperties => ({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: theme.spacing.md,
});

export const modalForm = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing.md,
});

export const modalLabel = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing[2],
  color: theme.colors.palette.text.secondary,
});

export const modalInput = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.md,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  outline: "none",
});

export const modalInputFull = (theme: Theme): CSSProperties => ({
  ...modalInput(theme),
  width: "100%",
  boxSizing: "border-box",
});

export const modalLink = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: theme.colors.palette.brand.purple[400],
  cursor: "pointer",
  textAlign: "left",
});

export const modalSearchRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing.md,
});

export const modalProductRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "24px 48px 1fr 100px",
  gap: theme.spacing.md,
  alignItems: "center",
  padding: theme.spacing.md,
  background: "transparent",
  cursor: "pointer",
  boxSizing: "border-box",
  width: "100%",
});

export const modalProductThumb = (theme: Theme): CSSProperties => ({
  width: "48px",
  height: "48px",
  flexShrink: 0,
  borderRadius: theme.spacing.sm,
  background: theme.colors.palette.backgrounds.hover,
  aspectRatio: "1 / 1",
  objectFit: "cover",
});

export const modalProductInfo = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing[1],
  overflow: "hidden",
  minWidth: 0,
});

export const modalProductName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.semibold,
  fontSize: theme.typography.fontSize.sm.size,
  display: "-webkit-box",
  WebkitLineClamp: 5,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-word",
  lineHeight: "1.4",
});

export const modalProductMeta = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
});

export const modalProductPrice = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
  fontWeight: theme.typography.fontWeight.semibold,
  textAlign: "right",
});

export const modalTextarea = (theme: Theme): CSSProperties => ({
  ...modalInput(theme),
  minHeight: "120px",
  resize: "vertical",
});
