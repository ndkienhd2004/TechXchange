"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CSSProperties } from "react";
import {
  darkTheme,
  lightTheme,
  Theme,
  ThemeContexts,
  ThemedStyle,
  ThemedStyleArray,
} from ".";

interface ThemeContextProps {
  theme: Theme;
  themeType: ThemeContexts;
  setThemeType: (themeType: ThemeContexts) => void;
  themed: <T extends CSSProperties>(
    styleOrStyleFn: ThemedStyle<T> | T | ThemedStyleArray<T>
  ) => T;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider(props: ThemeProviderProps) {
  const { children } = props;
  
  // Always start with dark theme for SSR and initial client render
  // This prevents hydration mismatch
  const [currentThemeType, setCurrentThemeType] = useState<ThemeContexts>("dark");

  const setThemeType = (themeType: ThemeContexts) => {
    setCurrentThemeType(themeType);
    if (typeof window !== "undefined") {
    localStorage.setItem("theme", themeType);
    }
  };

  useEffect(() => {
    // After hydration, check for stored theme or system preference
    // We need to do this after mount to avoid hydration mismatch
    const stored = localStorage.getItem("theme") as ThemeContexts | null;
    
    const updateTheme = () => {
    if (stored === "light" || stored === "dark") {
        setCurrentThemeType(stored);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setCurrentThemeType(prefersDark ? "dark" : "light");
      }
    };
    
    // Use requestAnimationFrame to avoid cascading render warning
    requestAnimationFrame(updateTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("theme");
      // Only auto-switch if user hasn't manually set a preference
      if (!stored) {
        setCurrentThemeType(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const theme = useMemo(
    () => (currentThemeType === "light" ? lightTheme : darkTheme),
    [currentThemeType]
  );

  const themed = useCallback(
    function <T extends CSSProperties>(
      styleOrStyleFn: ThemedStyle<T> | T | ThemedStyleArray<T>
    ): T {
      const flatStyles = [styleOrStyleFn].flat(3);
      const stylesArray = flatStyles.map((f) => {
        if (typeof f === "function") {
          return (f as ThemedStyle<T>)(theme);
        } else {
          return f;
        }
      });
      // Merge all styles into a single object
      return Object.assign({}, ...stylesArray) as T;
    },
    [theme]
  );

  // Apply theme background to body
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.background = theme.colors.palette.backgrounds.primary;
      document.body.style.color = theme.colors.palette.text.primary;
      document.body.style.margin = "0";
      document.body.style.padding = "0";
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, themeType: currentThemeType, setThemeType, themed }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the ThemeContext
export const useAppTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};

