import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const floatingButton = (theme: Theme): CSSProperties => ({
  position: "fixed",
  right: 24,
  bottom: 24,
  width: 62,
  height: 62,
  borderRadius: "50%",
  border: "none",
  background: "linear-gradient(130deg, #6d28d9 0%, #db2777 100%)",
  color: "#fff",
  boxShadow: theme.shadows.xl,
  cursor: "pointer",
  zIndex: 1600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

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

export const modal = (): CSSProperties => ({
  position: "fixed",
  right: 24,
  bottom: 92,
  width: "min(760px, calc(100vw - 32px))",
  height: "min(70vh, 560px)",
  background: "#17181d",
  border: "1px solid rgba(99,102,241,0.35)",
  borderRadius: 20,
  boxShadow: "0 34px 90px rgba(0,0,0,0.5)",
  zIndex: 1601,
  display: "grid",
  gridTemplateColumns: "240px 1fr",
  overflow: "hidden",
  color: "#f8fafc",
});

export const sidebar = (): CSSProperties => ({
  borderRight: "1px solid rgba(71,85,105,0.45)",
  background: "#14161a",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
});

export const sidebarHeader = (theme: Theme): CSSProperties => ({
  padding: "14px 16px",
  borderBottom: "1px solid rgba(71,85,105,0.45)",
  fontSize: theme.typography.fontSize.lg.size,
  fontWeight: theme.typography.fontWeight.bold,
});

export const aiItem = (active: boolean): CSSProperties => ({
  width: "100%",
  border: "none",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  background: active ? "rgba(124,58,237,0.25)" : "transparent",
  borderLeft: active ? "4px solid #a855f7" : "4px solid transparent",
  cursor: "pointer",
});

export const botAvatar = (): CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "linear-gradient(140deg, #7c3aed 0%, #db2777 100%)",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const aiTitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.bold,
  lineHeight: 1.2,
});

export const aiSubtitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: "#9ca3af",
  lineHeight: 1.25,
});

export const sectionLabel = (theme: Theme): CSSProperties => ({
  padding: "8px 16px",
  fontSize: theme.typography.fontSize.xs.size,
  color: "#6b7280",
  fontWeight: theme.typography.fontWeight.semibold,
});

export const conversationList = (): CSSProperties => ({
  minHeight: 0,
  overflowY: "auto",
  flex: 1,
});

export const conversationItem = (active: boolean): CSSProperties => ({
  width: "100%",
  border: "none",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  borderTop: "1px solid rgba(51,65,85,0.35)",
  cursor: "pointer",
  background: active ? "rgba(59,130,246,0.12)" : "transparent",
});

export const conversationAvatar = (): CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "#334155",
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
});

export const conversationPreview = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  color: "#9ca3af",
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

export const contentHeader = (): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  background: "linear-gradient(130deg, #7c3aed 0%, #db2777 100%)",
});

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
});

export const headerSubtitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xs.size,
  opacity: 0.9,
});

export const messageBody = (): CSSProperties => ({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  background: "#2c2e33",
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
    ? "linear-gradient(130deg, #7c3aed 0%, #db2777 100%)"
    : "#16191d",
  color: "#f8fafc",
  border: "1px solid rgba(71,85,105,0.45)",
  borderRadius: 10,
  padding: "8px 10px",
  fontSize: theme.typography.fontSize.base.size,
  lineHeight: 1.4,
});

export const bubbleTime = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  opacity: 0.7,
  marginTop: 4,
});

export const inputBar = (): CSSProperties => ({
  position: "sticky",
  bottom: 0,
  zIndex: 2,
  padding: 10,
  borderTop: "1px solid rgba(71,85,105,0.45)",
  background: "#2c2e33",
  display: "grid",
  gridTemplateColumns: "1fr 56px",
  gap: 8,
});

export const input = (theme: Theme): CSSProperties => ({
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(71,85,105,0.7)",
  background: "#16191d",
  color: "#f8fafc",
  fontSize: theme.typography.fontSize.base.size,
  padding: "8px 10px",
  outline: "none",
});

export const sendButton = (): CSSProperties => ({
  border: "none",
  borderRadius: 10,
  background: "linear-gradient(130deg, #7c3aed 0%, #9333ea 100%)",
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const emptyState = (theme: Theme): CSSProperties => ({
  color: "#9ca3af",
  fontSize: theme.typography.fontSize.sm.size,
  padding: "10px 2px",
});

export const hintText = (theme: Theme): CSSProperties => ({
  color: "#9ca3af",
  fontSize: theme.typography.fontSize.sm.size,
});
