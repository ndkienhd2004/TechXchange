import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const container = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing[2],
  flexWrap: "wrap",
  marginTop: theme.spacing["2xl"],
});

export const pageButton = (theme: Theme): CSSProperties => ({
  minWidth: "40px",
  height: "40px",
  padding: `0 ${theme.spacing[3]}`,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  cursor: "pointer",
});

export const pageButtonActive = (theme: Theme): CSSProperties => ({
  ...pageButton(theme),
  background: theme.colors.palette.brand.purple[600],
  borderColor: theme.colors.palette.brand.purple[600],
  color: "#fff",
});

export const pageButtonDisabled = (theme: Theme): CSSProperties => ({
  ...pageButton(theme),
  opacity: 0.5,
  cursor: "not-allowed",
});

export const ellipsis = (theme: Theme): CSSProperties => ({
  minWidth: "40px",
  height: "40px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.sm.size,
});
