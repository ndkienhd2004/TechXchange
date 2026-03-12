import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const page = (theme: Theme): CSSProperties => ({
  minHeight: "100vh",
  background: "#07080c",
  color: "#f3f4f6",
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  position: "relative",
});

export const cover = (): CSSProperties => ({
  position: "absolute",
  inset: 0,
  height: 320,
  background:
    "radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.85) 0%, rgba(95,30,178,0.8) 38%, rgba(9,10,14,0.98) 78%, rgba(7,8,12,1) 100%)",
});

export const container = (theme: Theme): CSSProperties => ({
  maxWidth: 1200,
  margin: "0 auto",
  padding: `${theme.spacing["2xl"]} ${theme.spacing.lg} ${theme.spacing["3xl"]}`,
  position: "relative",
  zIndex: 1,
});

export const heroCard = (theme: Theme): CSSProperties => ({
  border: "1px solid rgba(99,102,241,0.35)",
  borderRadius: 22,
  background: "linear-gradient(100deg, rgba(18,18,22,0.95), rgba(14,15,20,0.95))",
  boxShadow: "0 20px 44px rgba(0,0,0,0.45)",
  padding: theme.spacing.xl,
  marginBottom: theme.spacing.xl,
});

export const heroTop = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "160px minmax(0, 1fr) 170px",
  gap: theme.spacing.lg,
  alignItems: "start",
});

export const avatarWrap = (): CSSProperties => ({
  position: "relative",
  width: 160,
});

export const avatarBox = (): CSSProperties => ({
  width: 160,
  height: 160,
  borderRadius: 20,
  background: "linear-gradient(145deg, rgba(56,56,61,0.95), rgba(40,41,47,0.95))",
  color: "#9ca3af",
  fontSize: 58,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const verifiedDot = (): CSSProperties => ({
  position: "absolute",
  right: -10,
  bottom: -8,
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#22c55e",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  border: "4px solid #0f1015",
});

export const heroContent = (): CSSProperties => ({
  minWidth: 0,
});

export const titleRow = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  flexWrap: "wrap",
});

export const shopName = (): CSSProperties => ({
  margin: 0,
  fontSize: 42,
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: "-0.02em",
});

export const verifiedBadge = (): CSSProperties => ({
  border: "1px solid rgba(34,197,94,0.85)",
  color: "#4ade80",
  padding: "6px 12px",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
});

export const subtitle = (): CSSProperties => ({
  margin: "10px 0 0",
  color: "#9ca3af",
  fontSize: 20,
  fontWeight: 500,
});

export const kpiRow = (theme: Theme): CSSProperties => ({
  marginTop: theme.spacing.lg,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(120px, 1fr))",
  gap: theme.spacing.md,
});

export const kpiCard = (): CSSProperties => ({
  background: "linear-gradient(145deg, rgba(55,55,62,0.9), rgba(43,44,50,0.9))",
  border: "1px solid rgba(71,85,105,0.35)",
  borderRadius: 14,
  padding: "14px 16px",
});

export const kpiValue = (): CSSProperties => ({
  fontSize: 34,
  fontWeight: 700,
  lineHeight: 1.1,
  color: "#f3f4f6",
});

export const kpiLabel = (): CSSProperties => ({
  marginTop: 8,
  fontSize: 16,
  color: "#9ca3af",
});

export const metaRow = (theme: Theme): CSSProperties => ({
  marginTop: theme.spacing.lg,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.lg,
  color: "#9ca3af",
  fontSize: 16,
  flexWrap: "wrap",
});

export const actionColumn = (theme: Theme): CSSProperties => ({
  display: "grid",
  gap: theme.spacing.md,
});

export const followButton = (): CSSProperties => ({
  border: "none",
  borderRadius: 12,
  background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
  color: "#fff",
  fontWeight: 800,
  fontSize: 16,
  padding: "16px 18px",
  cursor: "pointer",
});

export const chatButton = (): CSSProperties => ({
  border: "1px solid rgba(148,163,184,0.6)",
  borderRadius: 12,
  background: "#f8fafc",
  color: "#111827",
  fontWeight: 700,
  fontSize: 16,
  padding: "14px 18px",
  cursor: "pointer",
});

export const mainTabs = (theme: Theme): CSSProperties => ({
  display: "inline-flex",
  background: "rgba(39,39,42,0.95)",
  borderRadius: 14,
  border: "1px solid rgba(99,102,241,0.28)",
  padding: 6,
  gap: 6,
  marginBottom: theme.spacing.lg,
});

export const mainTab = (): CSSProperties => ({
  border: "none",
  background: "transparent",
  color: "#9ca3af",
  fontWeight: 700,
  fontSize: 16,
  padding: "10px 18px",
  borderRadius: 10,
  cursor: "pointer",
});

export const mainTabActive = (): CSSProperties => ({
  ...mainTab(),
  background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
  color: "#fff",
});

export const descriptionCard = (theme: Theme): CSSProperties => ({
  borderRadius: 14,
  border: "1px solid rgba(99,102,241,0.28)",
  background: "rgba(24,24,28,0.95)",
  color: "#cbd5e1",
  padding: theme.spacing.lg,
  fontSize: 16,
  marginBottom: theme.spacing.lg,
});

export const toolbar = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "1fr 260px auto",
  gap: theme.spacing.md,
  alignItems: "center",
  marginBottom: theme.spacing.lg,
});

export const searchInput = (): CSSProperties => ({
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(99,102,241,0.35)",
  background: "rgba(39,39,42,0.92)",
  color: "#f3f4f6",
  fontSize: 16,
  padding: "14px 16px",
  outline: "none",
});

export const sortSelect = (): CSSProperties => ({
  borderRadius: 12,
  border: "1px solid rgba(99,102,241,0.35)",
  background: "rgba(39,39,42,0.92)",
  color: "#f3f4f6",
  fontSize: 16,
  padding: "14px 16px",
  outline: "none",
});

export const viewSwitch = (): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
});

export const stockToggle = (): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "#cbd5e1",
  fontSize: 14,
  marginRight: 8,
});

export const viewBtn = (): CSSProperties => ({
  width: 54,
  height: 54,
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.55)",
  background: "#f8fafc",
  color: "#111827",
  fontSize: 18,
  cursor: "pointer",
});

export const viewBtnActive = (): CSSProperties => ({
  ...viewBtn(),
  border: "none",
  background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
  color: "#fff",
});

export const productGrid = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: theme.spacing.lg,
});

export const productList = (theme: Theme): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: theme.spacing.md,
});

export const itemCardWrap = (): CSSProperties => ({
  position: "relative",
  width: "100%",
});

export const soldOutLabel = (): CSSProperties => ({
  position: "absolute",
  top: 12,
  right: 12,
  zIndex: 5,
  background: "rgba(17,24,39,0.9)",
  color: "#fca5a5",
  border: "1px solid rgba(239,68,68,0.65)",
  borderRadius: 8,
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 700,
});

export const productCard = (): CSSProperties => ({
  borderRadius: 14,
  overflow: "hidden",
  background: "rgba(24,24,28,0.95)",
  border: "1px solid rgba(99,102,241,0.24)",
  display: "grid",
});

export const productCardList = (): CSSProperties => ({
  ...productCard(),
  gridTemplateColumns: "220px minmax(0,1fr)",
  alignItems: "stretch",
});

export const productThumbWrap = (): CSSProperties => ({
  position: "relative",
  width: "100%",
  height: 220,
  background: "rgba(39,39,42,0.92)",
});

export const productThumb = (): CSSProperties => ({
  width: "100%",
  height: "100%",
  background: "rgba(39,39,42,0.92)",
});

export const productBody = (theme: Theme): CSSProperties => ({
  padding: theme.spacing.md,
});

export const productName = (): CSSProperties => ({
  color: "#f3f4f6",
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.3,
});

export const productMeta = (): CSSProperties => ({
  marginTop: 6,
  color: "#9ca3af",
  fontSize: 22,
});

export const productPrice = (): CSSProperties => ({
  marginTop: 12,
  color: "#a78bfa",
  fontSize: 30,
  fontWeight: 800,
});

export const pagination = (theme: Theme): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.md,
  marginTop: theme.spacing.xl,
});

export const pageButton = (): CSSProperties => ({
  border: "1px solid rgba(99,102,241,0.35)",
  borderRadius: 10,
  padding: "10px 16px",
  background: "rgba(24,24,28,0.95)",
  color: "#f3f4f6",
  cursor: "pointer",
  fontSize: 14,
});

export const pageText = (): CSSProperties => ({
  color: "#9ca3af",
  fontSize: 14,
});

export const emptyText = (): CSSProperties => ({
  color: "#9ca3af",
  fontSize: 16,
  padding: "28px 0",
});
