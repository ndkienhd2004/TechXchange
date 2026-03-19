import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

const fs = (theme: Theme, key: keyof Theme["typography"]["fontSize"]) =>
  theme.typography?.fontSize?.[key]?.size || "1rem";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  padding: theme.spacing.xl,
});

export const container = (): CSSProperties => ({
  maxWidth: "980px",
  margin: "0 auto",
});

export const section = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  borderRadius: theme.spacing.xl,
  padding: theme.spacing[6],
  marginBottom: theme.spacing.xl,
  boxShadow: theme.shadows.lg,
});

export const sectionTitle = (theme: Theme): CSSProperties => ({
  fontSize: fs(theme, "xl"),
  fontWeight: theme.typography.fontWeight.semibold,
  margin: 0,
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
  fontSize: fs(theme, "2xl"),
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.text.primary,
  flexShrink: 0,
});

export const summaryAvatarImg = (): CSSProperties => ({
  width: 80,
  height: 80,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
});

export const avatarButton = (): CSSProperties => ({
  border: "none",
  padding: 0,
  background: "transparent",
  cursor: "pointer",
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const avatarChangeBadge = (theme: Theme): CSSProperties => ({
  position: "absolute",
  bottom: -8,
  left: "50%",
  transform: "translateX(-50%)",
  borderRadius: "999px",
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.secondary,
  fontSize: fs(theme, "xs"),
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  whiteSpace: "nowrap",
});

export const hiddenFileInput = (): CSSProperties => ({
  display: "none",
});

export const summaryInfo = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
  minWidth: 0,
});

export const summaryName = (theme: Theme): CSSProperties => ({
  fontSize: fs(theme, "xl"),
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.palette.text.primary,
  margin: 0,
});

export const summaryEmail = (theme: Theme): CSSProperties => ({
  fontSize: fs(theme, "sm"),
  color: theme.colors.palette.text.secondary,
  margin: 0,
});

export const summaryStats = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing[6],
  flexWrap: "wrap",
});

export const summaryStat = (theme: Theme): CSSProperties => ({
  fontSize: fs(theme, "sm"),
  color: theme.colors.palette.text.secondary,
});

export const button = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  background: `linear-gradient(130deg, ${theme.colors.palette.brand.purple[600]} 0%, ${theme.colors.palette.brand.pink[600]} 100%)`,
  border: "none",
  borderRadius: theme.spacing.md,
  color: theme.colors.palette.text.primary,
  fontSize: fs(theme, "sm"),
  fontWeight: theme.typography.fontWeight.semibold,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
  alignSelf: "flex-start",
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing[2],
});

export const summaryButton = (theme: Theme): CSSProperties => ({
  ...button(theme),
  textDecoration: "none",
  flexShrink: 0,
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
  fontSize: fs(theme, "sm"),
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.palette.text.primary,
});

export const actionSub = (theme: Theme): CSSProperties => ({
  fontSize: fs(theme, "xs"),
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
  fontSize: fs(theme, "sm"),
  fontWeight: theme.typography.fontWeight.medium,
  color: theme.colors.palette.text.secondary,
  background: "none",
  border: "none",
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

export const addressSectionHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.lg,
  flexWrap: "wrap",
});

export const addAddressButton = (theme: Theme): CSSProperties => ({
  ...button(theme),
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
});

export const addressPanel = (theme: Theme): CSSProperties => ({
  borderTop: `1px solid ${theme.colors.palette.borders.default}`,
});

export const addressRow = (theme: Theme): CSSProperties => ({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: theme.spacing.lg,
  padding: `${theme.spacing.lg} 0`,
});

export const addressMain = (): CSSProperties => ({
  display: "grid",
  gap: 6,
});

export const addressNameLine = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  flexWrap: "wrap",
});

export const addressName = (theme: Theme): CSSProperties => ({
  fontSize: fs(theme, "lg"),
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.palette.text.primary,
});

export const addressPhone = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: fs(theme, "lg"),
});

export const addressText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: fs(theme, "base"),
  lineHeight: 1.45,
});

export const defaultBadge = (theme: Theme): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  border: `1px solid ${theme.colors.palette.brand.pink[500]}`,
  color: theme.colors.palette.brand.pink[500],
  borderRadius: theme.spacing.sm,
  width: "fit-content",
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  fontSize: fs(theme, "xs"),
  fontWeight: theme.typography.fontWeight.medium,
});

export const addressActionCol = (theme: Theme): CSSProperties => ({
  display: "grid",
  alignContent: "start",
  justifyItems: "end",
  gap: theme.spacing[3],
});

export const addressLinkActions = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
});

export const linkActionButton = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: theme.colors.palette.brand.purple[300],
  cursor: "pointer",
  fontSize: fs(theme, "base"),
  padding: 0,
});

export const ghostButton = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: "transparent",
  color: theme.colors.palette.text.secondary,
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing.sm,
  cursor: "pointer",
  fontSize: fs(theme, "sm"),
});

export const addressDivider = (theme: Theme): CSSProperties => ({
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 1,
  background: theme.colors.palette.borders.default,
});

export const modalOverlay = (theme: Theme): CSSProperties => ({
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.55)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
  padding: theme.spacing.lg,
});

export const modalCard = (theme: Theme): CSSProperties => ({
  width: "min(720px, 100%)",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.xl,
  padding: theme.spacing.lg,
  boxShadow: theme.shadows.xl,
});

export const modalHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.md,
});

export const modalTitle = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: fs(theme, "lg"),
  fontWeight: theme.typography.fontWeight.semibold,
});

export const modalCloseButton = (theme: Theme): CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: theme.spacing.sm,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: "transparent",
  color: theme.colors.palette.text.secondary,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
});

export const addressFormGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.lg,
});

export const input = (theme: Theme): CSSProperties => ({
  width: "100%",
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const checkboxRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  color: theme.colors.palette.text.secondary,
  fontSize: fs(theme, "sm"),
});

export const modalActions = (theme: Theme): CSSProperties => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing[2],
});
