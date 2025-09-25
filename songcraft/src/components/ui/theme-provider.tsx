/**
 * Theme Provider v2
 * 
 * A lightweight theme provider that manages data attributes for theme switching.
 * Follows the "thin provider" principle - only handles theme state, not business data.
 * 
 * Features:
 * - Dual-layer theming: [data-theme] (dark/light) + [data-skin] (brand colors)
 * - localStorage persistence with SSR safety
 * - Minimal context - just theme state management
 * - System theme detection with preference override
 * - Type-safe theme values
 */

import * as React from 'react';

// Theme types
export type Theme = 'light' | 'dark' | 'system';
export type Skin = 'songcraft' | 'default' | 'minimal';

interface ThemeContextValue {
  theme: Theme;
  skin: Skin;
  resolvedTheme: 'light' | 'dark'; // The actual theme applied (resolves 'system')
  setTheme: (theme: Theme) => void;
  setSkin: (skin: Skin) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

// Storage keys
const THEME_STORAGE_KEY = 'ui-theme';
const SKIN_STORAGE_KEY = 'ui-skin';

// Default values
const DEFAULT_THEME: Theme = 'system';
const DEFAULT_SKIN: Skin = 'songcraft';

interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Default theme to use on initial load
   * @default 'system'
   */
  defaultTheme?: Theme;
  /**
   * Default skin to use on initial load  
   * @default 'songcraft'
   */
  defaultSkin?: Skin;
  /**
   * Whether to store theme preference in localStorage
   * @default true
   */
  enableStorage?: boolean;
}

/**
 * Get the system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'; // SSR default
  }
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolve theme value to actual theme (handles 'system' theme)
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Get stored theme from localStorage with fallback
 */
function getStoredTheme(defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') {
    return defaultTheme;
  }
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    return stored && ['light', 'dark', 'system'].includes(stored) ? stored : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

/**
 * Get stored skin from localStorage with fallback
 */
function getStoredSkin(defaultSkin: Skin): Skin {
  if (typeof window === 'undefined') {
    return defaultSkin;
  }
  
  try {
    const stored = localStorage.getItem(SKIN_STORAGE_KEY) as Skin;
    return stored && ['songcraft', 'default', 'minimal'].includes(stored) ? stored : defaultSkin;
  } catch {
    return defaultSkin;
  }
}

/**
 * Apply theme and skin to document element via data attributes
 */
function applyTheme(theme: 'light' | 'dark', skin: Skin) {
  if (typeof document === 'undefined') return;
  
  // Set theme data attribute
  document.documentElement.setAttribute('data-theme', theme);
  
  // Set skin data attribute
  document.documentElement.setAttribute('data-skin', skin);
  
  // Also set on meta theme-color for mobile browsers (optional enhancement)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    // You could set different theme colors based on theme/skin combination
    const themeColor = theme === 'dark' ? '#0b0f14' : '#ffffff';
    metaThemeColor.setAttribute('content', themeColor);
  }
}

/**
 * Theme Provider Component
 * 
 * Manages theme state and applies data attributes to document element.
 * Persists preferences to localStorage and handles system theme changes.
 */
export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  defaultSkin = DEFAULT_SKIN,
  enableStorage = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [skin, setSkinState] = React.useState<Skin>(defaultSkin);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(() => 
    resolveTheme(defaultTheme)
  );
  
  // Initialize theme from localStorage on mount
  React.useEffect(() => {
    if (!enableStorage) return;
    
    const storedTheme = getStoredTheme(defaultTheme);
    const storedSkin = getStoredSkin(defaultSkin);
    
    setThemeState(storedTheme);
    setSkinState(storedSkin);
    
    const resolved = resolveTheme(storedTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved, storedSkin);
  }, [defaultTheme, defaultSkin, enableStorage]);
  
  // Listen for system theme changes
  React.useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const newResolvedTheme = getSystemTheme();
      setResolvedTheme(newResolvedTheme);
      applyTheme(newResolvedTheme, skin);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, skin]);
  
  // Theme setter with persistence
  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved, skin);
    
    if (enableStorage) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // Handle localStorage errors gracefully
      }
    }
  }, [skin, enableStorage]);
  
  // Skin setter with persistence  
  const setSkin = React.useCallback((newSkin: Skin) => {
    setSkinState(newSkin);
    applyTheme(resolvedTheme, newSkin);
    
    if (enableStorage) {
      try {
        localStorage.setItem(SKIN_STORAGE_KEY, newSkin);
      } catch {
        // Handle localStorage errors gracefully
      }
    }
  }, [resolvedTheme, enableStorage]);
  
  const value = React.useMemo(() => ({
    theme,
    skin,
    resolvedTheme,
    setTheme,
    setSkin,
  }), [theme, skin, resolvedTheme, setTheme, setSkin]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * 
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, resolvedTheme, setTheme } = useTheme();
 *   
 *   return (
 *     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>  
 *       Current: {resolvedTheme}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const context = React.useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Theme toggle component for easy theme switching
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  
  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };
  
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
      default:
        return '☀️';
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleToggle}
      className={className}
      title={`Current theme: ${theme}`}
      aria-label={`Switch from ${theme} theme`}
    >
      <span role="img" aria-hidden="true">
        {getThemeIcon()}
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}