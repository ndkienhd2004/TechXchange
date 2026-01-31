import type { CSSProperties } from "react";
import type { Theme } from "@/theme";

export const carousel = (theme: Theme): CSSProperties => ({
  width: "100%",
  position: "relative",
  marginBottom: theme.spacing.xl,
});

export const slideContainer = (theme: Theme): CSSProperties => ({
  position: "relative",
  width: "100%",
  minHeight: "500px",
  borderRadius: theme.spacing[6],
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: `${theme.spacing["3xl"]} ${theme.spacing["2xl"]}`,
  transition: "all 0.5s ease-in-out",
  
});

export const slideContent = (theme: Theme): CSSProperties => ({
  maxWidth: "600px",
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
  color: theme.colors.palette.text.primary,
});

export const badge = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.sm.size,
  fontWeight: theme.typography.fontWeight.medium,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  color: "rgba(255, 255, 255, 0.9)",
  letterSpacing: theme.typography.letterSpacing.wide,
});

export const title = (theme: Theme): CSSProperties => ({
  fontSize: "3.5rem",
  fontWeight: theme.typography.fontWeight.bold,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  lineHeight: theme.typography.letterSpacing.tight,
  color: "#ffffff",
  margin: 0,
});

export const subtitle = (theme: Theme): CSSProperties => ({
  fontSize: theme.typography.fontSize.xl.size,
  fontWeight: theme.typography.fontWeight.normal,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  color: "rgba(255, 255, 255, 0.85)",
  letterSpacing: theme.typography.letterSpacing.wide,
  margin: 0,
});

export const button = (theme: Theme): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
  background: "#ec4899",
  color: "#ffffff",
  fontSize: theme.typography.fontSize.base.size,
  fontWeight: theme.typography.fontWeight.semibold,
  fontFamily: theme.typography.fontFamily.sans.join(", "),
  borderRadius: theme.spacing[3],
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 14px 0 rgba(236, 72, 153, 0.4)",
  alignSelf: "flex-start",
});

export const navButton = (theme: Theme): CSSProperties => ({
  position: "absolute",
  left: theme.spacing.lg,
  top: "50%",
  transform: "translateY(-50%)",
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  zIndex: 10,
});

export const navButtonRight = (theme: Theme): CSSProperties => ({
  ...navButton(theme),
  left: "auto",
  right: theme.spacing.lg,
});

export const dotsContainer = (theme: Theme): CSSProperties => ({
  position: "absolute",
  bottom: theme.spacing.lg,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: theme.spacing[2],
  zIndex: 10,
});

export const dot = (): CSSProperties => ({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.4)",
  border: "none",
  cursor: "pointer",
  transition: "all 0.3s ease",
  padding: 0,
});

export const dotActive = (): CSSProperties => ({
  ...dot(),
  background: "#ffffff",
  width: "32px",
  borderRadius: "6px",
});
