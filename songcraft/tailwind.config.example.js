/**
 * Option 2: Tailwind Config with Radix Integration
 * 
 * This approach extends your Tailwind config to include Radix variables
 * as Tailwind utilities, allowing you to use them in classes.
 */

// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Map your design tokens to Tailwind colors
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
        
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-hover': 'var(--border-hover)',
        'border-focus': 'var(--border-focus)',
        'border-destructive': 'var(--border-destructive)',
        'border-warning': 'var(--border-warning)',
        'border-success': 'var(--border-success)',
        
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-tertiary': 'var(--brand-tertiary)',
        'brand-hover': 'var(--brand-hover)',
        'brand-active': 'var(--brand-active)',
        
        // Radix UI colors (for direct use)
        'radix-accent': {
          1: 'var(--radix-accent-1)',
          2: 'var(--radix-accent-2)',
          3: 'var(--radix-accent-3)',
          4: 'var(--radix-accent-4)',
          5: 'var(--radix-accent-5)',
          6: 'var(--radix-accent-6)',
          7: 'var(--radix-accent-7)',
          8: 'var(--radix-accent-8)',
          9: 'var(--radix-accent-9)',
          10: 'var(--radix-accent-10)',
          11: 'var(--radix-accent-11)',
          12: 'var(--radix-accent-12)',
          contrast: 'var(--radix-accent-contrast)',
        },
        'radix-gray': {
          1: 'var(--radix-gray-1)',
          2: 'var(--radix-gray-2)',
          3: 'var(--radix-gray-3)',
          4: 'var(--radix-gray-4)',
          5: 'var(--radix-gray-5)',
          6: 'var(--radix-gray-6)',
          7: 'var(--radix-gray-7)',
          8: 'var(--radix-gray-8)',
          9: 'var(--radix-gray-9)',
          10: 'var(--radix-gray-10)',
          11: 'var(--radix-gray-11)',
          12: 'var(--radix-gray-12)',
          contrast: 'var(--radix-gray-contrast)',
        },
        'radix-red': {
          9: 'var(--radix-red-9)',
          10: 'var(--radix-red-10)',
          11: 'var(--radix-red-11)',
          12: 'var(--radix-red-12)',
          contrast: 'var(--radix-red-contrast)',
        },
        'radix-green': {
          9: 'var(--radix-green-9)',
          10: 'var(--radix-green-10)',
          11: 'var(--radix-green-11)',
          12: 'var(--radix-green-12)',
          contrast: 'var(--radix-green-contrast)',
        },
        'radix-orange': {
          9: 'var(--radix-orange-9)',
          10: 'var(--radix-orange-10)',
          11: 'var(--radix-orange-11)',
          12: 'var(--radix-orange-12)',
          contrast: 'var(--radix-orange-contrast)',
        },
      },
      
      // Map your spacing tokens
      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '7': 'var(--space-7)',
        '8': 'var(--space-8)',
        '9': 'var(--space-9)',
        '10': 'var(--space-10)',
        '11': 'var(--space-11)',
        '12': 'var(--space-12)',
        '14': 'var(--space-14)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '28': 'var(--space-28)',
        '32': 'var(--space-32)',
        '36': 'var(--space-36)',
        '40': 'var(--space-40)',
        '44': 'var(--space-44)',
        '48': 'var(--space-48)',
        '52': 'var(--space-52)',
        '56': 'var(--space-56)',
        '60': 'var(--space-60)',
        '64': 'var(--space-64)',
        '72': 'var(--space-72)',
        '80': 'var(--space-80)',
        '96': 'var(--space-96)',
        'px': 'var(--space-px)',
        '0.5': 'var(--space-0_5)',
        '1.5': 'var(--space-1_5)',
        '2.5': 'var(--space-2_5)',
        '3.5': 'var(--space-3_5)',
      },
      
      // Map your border radius tokens
      borderRadius: {
        'none': 'var(--radius-none)',
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius-base)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },
      
      // Map your shadow tokens
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-base)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
      },
      
      // Map your font tokens
      fontFamily: {
        'sans': ['var(--font-font-sans)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs': 'var(--font-text-xs)',
        'sm': 'var(--font-text-sm)',
        'base': 'var(--font-text-base)',
        'lg': 'var(--font-text-lg)',
        'xl': 'var(--font-text-xl)',
        '2xl': 'var(--font-text-2xl)',
        '3xl': 'var(--font-text-3xl)',
        '4xl': 'var(--font-text-4xl)',
        '5xl': 'var(--font-text-5xl)',
      },
      fontWeight: {
        'light': 'var(--font-weight-light)',
        'normal': 'var(--font-weight-normal)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
        'bold': 'var(--font-weight-bold)',
      },
      lineHeight: {
        'tight': 'var(--font-leading-tight)',
        'normal': 'var(--font-leading-normal)',
        'relaxed': 'var(--font-leading-relaxed)',
      },
    },
  },
  
  // Add custom utilities for Radix integration
  plugins: [
    ({ addUtilities, theme }) => {
      addUtilities({
        '.radix-button-primary': {
          backgroundColor: 'var(--radix-accent-9)',
          color: 'var(--radix-accent-contrast)',
          '&:hover': {
            backgroundColor: 'var(--radix-accent-10)',
          },
        },
        '.radix-button-secondary': {
          backgroundColor: 'var(--radix-gray-4)',
          color: 'var(--radix-gray-11)',
          '&:hover': {
            backgroundColor: 'var(--radix-gray-5)',
          },
        },
        '.radix-button-destructive': {
          backgroundColor: 'var(--radix-red-9)',
          color: 'var(--radix-red-contrast)',
          '&:hover': {
            backgroundColor: 'var(--radix-red-10)',
          },
        },
        '.radix-button-outline': {
          backgroundColor: 'transparent',
          borderColor: 'var(--radix-gray-6)',
          color: 'var(--radix-gray-12)',
          '&:hover': {
            backgroundColor: 'var(--radix-gray-4)',
          },
        },
        '.radix-button-ghost': {
          backgroundColor: 'transparent',
          color: 'var(--radix-gray-11)',
          '&:hover': {
            backgroundColor: 'var(--radix-gray-4)',
          },
        },
        '.radix-button-link': {
          backgroundColor: 'transparent',
          color: 'var(--radix-accent-11)',
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      });
    },
  ],
};
