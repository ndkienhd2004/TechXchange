import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const header = (theme: Theme): CSSProperties => ({
  position: "sticky",
  top: 0,
  zIndex: 1000,
  background: theme.colors.palette.backgrounds.secondary,
  borderBottom: `1px solid ${theme.colors.palette.borders.dark}`,
  boxShadow: theme.shadows.md,
});

export const topBar = (theme: Theme): CSSProperties => ({
  maxWidth: "1400px",
  margin: "0 auto",
  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.lg,
});

export const logo = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.bold,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const logoText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.primary,
});

export const logoAccent = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[500],
});

export const searchContainer = (theme: Theme): CSSProperties => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: 0,
  background: theme.colors.palette.backgrounds.card,
  borderRadius: theme.spacing[2],
  border: `1px solid ${theme.colors.palette.borders.default}`,
  overflow: "hidden",
  boxShadow: theme.shadows.sm,
});

export const categorySelect = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing.md}`,
  background: "transparent",
  border: "none",
  borderRight: `1px solid ${theme.colors.palette.borders.default}`,
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
  outline: "none",
  minWidth: "160px",
});

export const searchInput = (theme: Theme): CSSProperties => ({
  flex: 1,
  padding: `${theme.spacing[2]} ${theme.spacing.md}`,
  background: "transparent",
  border: "none",
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  outline: "none",
});

export const searchButton = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.md,
  background: theme.colors.palette.brand.purple[500],
  border: "none",
  color: theme.colors.palette.text.primary,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s ease",
});

export const searchButtonHover = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.brand.purple[600],
});

export const actions = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
});

export const cartButton = (theme: Theme): CSSProperties => ({
  position: "relative",
  background: "transparent",
  border: "none",
  color: theme.colors.palette.text.primary,
  cursor: "pointer",
  padding: theme.spacing[2],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.spacing[2],
  transition: "background 0.2s ease",
});

export const cartButtonHover = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.hover,
});

export const cartBadge = (theme: Theme): CSSProperties => ({
  position: "absolute",
  top: 0,
  right: 0,
  background: theme.colors.palette.brand.purple[500],
  color: theme.colors.palette.text.primary,
  borderRadius: "50%",
  width: theme.spacing[5],
  height: theme.spacing[5],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  boxShadow: theme.shadows.sm,
});

export const userInfo = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  color: theme.colors.palette.text.primary,
  textDecoration: "none",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing[2],
  transition: "background 0.2s ease",
});

export const userInfoHover = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.hover,
});

export const userMenuButton = (theme: Theme): CSSProperties => ({
  ...userInfo(theme),
  color: theme.colors.palette.text.secondary,
  background: "transparent",
  border: "none",
});

export const userMenuButtonHover = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.hover,
  color: theme.colors.palette.text.primary,
});

export const userMenuWrap = (theme: Theme): CSSProperties => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const userMenu = (theme: Theme): CSSProperties => ({
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  minWidth: "200px",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing[2],
  boxShadow: theme.shadows.lg,
  padding: theme.spacing[2],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[1],
  zIndex: 200,
});

export const userMenuItem = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  color: theme.colors.palette.text.primary,
  textDecoration: "none",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing[2],
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.2s ease",
});

export const userMenuItemDanger = (theme: Theme): CSSProperties => ({
  ...userMenuItem(theme),
  color: theme.colors.palette.semantic.error,
});

export const nav = (theme: Theme): CSSProperties => ({
  maxWidth: "1400px",
  margin: "0 auto",
  padding: `${theme.spacing[3]} ${theme.spacing.lg}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[8],
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
});

export const navLink = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  textDecoration: "none",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  letterSpacing: theme.typography.letterSpacing.normal,
  transition: "color 0.2s ease",
  cursor: "pointer",
  padding: `${theme.spacing[2]} 0`,
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[1],
});

export const navLinkActive = (theme: Theme): CSSProperties => ({
  ...navLink(theme),
  color: theme.colors.palette.brand.purple[500],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const navLinkHover = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
});

/** Button reset so it looks like navLink (same as Trang chủ, Sản phẩm, ...) */
export const navLinkButton = (theme: Theme): CSSProperties => ({
  ...navLink(theme),
  background: "none",
  border: "none",
  outline: "none",
  font: "inherit",
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature matches other style fns
export const navDropdownWrap = (theme: Theme): CSSProperties => ({
  position: "relative",
  display: "inline-flex",
});

export const navDropdownMenu = (theme: Theme): CSSProperties => ({
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: theme.spacing[1],
  minWidth: "180px",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing[2],
  boxShadow: theme.shadows.lg,
  padding: theme.spacing[2],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[1],
  zIndex: 100,
});

export const navDropdownItem = (theme: Theme): CSSProperties => ({
  ...navLink(theme),
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing[2],
  display: "block",
});

export const navDropdownItemHover = (theme: Theme): CSSProperties => ({
  ...navLinkHover(theme),
  background: theme.colors.palette.backgrounds.hover,
});

export const brandsBar = (theme: Theme): CSSProperties => ({
  maxWidth: "1400px",
  margin: "0 auto",
  padding: `${theme.spacing[3]} ${theme.spacing.lg}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[8],
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
  overflowX: "auto",
  scrollbarWidth: "thin",
});

export const brandLogo = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  textDecoration: "none",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  letterSpacing: theme.typography.letterSpacing.wide,
  transition: "color 0.2s ease",
  cursor: "pointer",
  whiteSpace: "nowrap",
});

export const brandLogoHover = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
});
