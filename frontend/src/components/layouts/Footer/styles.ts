import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const footer = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.secondary,
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  marginTop: "auto",
});

export const topSection = (theme: Theme): CSSProperties => ({
  maxWidth: "1400px",
  margin: "0 auto",
  padding: `${theme.spacing["2xl"]} ${theme.spacing.lg} ${theme.spacing.xl}`,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: theme.spacing["2xl"],
});

export const column = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[4],
});

export const columnTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.bold,
  letterSpacing: theme.typography.letterSpacing.widest,
  textTransform: "uppercase",
  color: theme.colors.palette.text.primary,
  margin: 0,
});

export const linkList = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
  listStyle: "none",
  margin: 0,
  padding: 0,
});

export const link = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  textDecoration: "none",
  fontSize: theme.typography.fontSize.sm.size,
  transition: "color 0.2s ease",
});

export const linkHover = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
});

export const contactText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
  margin: 0,
  lineHeight: 1.6,
});

export const socialRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[3],
  marginTop: theme.spacing[2],
});

export const socialLink = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color 0.2s ease",
});

export const newsletterText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
  margin: `0 0 ${theme.spacing[3]}`,
  lineHeight: 1.5,
});

export const newsletterForm = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: 0,
  borderRadius: theme.spacing[2],
  overflow: "hidden",
  border: `1px solid ${theme.colors.palette.borders.default}`,
});

export const newsletterInput = (theme: Theme): CSSProperties => ({
  flex: 1,
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  background: theme.colors.palette.backgrounds.card,
  border: "none",
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  outline: "none",
  minWidth: 0,
});

export const newsletterButton = (theme: Theme): CSSProperties => ({
  padding: theme.spacing[3],
  background: theme.colors.palette.brand.purple[600],
  border: "none",
  color: theme.colors.palette.text.primary,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s ease",
});

export const bottomSection = (theme: Theme): CSSProperties => ({
  maxWidth: "1400px",
  margin: "0 auto",
  padding: `${theme.spacing.xl} ${theme.spacing.lg}`,
  borderTop: `1px solid ${theme.colors.palette.borders.dark}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.lg,
  flexWrap: "wrap",
});

export const copyright = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.sm.size,
  margin: 0,
});

export const paymentRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[4],
});

export const paymentBadge = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  letterSpacing: theme.typography.letterSpacing.wider,
  color: theme.colors.palette.text.muted,
});

export const chatButton = (theme: Theme): CSSProperties => ({
  position: "fixed",
  bottom: theme.spacing.xl,
  right: theme.spacing.xl,
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: `linear-gradient(130deg, ${theme.colors.palette.brand.purple[600]} 0%, ${theme.colors.palette.brand.pink[600]} 100%)`,
  border: "none",
  color: theme.colors.palette.text.primary,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: theme.shadows.lg,
  zIndex: 999,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
});
