import type { CSSProperties } from "react";
import { getGradients, type Theme } from "@/theme";

export const floatingButton = (theme: Theme): CSSProperties => {
  const gradients = getGradients(theme.colors);

  return {
    position: "fixed",
    right: 24,
    bottom: 24,
    width: 62,
    height: 62,
    borderRadius: "50%",
    border: "none",
    background: gradients.primary,
    color: "#fff",
    boxShadow: theme.shadows.xl,
    cursor: "pointer",
    zIndex: 1600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
};

export const unreadBadge = (theme: Theme): CSSProperties => ({
  position: "absolute",
  top: -4,
  right: -4,
  minWidth: 20,
  height: 20,
  borderRadius: 10,
  background: theme.colors.palette.semantic.error,
  color: "#fff",
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.bold,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 5px",
});

export const modal = (theme: Theme): CSSProperties => ({
  position: "fixed",
  right: 24,
  bottom: 92,
  width: "min(760px, calc(100vw - 32px))",
  height: "min(70vh, 560px)",
  background: theme.colors.palette.backgrounds.card,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  borderRadius: 20,
  boxShadow:
    theme.theme === "dark"
      ? "0 34px 90px rgba(0,0,0,0.5)"
      : "0 24px 64px rgba(15,23,42,0.18)",
  zIndex: 1601,
  display: "grid",
  gridTemplateColumns: "240px 1fr",
  overflow: "hidden",
  color: theme.colors.palette.text.primary,
});

export const sidebar = (theme: Theme): CSSProperties => ({
  borderRight: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
});

export const sidebarHeader = (theme: Theme): CSSProperties => ({
  padding: "14px 16px",
  borderBottom: `1px solid ${theme.colors.palette.borders.default}`,
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.bold,
});

export const aiItem = (theme: Theme, active: boolean): CSSProperties => ({
  width: "100%",
  border: "none",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  background:
    active
      ? theme.theme === "dark"
        ? "rgba(124,58,237,0.25)"
        : "rgba(168,85,247,0.14)"
      : "transparent",
  borderLeft: active
    ? `4px solid ${theme.colors.palette.brand.purple[500]}`
    : "4px solid transparent",
  cursor: "pointer",
  color: theme.colors.palette.text.primary,
});

export const botAvatar = (theme: Theme): CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: `linear-gradient(140deg, ${theme.colors.palette.brand.purple[600]} 0%, ${theme.colors.palette.brand.pink[600]} 100%)`,
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const aiTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.bold,
  lineHeight: 1.2,
  color: theme.colors.palette.text.primary,
});

export const aiSubtitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  lineHeight: 1.25,
});

export const sectionLabel = (theme: Theme): CSSProperties => ({
  padding: "8px 16px",
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const sectionHeaderRow = (): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  paddingRight: 12,
});

export const assistantNewChatButton = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.brand.purple[400]}`,
  background: "transparent",
  color: theme.colors.palette.brand.purple[500],
  borderRadius: 999,
  padding: "4px 10px",
  cursor: "pointer",
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const conversationList = (): CSSProperties => ({
  minHeight: 0,
  overflowY: "auto",
  flex: 1,
});

export const conversationItem = (theme: Theme, active: boolean): CSSProperties => ({
  width: "100%",
  border: "none",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  borderTop: `1px solid ${theme.colors.palette.borders.default}`,
  cursor: "pointer",
  background:
    active
      ? theme.theme === "dark"
        ? "rgba(59,130,246,0.12)"
        : "rgba(59,130,246,0.08)"
      : "transparent",
  color: theme.colors.palette.text.primary,
});

export const conversationAvatar = (theme: Theme): CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: theme.colors.palette.backgrounds.hover,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const conversationTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: theme.colors.palette.text.primary,
});

export const conversationPreview = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const unreadPill = (theme: Theme): CSSProperties => ({
  marginLeft: "auto",
  background: theme.colors.palette.semantic.error,
  color: "#fff",
  borderRadius: 999,
  padding: "2px 8px",
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.bold,
});

export const content = (): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
  height: "100%",
});

export const contentHeader = (theme: Theme): CSSProperties => {
  const gradients = getGradients(theme.colors);

  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: gradients.primary,
  };
};

export const headerIconBtn = (): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const headerTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.base.size,
  fontWeight: theme.typography.fontWeight.bold,
  lineHeight: 1.1,
  color: "#fff",
});

export const headerSubtitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  opacity: 0.9,
  color: "#fff",
});

export const messageBody = (theme: Theme): CSSProperties => ({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  background: theme.colors.palette.backgrounds.secondary,
  padding: 12,
});

export const messageRow = (mine: boolean): CSSProperties => ({
  display: "flex",
  justifyContent: mine ? "flex-end" : "flex-start",
  marginBottom: 8,
});

export const bubble = (theme: Theme, mine: boolean): CSSProperties => ({
  maxWidth: "72%",
  background: mine
    ? `linear-gradient(130deg, ${theme.colors.palette.brand.purple[600]} 0%, ${theme.colors.palette.brand.pink[600]} 100%)`
    : theme.colors.palette.backgrounds.card,
  color: mine ? "#fff" : theme.colors.palette.text.primary,
  border: `1px solid ${mine ? "transparent" : theme.colors.palette.borders.default}`,
  borderRadius: 10,
  padding: "8px 10px",
  fontSize: theme.typography.fontSize.base.size,
  lineHeight: 1.4,
});

export const markdownRoot = (): CSSProperties => ({
  fontSize: "inherit",
  lineHeight: 1.5,
  overflowWrap: "anywhere",
});

export const markdownParagraph = (): CSSProperties => ({
  margin: "0 0 6px",
});

export const markdownHeading = (): CSSProperties => ({
  margin: "0 0 6px",
  fontSize: "inherit",
  fontWeight: 700,
  lineHeight: 1.4,
});

export const markdownList = (): CSSProperties => ({
  margin: "0 0 6px 18px",
  padding: 0,
});

export const markdownListItem = (): CSSProperties => ({
  marginBottom: 4,
});

export const markdownCodeInline = (theme: Theme, mine: boolean): CSSProperties => ({
  padding: "1px 5px",
  borderRadius: 6,
  fontSize: "0.9em",
  border: `1px solid ${mine ? "rgba(255,255,255,0.28)" : theme.colors.palette.borders.default}`,
  background: mine ? "rgba(255,255,255,0.12)" : theme.colors.palette.backgrounds.primary,
});

export const markdownCodeBlock = (theme: Theme, mine: boolean): CSSProperties => ({
  margin: "0 0 6px",
  padding: "8px 10px",
  borderRadius: 8,
  border: `1px solid ${mine ? "rgba(255,255,255,0.22)" : theme.colors.palette.borders.default}`,
  background: mine ? "rgba(0,0,0,0.18)" : theme.colors.palette.backgrounds.primary,
  overflowX: "auto",
  fontSize: "0.86em",
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
});

export const markdownLink = (mine: boolean): CSSProperties => ({
  border: "none",
  background: "transparent",
  padding: 0,
  color: mine ? "#fff" : "#8b5cf6",
  textDecoration: "underline",
  textUnderlineOffset: 2,
  fontWeight: 600,
  cursor: "pointer",
  font: "inherit",
});

export const markdownBlockquote = (theme: Theme, mine: boolean): CSSProperties => ({
  margin: "0 0 6px",
  padding: "4px 0 4px 10px",
  borderLeft: `3px solid ${mine ? "rgba(255,255,255,0.35)" : theme.colors.palette.brand.purple[500]}`,
  opacity: 0.95,
});

export const bubbleTime = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  opacity: 0.7,
  marginTop: 4,
});

export const assistantCitationList = (theme: Theme): CSSProperties => ({
  marginTop: 6,
  fontSize: theme.typography.fontSize.xs.size,
  opacity: 0.85,
});

export const assistantCitationLink = (theme: Theme): CSSProperties => ({
  border: "none",
  background: "transparent",
  padding: 0,
  color: theme.colors.palette.brand.purple[500],
  textDecoration: "underline",
  textUnderlineOffset: 2,
  fontWeight: 600,
  cursor: "pointer",
  font: "inherit",
});

export const assistantActionList = (): CSSProperties => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
});

export const assistantActionButton = (theme: Theme): CSSProperties => ({
  border: `1px solid ${theme.colors.palette.brand.purple[400]}`,
  background: theme.theme === "dark" ? "rgba(124,58,237,0.12)" : "rgba(168,85,247,0.08)",
  color: theme.colors.palette.brand.purple[500],
  borderRadius: 999,
  padding: "6px 10px",
  cursor: "pointer",
  font: "inherit",
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const assistantProductCards = (): CSSProperties => ({
  display: "grid",
  gap: 8,
  marginTop: 10,
});

export const assistantProductCard = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "56px 1fr",
  gap: 10,
  alignItems: "center",
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.primary,
  borderRadius: 12,
  padding: 8,
  cursor: "pointer",
});

export const assistantProductThumb = (theme: Theme): CSSProperties => ({
  width: 56,
  height: 56,
  borderRadius: 10,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  objectFit: "cover",
  overflow: "hidden",
  display: "block",
});

export const assistantProductThumbFallback = (theme: Theme): CSSProperties => ({
  ...assistantProductThumb(theme),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.xs.size,
  fontWeight: theme.typography.fontWeight.semibold,
});

export const assistantProductMeta = (): CSSProperties => ({
  minWidth: 0,
  display: "grid",
  gap: 4,
});

export const assistantProductTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.palette.text.primary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const assistantProductPrice = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.palette.brand.purple[500],
});

export const assistantProductHint = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: theme.colors.palette.text.muted,
});

export const inputBar = (theme: Theme): CSSProperties => ({
  position: "sticky",
  bottom: 0,
  zIndex: 2,
  padding: 10,
  borderTop: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.secondary,
  display: "grid",
  gridTemplateColumns: "1fr 56px",
  gap: 8,
});

export const input = (theme: Theme): CSSProperties => ({
  width: "100%",
  borderRadius: 10,
  border: `1px solid ${theme.colors.palette.borders.default}`,
  background: theme.colors.palette.backgrounds.primary,
  color: theme.colors.palette.text.primary,
  fontSize: theme.typography.fontSize.base.size,
  padding: "8px 10px",
  outline: "none",
});

export const sendButton = (theme: Theme): CSSProperties => ({
  border: "none",
  borderRadius: 10,
  background: `linear-gradient(130deg, ${theme.colors.palette.brand.purple[600]} 0%, ${theme.colors.palette.brand.pink[600]} 100%)`,
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const emptyState = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.sm.size,
  padding: "10px 2px",
});

export const hintText = (theme: Theme): CSSProperties => ({
  color: theme.colors.palette.text.muted,
  fontSize: theme.typography.fontSize.sm.size,
});
