import type { CSSProperties } from "react";
import type { Theme } from "@/theme";
import { getGradients } from "@/theme";

export const card = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  borderRadius: theme.spacing[5],
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  boxShadow: theme.shadows.xl,
  padding: theme.spacing.md,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[4],
  width: "100%",
  maxWidth: "320px",
  height: "100%",
  maxHeight: "640px",
});

export const media = (theme: Theme): CSSProperties => {
  const gradients = getGradients(theme.colors);
  return {
    position: "relative",
    height: "180px",
    borderRadius: theme.spacing.md,
    overflow: "hidden",
    background: gradients.promo,
  };
};

export const mediaImage = (theme: Theme): CSSProperties => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: theme.spacing.md,
});

export const mediaPlaceholder = (theme: Theme): CSSProperties => ({
  width: "100%",
  height: "100%",
  background:
    "linear-gradient(140deg, rgba(168, 85, 247, 0.35) 0%, rgba(236, 72, 153, 0.15) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.colors.palette.text.secondary,
  fontSize: theme.typography.fontSize.sm.size,
  letterSpacing: theme.typography.letterSpacing.wide,
});

export const badge = (theme: Theme): CSSProperties => ({
  position: "absolute",
  top: theme.spacing[3],
  left: theme.spacing[3],
  background: theme.colors.palette.brand.pink[600],
  color: theme.colors.palette.text.primary,
  borderRadius: theme.spacing[2],
  padding: `${theme.spacing[1]} ${theme.spacing.sm}`,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
  letterSpacing: theme.typography.letterSpacing.wider,
});

export const content = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
});

export const title = (theme: Theme): CSSProperties => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const priceRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
});

export const price = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.brand.purple[400],
});

export const comparePrice = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.muted,
  textDecoration: "line-through",
});

export const ratingRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
});

export const ratingStars = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing[1],
});

export const star = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.semantic.warning,
  fontSize: theme.typography.fontSize.sm.size,
});

export const ratingCount = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
});

export const actions = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
});

export const primaryButton = (theme: Theme): CSSProperties => {
  const gradients = getGradients(theme.colors);
  return {
    flex: 1,
    border: "none",
    borderRadius: theme.spacing[2],
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    background: gradients.primary,
    color: theme.colors.palette.text.primary,
    fontSize: theme.typography.fontSize.sm.size,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
  };
};

export const iconButton = (theme: Theme): CSSProperties => ({
  border: "none",
  borderRadius: theme.spacing[2],
  width: "44px",
  height: "40px",
  background: theme.colors.palette.brand.pink[600],
  color: theme.colors.palette.text.primary,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});
