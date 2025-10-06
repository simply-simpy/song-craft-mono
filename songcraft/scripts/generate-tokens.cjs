#!/usr/bin/env node

/**
 * Enhanced Design Token Generator
 * 
 * Generates CSS custom properties with:
 * - HSL fallback values for broad browser support
 * - OKLCH progressive enhancement for better color science
 * - Proper CSS syntax and formatting
 * - Component-specific utilities
 */

const path = require('node:path');
const fs = require('node:fs');

// Token definitions using proper Radix color references
const tokens = {
  // Light theme using Radix color variables
  light: {
    bg: {
      // Map to Radix color variables (these will be resolved at runtime)
      primary: 'var(--slate-1)',
      secondary: 'var(--slate-2)',
      tertiary: 'var(--slate-3)',
      hover: 'var(--slate-2)',
      active: 'var(--slate-3)',
      selected: 'var(--blue-3)',
      brand: 'var(--blue-9)',
      accent: 'var(--jade-9)',
      destructive: 'var(--red-9)',
      warning: 'var(--amber-9)',
      success: 'var(--jade-9)',
      overlay: 'rgba(0, 0, 0, 0.5)',
      disabled: 'var(--slate-2)',
    },
    fg: {
      primary: 'var(--slate-12)',
      secondary: 'var(--slate-11)',
      tertiary: 'var(--slate-10)',
      disabled: 'var(--slate-8)',
      hover: 'var(--slate-12)',
      active: 'var(--slate-12)',
      brand: 'var(--blue-11)',
      accent: 'var(--jade-11)',
      destructive: 'var(--red-11)',
      warning: 'var(--amber-11)',
      success: 'var(--jade-11)',
      'on-brand': '#fff',
      'on-accent': '#fff',
      'on-destructive': '#fff',
    },
    surface: {
      base: 'var(--slate-1)',
      elevated: '#ffffff',
      sunken: 'var(--slate-2)',
      hover: 'var(--slate-2)',
      active: 'var(--slate-3)',
      brand: 'var(--blue-3)',
      accent: 'var(--jade-3)',
      destructive: 'var(--red-3)',
      warning: 'var(--amber-3)',
      success: 'var(--jade-3)',
    },
    border: {
      primary: 'var(--slate-4)',
      secondary: 'var(--slate-3)',
      hover: 'var(--slate-6)',
      focus: 'var(--blue-9)',
      destructive: 'var(--red-6)',
      warning: 'var(--amber-6)',
      success: 'var(--jade-6)',
    },
    brand: {
      primary: 'var(--blue-9)',
      secondary: 'var(--blue-10)',
      tertiary: 'var(--blue-11)',
      hover: 'var(--blue-10)',
      active: 'var(--blue-9)',
    },
  },
  dark: {
    bg: {
      primary: 'var(--slate-1)',
      secondary: 'var(--slate-2)',
      tertiary: 'var(--slate-3)',
      hover: 'var(--slate-3)',
      active: 'var(--slate-4)',
      selected: 'var(--blue-4)',
      overlay: 'rgba(0, 0, 0, 0.8)',
      disabled: 'var(--slate-3)',
    },
    fg: {
      primary: 'var(--slate-12)',
      secondary: 'var(--slate-11)',
      tertiary: 'var(--slate-10)',
      disabled: 'var(--slate-8)',
      hover: 'var(--slate-12)',
      active: 'var(--slate-12)',
      brand: 'var(--blue-11)',
      accent: 'var(--jade-11)',
      destructive: 'var(--red-11)',
      warning: 'var(--amber-11)',
      success: 'var(--jade-11)',
    },
    surface: {
      base: 'var(--slate-1)',
      elevated: 'var(--slate-2)',
      sunken: 'var(--slate-1)',
      hover: 'var(--slate-3)',
      active: 'var(--slate-4)',
      brand: 'var(--blue-4)',
      accent: 'var(--jade-4)',
      destructive: 'var(--red-4)',
      warning: 'var(--amber-4)',
      success: 'var(--jade-4)',
    },
    border: {
      primary: 'var(--slate-6)',
      secondary: 'var(--slate-4)',
      hover: 'var(--slate-8)',
      focus: 'var(--blue-9)',
      destructive: 'var(--red-7)',
      warning: 'var(--amber-7)',
      success: 'var(--jade-7)',
    },
  },

  // Non-color tokens (unchanged)
  typography: {
    font: {
      sans: 'Lato, system-ui, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, monospace',
    },
    text: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    weight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    leading: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    0: '0',
    px: '1px',
    '0_5': '0.125rem',   
    1: '0.25rem',
    '1_5': '0.375rem',   
    2: '0.5rem',
    '2_5': '0.625rem', 
    3: '0.75rem',
    '3_5': '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  radius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

// Helper function to generate CSS variables from nested objects
function generateColorVars(colors, prefix = '') {
  let css = '';
  
  for (const [key, value] of Object.entries(colors)) {
    const cssVar = `--${prefix}${prefix ? '-' : ''}${key}`;
    if (typeof value === 'object' && value !== null) {
      css += generateColorVars(value, `${prefix}${prefix ? '-' : ''}${key}`);
    } else {
      css += `  ${cssVar}: ${value};\n`;
    }
  }
  
  return css;
}

function generateTokenVars(tokenObj, prefix = '') {
  let css = '';
  
  for (const [key, value] of Object.entries(tokenObj)) {
    const cssVar = `--${prefix}${prefix ? '-' : ''}${key}`;
    if (typeof value === 'object' && value !== null) {
      css += generateTokenVars(value, `${prefix}${prefix ? '-' : ''}${key}`);
    } else {
      css += `  ${cssVar}: ${value};\n`;
    }
  }
  
  return css;
}

// Generate the CSS file using Radix colors
function generateCss() {
  return `/* Generated Design Tokens - Radix-backed colors (Blue theme)
   NOTE: Requires @radix-ui/colors imports in radix-colors.css:
   - blue.css, blue-dark.css (accent)
   - slate.css, slate-dark.css (neutral)
   - red.css/red-dark.css (destructive), jade.css/jade-dark.css (success), amber.css/amber-dark.css (warning)
*/

/* =======================
   Light Theme (Radix aliases)
   ======================= */
:root {
  /* Colors (Radix ramps) */
${generateColorVars(tokens.light)}

  /* Typography / space / radii / shadows (unchanged) */
${generateTokenVars(tokens.typography, 'font')}
${generateTokenVars(tokens.spacing, 'space')}
${generateTokenVars(tokens.shadows, 'shadow')}
${generateTokenVars(tokens.radius, 'radius')}
${generateTokenVars(tokens.animation, 'animate')}
}

/* =======================
   Dark Theme (Radix aliases)
   ======================= */
[data-theme="dark"] {
${generateColorVars(tokens.dark)}
}

/* =======================
   Component-specific
   ======================= */
:root {
  --focus-ring: 0 0 0 2px var(--border-focus);
  --focus-ring-offset: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--border-focus);

  --button-height-sm: 2rem;
  --button-height-base: 2.25rem;
  --button-height-lg: 2.5rem;

  --input-height-sm: 2rem;
  --input-height-base: 2.25rem;
  --input-height-lg: 2.5rem;

  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
}

/* Utilities */
.focus-ring {
  outline: none;
  box-shadow: var(--focus-ring);
}
.focus-ring-offset {
  outline: none;
  box-shadow: var(--focus-ring-offset);
}

.animate-in {
  animation-duration: var(--animate-duration-normal);
  animation-timing-function: var(--animate-easing-ease-out);
  animation-fill-mode: both;
}
.animate-out {
  animation-duration: var(--animate-duration-fast);
  animation-timing-function: var(--animate-easing-ease-in);
  animation-fill-mode: both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes scale-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

.fade-in {
  animation-name: fade-in;
}
.fade-out {
  animation-name: fade-out;
}
.scale-in {
  animation-name: scale-in;
}
.scale-out {
  animation-name: scale-out;
}
`;
}

// Write the CSS file
const outputPath = path.join(__dirname, '../src/styles/tokens.css');
const outputDir = path.dirname(outputPath);

// Ensure the directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the file
fs.writeFileSync(outputPath, generateCss(), 'utf8');

console.log('✅ Generated design tokens CSS at:', outputPath);