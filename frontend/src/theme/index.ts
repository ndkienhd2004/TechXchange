import type { CSSProperties } from "react";
import { colors as lightColors } from "./light";
import { colors as darkColors } from "./dark";
import { fontSizes, spacing, typography, shadows } from "./spacing";

export type ThemeContexts = "light" | "dark";
export type Colors = typeof lightColors | typeof darkColors;
export type Spacing = typeof spacing;
export type FontSizes = typeof fontSizes;
export type Typography = typeof typography;
export type Shadows = typeof shadows;

export interface Theme {
  colors: Colors;
  spacing: Spacing;
  theme: ThemeContexts;
  fontSizes: FontSizes;
  typography: Typography;
  shadows: Shadows;
}

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  theme: "light",
  fontSizes,
  typography,
  shadows,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  theme: "dark",
  fontSizes,
  typography,
  shadows,
};

// Gradients (computed from colors)
export const getGradients = (colors: Colors) => ({
  primary: `linear-gradient(130deg, ${colors.palette.brand.purple[600]} 0%, ${colors.palette.brand.pink[600]} 100%)`,
  primaryHover: `linear-gradient(130deg, ${colors.palette.brand.purple[700]} 0%, ${colors.palette.brand.pink[700]} 100%)`,
  hero: `linear-gradient(120deg, ${colors.palette.brand.purple[900]} 0%, ${colors.palette.brand.purple[600]} 100%)`,
  promo: `linear-gradient(120deg, ${colors.palette.backgrounds.primary} 0%, ${colors.palette.backgrounds.secondary} 100%)`,
});

export type ThemedStyle<T> = (theme: Theme) => T;
export type ThemedStyleArray<T> = (
  | ThemedStyle<T>
  | CSSProperties
  | (CSSProperties | ThemedStyle<T>)[]
)[];

export { lightColors as colors };
export { darkColors };
