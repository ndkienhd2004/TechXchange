import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

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

export const form = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
});

export const row = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: theme.spacing.lg,
});

export const field = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing[2],
});

export const label = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  color: theme.colors.palette.text.secondary,
});

export const input = (theme: Theme): CSSProperties => ({
  width: "100%",
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  background: theme.colors.palette.backgrounds.secondary,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  boxSizing: "border-box",
});

export const inputReadOnly = (theme: Theme): CSSProperties => ({
  ...input(theme),
  opacity: 0.85,
  cursor: "not-allowed",
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

export const buttonDisabled = (theme: Theme): CSSProperties => ({
  opacity: 0.6,
  cursor: "not-allowed",
});

export const error = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.semantic.error,
  margin: 0,
});

export const avatarPreview = (theme: Theme): CSSProperties => ({
  width: 64,
  height: 64,
  borderRadius: "50%",
  objectFit: "cover",
  background: theme.colors.palette.backgrounds.secondary,
  border: `2px solid ${theme.colors.palette.borders.default}`,
});
