/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      // Semantic color tokens using CSS custom properties
      colors: {
        // Background colors - tokens already contain full color values (HSL/OKLCH)
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-hover': 'var(--bg-hover)',
        'bg-active': 'var(--bg-active)',
        'bg-selected': 'var(--bg-selected)',
        'bg-brand': 'var(--bg-brand)',
        'bg-accent': 'var(--bg-accent)',
        'bg-destructive': 'var(--bg-destructive)',
        'bg-warning': 'var(--bg-warning)',
        'bg-success': 'var(--bg-success)',
        'bg-overlay': 'var(--bg-overlay)',
        'bg-disabled': 'var(--bg-disabled)',
        
        // Foreground colors (text, icons)
        'fg-primary': 'var(--fg-primary)',
        'fg-secondary': 'var(--fg-secondary)',
        'fg-tertiary': 'var(--fg-tertiary)',
        'fg-disabled': 'var(--fg-disabled)',
        'fg-hover': 'var(--fg-hover)',
        'fg-active': 'var(--fg-active)',
        'fg-brand': 'var(--fg-brand)',
        'fg-accent': 'var(--fg-accent)',
        'fg-destructive': 'var(--fg-destructive)',
        'fg-warning': 'var(--fg-warning)',
        'fg-success': 'var(--fg-success)',
        'fg-on-brand': 'var(--fg-on-brand)',
        'fg-on-accent': 'var(--fg-on-accent)',
        'fg-on-destructive': 'var(--fg-on-destructive)',
        
        // Surface colors (cards, panels)
        'surface-base': 'var(--surface-base)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-sunken': 'var(--surface-sunken)',
        'surface-hover': 'var(--surface-hover)',
        'surface-active': 'var(--surface-active)',
        'surface-brand': 'var(--surface-brand)',
        'surface-accent': 'var(--surface-accent)',
        'surface-destructive': 'var(--surface-destructive)',
        'surface-warning': 'var(--surface-warning)',
        'surface-success': 'var(--surface-success)',
        
        // Border colors
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-hover': 'var(--border-hover)',
        'border-focus': 'var(--border-focus)',
        'border-destructive': 'var(--border-destructive)',
        'border-warning': 'var(--border-warning)',
        'border-success': 'var(--border-success)',
        
        // Brand colors
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-tertiary': 'var(--brand-tertiary)',
        'brand-hover': 'var(--brand-hover)',
        'brand-active': 'var(--brand-active)',
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
        0.5: 'var(--space-0_5)',  // Updated to use underscore
        1: 'var(--space-1)',
        1.5: 'var(--space-1_5)',  // Updated to use underscore
        2: 'var(--space-2)',
        2.5: 'var(--space-2_5)',  // Updated to use underscore
        3: 'var(--space-3)',
        3.5: 'var(--space-3_5)',  // Updated to use underscore
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
 
}
