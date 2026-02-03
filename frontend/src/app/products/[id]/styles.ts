import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100%",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
});

export const backdrop = (theme: Theme): CSSProperties => ({
  background: `radial-gradient(70% 50% at 10% 10%, ${theme.colors.palette.brand.purple[800]}22 0%, transparent 60%)`,
  padding: `${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing["3xl"]}`,
});

export const shell = (theme: Theme): CSSProperties => ({
  maxWidth: "1200px",
  margin: "0 auto",
});

export const breadcrumb = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.muted,
  marginBottom: theme.spacing.xl,
});

export const breadcrumbLink = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  textDecoration: "none",
});

export const mainRow = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing["2xl"],
  alignItems: "start",
  marginBottom: theme.spacing["2xl"],
});

export const galleryWrap = (theme: Theme): CSSProperties => ({
  position: "relative",
  display: "flex",
  gap: theme.spacing[4],
});

export const thumbnails = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
});

export const thumbnail = (theme: Theme): CSSProperties => ({
  width: "72px",
  height: "72px",
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.card,
  border: `2px solid ${theme.colors.palette.borders.default}`,
  cursor: "pointer",
  overflow: "hidden",
});

export const mainImage = (theme: Theme): CSSProperties => ({
  flex: 1,
  minHeight: "400px",
  borderRadius: theme.spacing.lg,
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
});

export const galleryNav = (theme: Theme): CSSProperties => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "rgba(0,0,0,0.5)",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1,
});

export const infoColumn = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
});

export const productTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  margin: 0,
  lineHeight: 1.3,
});

export const ratingRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
});

export const priceRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[3],
  flexWrap: "wrap",
});

export const price = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.brand.purple[400],
});

export const comparePrice = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.lg.size,
  color: theme.colors.palette.text.muted,
  textDecoration: "line-through",
});

export const discountBadge = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.brand.pink[600],
  color: "#fff",
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  borderRadius: theme.spacing[2],
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const description = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
  lineHeight: 1.6,
  margin: 0,
});

export const fieldRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[3],
  flexWrap: "wrap",
});

export const fieldLabel = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  color: theme.colors.palette.text.secondary,
  minWidth: "80px",
});

export const select = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
  outline: "none",
});

export const quantityWrap = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 0,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  overflow: "hidden",
});

export const quantityBtn = (theme: Theme): CSSProperties => ({
  width: "40px",
  height: "40px",
  background: theme.colors.palette.backgrounds.card,
  border: "none",
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.lg.size,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const quantityInput = (theme: Theme): CSSProperties => ({
  width: "48px",
  height: "40px",
  border: "none",
  borderLeft: `1px solid ${theme.colors.palette.borders.default}`,
  borderRight: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  textAlign: "center",
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  outline: "none",
});

export const quantityNote = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  marginLeft: theme.spacing[2],
});

export const buttonRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing[3],
  flexWrap: "wrap",
});

export const primaryButton = (theme: Theme): CSSProperties => ({
  flex: 1,
  minWidth: "160px",
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  background: theme.colors.palette.brand.purple[600],
  border: "none",
  borderRadius: theme.spacing.md,
  color: "#fff",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing[2],
});

export const secondaryButton = (theme: Theme): CSSProperties => ({
  flex: 1,
  minWidth: "160px",
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  background: theme.colors.palette.brand.pink[600],
  border: "none",
  borderRadius: theme.spacing.md,
  color: "#fff",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing[2],
});

export const policyList = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const policyItem = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
});

export const shopCard = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.lg,
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  borderRadius: theme.spacing.lg,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.lg,
  flexWrap: "wrap",
});

export const shopInfo = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[3],
});

export const shopAvatar = (theme: Theme): CSSProperties => ({
  width: "48px",
  height: "48px",
  borderRadius: theme.spacing.md,
  background: theme.colors.palette.backgrounds.hover,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.fontSize.xl.size,
});

export const shopName = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.semibold,
  margin: 0,
});

export const shopMeta = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
  margin: 0,
});

export const shopButtons = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing[2],
});

export const outlineButton = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  background: "transparent",
  border: `1px solid ${theme.colors.palette.brand.purple[500]}`,
  borderRadius: theme.spacing.md,
  color: theme.colors.palette.brand.purple[400],
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  cursor: "pointer",
});

export const tabs = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: 0,
  borderBottom: `1px solid ${theme.colors.palette.borders.default}`,
  marginBottom: theme.spacing.xl,
});

export const tab = (theme: Theme): CSSProperties => ({
  padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
  background: "none",
  border: "none",
  borderBottom: `2px solid transparent`,
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  cursor: "pointer",
  marginBottom: "-1px",
});

export const tabActive = (theme: Theme): CSSProperties => ({
  ...tab(theme),
  color: theme.colors.palette.brand.purple[400],
  borderBottomColor: theme.colors.palette.brand.purple[500],
});

export const tabContent = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
  lineHeight: 1.7,
  margin: 0,
});

export const sectionTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  margin: `0 0 ${theme.spacing.xl}`,
});

export const recommendedGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: theme.spacing.lg,
});

export const reviewsList = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.xl,
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const reviewCard = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.lg,
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  borderRadius: theme.spacing.lg,
});

export const reviewHeader = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[3],
  marginBottom: theme.spacing[3],
});

export const reviewAvatar = (theme: Theme): CSSProperties => ({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: theme.colors.palette.brand.purple[600],
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const reviewMeta = (theme: Theme): CSSProperties => ({
  flex: 1,
});

export const reviewAuthor = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
  margin: "0 0 2px",
});

export const reviewDate = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  margin: 0,
});

export const reviewBody = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
  lineHeight: 1.6,
  margin: 0,
});
