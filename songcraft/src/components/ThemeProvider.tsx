/**
 * Unified Theme Provider
 * 
 * Manages theme switching for the Songcraft design system using:
 * - data-theme: "light" | "dark" (color scheme)
 * - data-skin: "blue" | "green" | "red" | "purple" (brand colors)
 * 
 * This replaces the complex DesignThemeProvider with a simpler approach
 * that works directly with CSS custom properties and semantic tokens.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Theme types
export type ColorScheme = "light" | "dark";
export type BrandSkin = "blue" | "green" | "red" | "purple";

export interface ThemeState {
  colorScheme: ColorScheme;
  brandSkin: BrandSkin;
}

export interface ThemeContextValue extends ThemeState {
  setColorScheme: (scheme: ColorScheme) => void;
  setBrandSkin: (skin: BrandSkin) => void;
  setTheme: (theme: Partial<ThemeState>) => void;
}

// Context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Storage keys
const STORAGE_KEYS = {
  colorScheme: "songcraft-color-scheme",
  brandSkin: "songcraft-brand-skin",
} as const;

// Default theme
const DEFAULT_THEME: ThemeState = {
  colorScheme: "light",
  brandSkin: "blue",
};

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Partial<ThemeState>;
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeState>(DEFAULT_THEME);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window === "undefined") {
      setIsHydrated(true);
      return;
    }

    const savedColorScheme = localStorage.getItem(STORAGE_KEYS.colorScheme) as ColorScheme | null;
    const savedBrandSkin = localStorage.getItem(STORAGE_KEYS.brandSkin) as BrandSkin | null;

    const initialTheme: ThemeState = {
      colorScheme: savedColorScheme || defaultTheme?.colorScheme || DEFAULT_THEME.colorScheme,
      brandSkin: savedBrandSkin || defaultTheme?.brandSkin || DEFAULT_THEME.brandSkin,
    };

    setThemeState(initialTheme);
    setIsHydrated(true);

    // Apply theme to DOM immediately
    applyThemeToDOM(initialTheme);
  }, [defaultTheme]);

  // Apply theme changes to DOM and localStorage
  useEffect(() => {
    if (!isHydrated) return;
    
    applyThemeToDOM(theme);
    
    // Persist to localStorage (only on client side)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.colorScheme, theme.colorScheme);
      localStorage.setItem(STORAGE_KEYS.brandSkin, theme.brandSkin);
    }
  }, [theme, isHydrated]);

  // Apply theme to DOM
  const applyThemeToDOM = (themeToApply: ThemeState) => {
    // Only apply theme on client side
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    
    // Set data attributes
    root.setAttribute("data-theme", themeToApply.colorScheme);
    root.setAttribute("data-skin", themeToApply.brandSkin);
    
    // Set color-scheme for native browser elements
    root.style.colorScheme = themeToApply.colorScheme;
  };

  // Theme update functions
  const setColorScheme = (colorScheme: ColorScheme) => {
    setThemeState(prev => ({ ...prev, colorScheme }));
  };

  const setBrandSkin = (brandSkin: BrandSkin) => {
    setThemeState(prev => ({ ...prev, brandSkin }));
  };

  const setTheme = (updates: Partial<ThemeState>) => {
    setThemeState(prev => ({ ...prev, ...updates }));
  };

  const contextValue: ThemeContextValue = {
    ...theme,
    setColorScheme,
    setBrandSkin,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper hook for theme classes
export function useThemeClasses() {
  const { colorScheme, brandSkin } = useTheme();
  
  return {
    colorScheme,
    brandSkin,
    isDark: colorScheme === "dark",
    isLight: colorScheme === "light",
    themeClass: `theme-${colorScheme}`,
    skinClass: `skin-${brandSkin}`,
  };
}

// System preference detection
export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<ColorScheme>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return systemTheme;
}

// Export theme constants for use in other components
export const THEME_OPTIONS = {
  colorSchemes: [
    { value: "light" as const, label: "Light", icon: "☀️" },
    { value: "dark" as const, label: "Dark", icon: "🌙" },
  ],
  brandSkins: [
    { value: "blue" as const, label: "Blue", color: "hsl(217 91% 60%)" },
    { value: "green" as const, label: "Green", color: "hsl(142 76% 36%)" },
    { value: "red" as const, label: "Red", color: "hsl(0 84% 60%)" },
    { value: "purple" as const, label: "Purple", color: "hsl(262 83% 58%)" },
  ],
} as const;