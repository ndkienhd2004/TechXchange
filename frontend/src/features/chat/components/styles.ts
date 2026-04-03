import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100%",
  background: theme.colors.palette.backgrounds.primary,
  padding: theme.spacing.lg,
  color: theme.colors.palette.text.primary,
});

export const unauthenticated = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.lg,
  borderRadius: theme.spacing.md,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.card,
  color: theme.colors.palette.text.secondary,
});

export const layout = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "minmax(260px, 320px) minmax(0, 1fr)",
  gap: theme.spacing.md,
  minHeight: "80vh",
});

export const panel = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.md,
  padding: theme.spacing.md,
  background: theme.colors.palette.backgrounds.card,
});

export const panelTitle = (theme: Theme): CSSProperties => ({
  marginTop: 0,
  marginBottom: theme.spacing.sm,
  fontSize: theme.typography.fontSize.xl.size,
  color: theme.colors.palette.text.primary,
});

export const openChatRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing.sm,
  marginBottom: theme.spacing.md,
});

export const input = (theme: Theme): CSSProperties => ({
  width: "100%",
  borderRadius: theme.spacing.sm,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  fontSize: theme.typography.fontSize.sm.size,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  outline: "none",
});

export const primaryButton = (theme: Theme): CSSProperties => ({
  border: "none",
  borderRadius: theme.spacing.sm,
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  background: theme.colors.palette.brand.purple[600],
  color: "#fff",
  fontWeight: theme.typography.fontWeight.semibold,
  cursor: "pointer",
});

export const conversationList = (theme: Theme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.sm,
});

export const conversationButton = (theme: Theme): CSSProperties => ({
  textAlign: "left",
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.sm,
  padding: theme.spacing[3],
  background: theme.colors.palette.backgrounds.secondary,
  color: theme.colors.palette.text.primary,
  cursor: "pointer",
});

export const conversationButtonActive = (theme: Theme): CSSProperties => ({
  ...conversationButton(theme),
  border: `1px solid ${theme.colors.palette.brand.purple[500]}`,
  background: `${theme.colors.palette.brand.purple[700]}22`,
});

export const conversationName = (theme: Theme): CSSProperties => ({
  fontWeight: theme.typography.fontWeight.bold,
});

export const conversationPreview = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  color: theme.colors.palette.text.secondary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const unreadText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.semantic.error,
  fontSize: theme.typography.fontSize.xs.size,
});

export const messageBox = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.sm,
  padding: theme.spacing[3],
  minHeight: "420px",
  maxHeight: "420px",
  overflowY: "auto",
  background: theme.colors.palette.backgrounds.secondary,
});

export const loadingText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.secondary,
});

export const messageRowMine = (): CSSProperties => ({
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: "8px",
});

export const messageRowOther = (): CSSProperties => ({
  display: "flex",
  justifyContent: "flex-start",
  marginBottom: "8px",
});

export const messageBubbleMine = (theme: Theme): CSSProperties => ({
  maxWidth: "70%",
  background: `${theme.colors.palette.brand.purple[700]}22`,
  border: `1px solid ${theme.colors.palette.brand.purple[500]}`,
  borderRadius: theme.spacing.sm,
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  color: theme.colors.palette.text.primary,
});

export const messageBubbleOther = (theme: Theme): CSSProperties => ({
  maxWidth: "70%",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: theme.spacing.sm,
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  color: theme.colors.palette.text.primary,
});

export const messageMeta = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  marginTop: theme.spacing[1],
});

export const composerRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  gap: theme.spacing.sm,
  marginTop: theme.spacing.md,
});
