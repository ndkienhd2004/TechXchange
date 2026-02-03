import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing.lg,
});

export const backdrop = (theme: Theme): CSSProperties => ({
  background: `radial-gradient(70% 50% at 50% 0%, ${theme.colors.palette.brand.purple[800]}22 0%, transparent 50%)`,
  width: "100%",
  maxWidth: "440px",
});

export const card = (theme: Theme): CSSProperties => ({
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.dark}`,
  borderRadius: theme.spacing.xl,
  padding: theme.spacing["2xl"],
  boxShadow: theme.shadows["2xl"],
});

export const title = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize["2xl"].size,
  fontWeight: theme.typography.fontWeight.bold,
  margin: `0 0 ${theme.spacing.xl}`,
  textAlign: "center",
});

export const footer = (theme: Theme): CSSProperties => ({
  marginTop: theme.spacing.xl,
  textAlign: "center",
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
});

export const footerLink = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.brand.purple[400],
  textDecoration: "none",
  fontWeight: theme.typography.fontWeight.semibold,
});

export const form = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
});

export const label = (theme: Theme): CSSProperties => ({
  display: "block",
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  color: theme.colors.palette.text.secondary,
  marginBottom: theme.spacing[2],
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
  marginTop: theme.spacing[2],
});

export const error = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.semantic.error,
  margin: 0,
});
