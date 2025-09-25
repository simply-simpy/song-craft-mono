/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      // Semantic color tokens using CSS custom properties
      colors: {
        // Background colors
        'bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
        'bg-tertiary': 'rgb(var(--bg-tertiary) / <alpha-value>)',
        'bg-hover': 'rgb(var(--bg-hover) / <alpha-value>)',
        'bg-active': 'rgb(var(--bg-active) / <alpha-value>)',
        'bg-selected': 'rgb(var(--bg-selected) / <alpha-value>)',
        'bg-brand': 'rgb(var(--bg-brand) / <alpha-value>)',
        'bg-accent': 'rgb(var(--bg-accent) / <alpha-value>)',
        'bg-destructive': 'rgb(var(--bg-destructive) / <alpha-value>)',
        'bg-warning': 'rgb(var(--bg-warning) / <alpha-value>)',
        'bg-success': 'rgb(var(--bg-success) / <alpha-value>)',
        'bg-overlay': 'rgb(var(--bg-overlay) / <alpha-value>)',
        'bg-disabled': 'rgb(var(--bg-disabled) / <alpha-value>)',
        
        // Foreground colors (text, icons)
        'fg-primary': 'rgb(var(--fg-primary) / <alpha-value>)',
        'fg-secondary': 'rgb(var(--fg-secondary) / <alpha-value>)',
        'fg-tertiary': 'rgb(var(--fg-tertiary) / <alpha-value>)',
        'fg-disabled': 'rgb(var(--fg-disabled) / <alpha-value>)',
        'fg-hover': 'rgb(var(--fg-hover) / <alpha-value>)',
        'fg-active': 'rgb(var(--fg-active) / <alpha-value>)',
        'fg-brand': 'rgb(var(--fg-brand) / <alpha-value>)',
        'fg-accent': 'rgb(var(--fg-accent) / <alpha-value>)',
        'fg-destructive': 'rgb(var(--fg-destructive) / <alpha-value>)',
        'fg-warning': 'rgb(var(--fg-warning) / <alpha-value>)',
        'fg-success': 'rgb(var(--fg-success) / <alpha-value>)',
        'fg-on-brand': 'rgb(var(--fg-on-brand) / <alpha-value>)',
        'fg-on-accent': 'rgb(var(--fg-on-accent) / <alpha-value>)',
        'fg-on-destructive': 'rgb(var(--fg-on-destructive) / <alpha-value>)',
        
        // Surface colors (cards, panels)
        'surface-base': 'rgb(var(--surface-base) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--surface-elevated) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--surface-sunken) / <alpha-value>)',
        'surface-hover': 'rgb(var(--surface-hover) / <alpha-value>)',
        'surface-active': 'rgb(var(--surface-active) / <alpha-value>)',
        'surface-brand': 'rgb(var(--surface-brand) / <alpha-value>)',
        'surface-accent': 'rgb(var(--surface-accent) / <alpha-value>)',
        'surface-destructive': 'rgb(var(--surface-destructive) / <alpha-value>)',
        'surface-warning': 'rgb(var(--surface-warning) / <alpha-value>)',
        'surface-success': 'rgb(var(--surface-success) / <alpha-value>)',
        
        // Border colors
        'border-primary': 'rgb(var(--border-primary) / <alpha-value>)',
        'border-secondary': 'rgb(var(--border-secondary) / <alpha-value>)',
        'border-hover': 'rgb(var(--border-hover) / <alpha-value>)',
        'border-focus': 'rgb(var(--border-focus) / <alpha-value>)',
        'border-destructive': 'rgb(var(--border-destructive) / <alpha-value>)',
        'border-warning': 'rgb(var(--border-warning) / <alpha-value>)',
        'border-success': 'rgb(var(--border-success) / <alpha-value>)',
        
        // Brand colors
        'brand-primary': 'rgb(var(--brand-primary) / <alpha-value>)',
        'brand-secondary': 'rgb(var(--brand-secondary) / <alpha-value>)',
        'brand-tertiary': 'rgb(var(--brand-tertiary) / <alpha-value>)',
        'brand-hover': 'rgb(var(--brand-hover) / <alpha-value>)',
        'brand-active': 'rgb(var(--brand-active) / <alpha-value>)',
      },
      
      // Typography using semantic tokens
      fontFamily: {
        sans: 'var(--font-font-sans)',
        mono: 'var(--font-font-mono)',
      },
      
      fontSize: {
        xs: 'var(--font-text-xs)',
        sm: 'var(--font-text-sm)',
        base: 'var(--font-text-base)',
        lg: 'var(--font-text-lg)',
        xl: 'var(--font-text-xl)',
        '2xl': 'var(--font-text-2xl)',
        '3xl': 'var(--font-text-3xl)',
        '4xl': 'var(--font-text-4xl)',
        '5xl': 'var(--font-text-5xl)',
      },
      
      fontWeight: {
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      
      lineHeight: {
        tight: 'var(--font-leading-tight)',
        normal: 'var(--font-leading-normal)',
        relaxed: 'var(--font-leading-relaxed)',
      },
      
      // Spacing using semantic tokens
      spacing: {
        0: 'var(--space-0)',
        px: 'var(--space-px)',
        0.5: 'var(--space-0\.5)',
        1: 'var(--space-1)',
        1.5: 'var(--space-1\.5)',
        2: 'var(--space-2)',
        2.5: 'var(--space-2\.5)',
        3: 'var(--space-3)',
        3.5: 'var(--space-3\.5)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        9: 'var(--space-9)',
        10: 'var(--space-10)',
        11: 'var(--space-11)',
        12: 'var(--space-12)',
        14: 'var(--space-14)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
        24: 'var(--space-24)',
        28: 'var(--space-28)',
        32: 'var(--space-32)',
        36: 'var(--space-36)',
        40: 'var(--space-40)',
        44: 'var(--space-44)',
        48: 'var(--space-48)',
        52: 'var(--space-52)',
        56: 'var(--space-56)',
        60: 'var(--space-60)',
        64: 'var(--space-64)',
        72: 'var(--space-72)',
        80: 'var(--space-80)',
        96: 'var(--space-96)',
      },
      
      // Box shadow using semantic tokens
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-base)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
      },
      
      // Border radius using semantic tokens
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-base)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },
      
      // Animation timing using semantic tokens
      transitionDuration: {
        fast: 'var(--animate-duration-fast)',
        DEFAULT: 'var(--animate-duration-normal)',
        slow: 'var(--animate-duration-slow)',
      },
      
      transitionTimingFunction: {
        DEFAULT: 'var(--animate-easing-ease)',
        linear: 'var(--animate-easing-linear)',
        in: 'var(--animate-easing-ease-in)',
        out: 'var(--animate-easing-ease-out)',
        'in-out': 'var(--animate-easing-ease-in-out)',
        bounce: 'var(--animate-easing-bounce)',
      },
    },
  },
  plugins: [
    require('daisyui'), // Keep DaisyUI for now during migration
  ],
  daisyui: {
    themes: [
      {
        brand: {
          primary: "#0ea5e9",
          "primary-content": "#001018",
          secondary: "#f97316",
          accent: "#22c55e",
          neutral: "#1f2937",
          "base-100": "#0b0f14",
          "base-200": "#0f172a",
          "base-300": "#111827",
          info: "#60a5fa",
          success: "#34d399",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      "light",
      "dark",
      "lofi",
      "cyberpunk",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter"
    ],
  },
}
