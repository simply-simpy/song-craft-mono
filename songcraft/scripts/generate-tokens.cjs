#!/usr/bin/env node

/**
 * Build script to generate CSS tokens from TypeScript tokens
 * 
 * This script runs at build time to convert our semantic tokens
 * into a CSS file that can be imported by the app.
 */

const path = require('path');
const fs = require('fs');

// We need to compile the TypeScript files first for this to work
// For now, we'll create the CSS directly in this script

const tokens = {
  semantic: {
    bg: {
      primary: 'hsl(210 20% 98%)',
      secondary: 'hsl(210 20% 95%)',
      tertiary: 'hsl(210 16% 93%)',
      hover: 'hsl(210 20% 95%)',
      active: 'hsl(210 16% 93%)',
      selected: 'hsl(213 100% 96%)',
      brand: 'hsl(217 91% 60%)',
      accent: 'hsl(142 76% 36%)',
      destructive: 'hsl(0 84% 60%)',
      warning: 'hsl(38 92% 50%)',
      success: 'hsl(142 76% 36%)',
      overlay: 'hsl(0 0% 0% / 0.5)',
      disabled: 'hsl(210 20% 95%)',
    },
    fg: {
      primary: 'hsl(210 11% 15%)',
      secondary: 'hsl(210 7% 56%)',
      tertiary: 'hsl(210 11% 71%)',
      disabled: 'hsl(210 14% 83%)',
      hover: 'hsl(210 12% 8%)',
      active: 'hsl(210 12% 8%)',
      brand: 'hsl(221 83% 53%)',
      accent: 'hsl(142 72% 29%)',
      destructive: 'hsl(0 72% 51%)',
      warning: 'hsl(32 95% 44%)',
      success: 'hsl(142 72% 29%)',
      'on-brand': 'hsl(210 20% 98%)',
      'on-accent': 'hsl(210 20% 98%)',
      'on-destructive': 'hsl(210 20% 98%)',
    },
    surface: {
      base: 'hsl(210 20% 98%)',
      elevated: '#ffffff',
      sunken: 'hsl(210 20% 95%)',
      hover: 'hsl(210 20% 95%)',
      active: 'hsl(210 16% 93%)',
      brand: 'hsl(213 100% 96%)',
      accent: 'hsl(138 76% 97%)',
      destructive: 'hsl(0 86% 97%)',
      warning: 'hsl(48 100% 96%)',
      success: 'hsl(138 76% 97%)',
    },
    border: {
      primary: 'hsl(210 14% 89%)',
      secondary: 'hsl(210 16% 93%)',
      hover: 'hsl(210 14% 83%)',
      focus: 'hsl(217 91% 60%)',
      destructive: 'hsl(0 94% 82%)',
      warning: 'hsl(46 87% 65%)',
      success: 'hsl(142 77% 73%)',
    },
    brand: {
      primary: 'hsl(217 91% 60%)',
      secondary: 'hsl(213 94% 68%)',
      tertiary: 'hsl(212 96% 78%)',
      hover: 'hsl(221 83% 53%)',
      active: 'hsl(224 76% 48%)',
    },
  },
  dark: {
    bg: {
      primary: 'hsl(210 12% 8%)',
      secondary: 'hsl(210 11% 15%)',
      tertiary: 'hsl(210 10% 23%)',
      hover: 'hsl(210 10% 23%)',
      active: 'hsl(210 9% 31%)',
      selected: 'hsl(226 55% 21%)',
      overlay: 'hsl(0 0% 0% / 0.8)',
      disabled: 'hsl(210 10% 23%)',
    },
    fg: {
      primary: 'hsl(210 20% 98%)',
      secondary: 'hsl(210 14% 83%)',
      tertiary: 'hsl(210 11% 71%)',
      disabled: 'hsl(210 7% 56%)',
      hover: 'hsl(210 20% 98%)',
      active: 'hsl(210 20% 98%)',
      brand: 'hsl(213 94% 68%)',
      accent: 'hsl(142 69% 58%)',
      destructive: 'hsl(0 91% 71%)',
      warning: 'hsl(43 74% 66%)',
      success: 'hsl(142 69% 58%)',
    },
    surface: {
      base: 'hsl(210 12% 8%)',
      elevated: 'hsl(210 11% 15%)',
      sunken: 'hsl(210 12% 8%)',
      hover: 'hsl(210 10% 23%)',
      active: 'hsl(210 9% 31%)',
      brand: 'hsl(226 55% 21%)',
      accent: 'hsl(145 80% 9%)',
      destructive: 'hsl(0 75% 15%)',
      warning: 'hsl(21 92% 14%)',
      success: 'hsl(145 80% 9%)',
    },
    border: {
      primary: 'hsl(210 9% 31%)',
      secondary: 'hsl(210 10% 23%)',
      hover: 'hsl(210 7% 56%)',
      focus: 'hsl(217 91% 60%)',
      destructive: 'hsl(0 74% 42%)',
      warning: 'hsl(26 90% 37%)',
      success: 'hsl(142 69% 24%)',
    },
  },
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
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
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

// Helper function to convert nested objects to CSS custom properties
function objectToCssVars(obj, prefix = '') {
  let css = '';
  
  for (const [key, value] of Object.entries(obj)) {
    const cssKey = `--${prefix}${prefix ? '-' : ''}${key}`;
    
    if (typeof value === 'object' && value !== null) {
      css += objectToCssVars(value, `${prefix}${prefix ? '-' : ''}${key}`);
    } else {
      css += `  ${cssKey}: ${value};\n`;
    }
  }
  
  return css;
}

// Generate the complete CSS file
function generateCss() {
  return `/* Generated Design Tokens - Do not edit manually */
/* This file is auto-generated from design tokens */

/* Light Theme (Default) */
:root {
${objectToCssVars(tokens.semantic)}
${objectToCssVars(tokens.typography, 'font')}
${objectToCssVars(tokens.spacing, 'space')}
${objectToCssVars(tokens.shadows, 'shadow')}
${objectToCssVars(tokens.radius, 'radius')}
${objectToCssVars(tokens.animation, 'animate')}
}

/* Dark Theme */
[data-theme="dark"] {
${objectToCssVars(tokens.dark)}
}

/* Component-specific CSS variables */
:root {
  /* Focus ring using semantic tokens */
  --focus-ring: 0 0 0 2px var(--border-focus);
  --focus-ring-offset: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--border-focus);
  
  /* Component sizes */
  --button-height-sm: 2rem;
  --button-height-base: 2.25rem;
  --button-height-lg: 2.5rem;
  
  --input-height-sm: 2rem;
  --input-height-base: 2.25rem;
  --input-height-lg: 2.5rem;
  
  /* Z-index scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
}

/* Utility classes for common patterns */
.focus-ring {
  outline: none;
  box-shadow: var(--focus-ring);
}

.focus-ring-offset {
  outline: none;
  box-shadow: var(--focus-ring-offset);
}

/* Animation utilities */
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

/* Common animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scale-out {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}

.fade-in { animation-name: fade-in; }
.fade-out { animation-name: fade-out; }
.scale-in { animation-name: scale-in; }
.scale-out { animation-name: scale-out; }
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