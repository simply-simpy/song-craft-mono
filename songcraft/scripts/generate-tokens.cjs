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

const path = require('path');
const fs = require('fs');

// Token definitions with HSL fallbacks and OKLCH values
const tokens = {
  // HSL fallback values (broad browser support)
  hsl: {
    light: {
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
  },

  // OKLCH values for progressive enhancement
  oklch: {
    light: {
      bg: {
        primary: 'oklch(98.43% 0.0017 247.84)',
        secondary: 'oklch(96.07% 0.0044 247.87)',
        tertiary: 'oklch(94.52% 0.0049 247.88)',
        hover: 'oklch(96.07% 0.0044 247.87)',
        active: 'oklch(94.52% 0.0049 247.88)',
        selected: 'oklch(96.29% 0.0180 253.34)',
        brand: 'oklch(62.61% 0.1859 259.60)',
        accent: 'oklch(62.30% 0.1688 149.18)',
        destructive: 'oklch(63.56% 0.2082 25.38)',
        warning: 'oklch(76.97% 0.1645 70.61)',
        success: 'oklch(62.30% 0.1688 149.18)',
        overlay: 'oklch(0% 0 0 / 0.5)',
        disabled: 'oklch(96.07% 0.0044 247.87)',
      },
      fg: {
        primary: 'oklch(26.72% 0.0099 248.20)',
        secondary: 'oklch(64.55% 0.0149 248.06)',
        tertiary: 'oklch(76.93% 0.0148 248.02)',
        disabled: 'oklch(86.60% 0.0107 247.95)',
        hover: 'oklch(19.14% 0.0063 248.16)',
        active: 'oklch(19.14% 0.0063 248.16)',
        brand: 'oklch(54.49% 0.2154 262.74)',
        accent: 'oklch(52.48% 0.1373 149.83)',
        destructive: 'oklch(57.86% 0.2137 27.17)',
        warning: 'oklch(66.88% 0.1588 57.96)',
        success: 'oklch(52.48% 0.1373 149.83)',
        'on-brand': 'oklch(98.43% 0.0017 247.84)',
        'on-accent': 'oklch(98.43% 0.0017 247.84)',
        'on-destructive': 'oklch(98.43% 0.0017 247.84)',
      },
      surface: {
        base: 'oklch(98.43% 0.0017 247.84)',
        elevated: 'oklch(100% 0 0)',
        sunken: 'oklch(96.07% 0.0044 247.87)',
        hover: 'oklch(96.07% 0.0044 247.87)',
        active: 'oklch(94.52% 0.0049 247.88)',
        brand: 'oklch(96.29% 0.0180 253.34)',
        accent: 'oklch(98.36% 0.0162 155.55)',
        destructive: 'oklch(96.78% 0.0142 17.40)',
        warning: 'oklch(98.66% 0.0218 95.28)',
        success: 'oklch(98.36% 0.0162 155.55)',
      },
      border: {
        primary: 'oklch(91.38% 0.0068 247.90)',
        secondary: 'oklch(94.52% 0.0049 247.88)',
        hover: 'oklch(86.60% 0.0107 247.95)',
        focus: 'oklch(62.61% 0.1859 259.60)',
        destructive: 'oklch(80.98% 0.1025 19.54)',
        warning: 'oklch(86.42% 0.1416 92.19)',
        success: 'oklch(87.12% 0.1370 154.59)',
      },
      brand: {
        primary: 'oklch(62.61% 0.1859 259.60)',
        secondary: 'oklch(71.57% 0.1425 254.45)',
        tertiary: 'oklch(80.43% 0.0976 252.31)',
        hover: 'oklch(54.49% 0.2154 262.74)',
        active: 'oklch(48.96% 0.2153 264.27)',
      },
    },
    dark: {
      bg: {
        primary: 'oklch(19.14% 0.0063 248.16)',
        secondary: 'oklch(26.72% 0.0099 248.20)',
        tertiary: 'oklch(34.77% 0.0130 248.20)',
        hover: 'oklch(34.77% 0.0130 248.20)',
        active: 'oklch(42.40% 0.0150 248.18)',
        selected: 'oklch(35.05% 0.0659 258.68)',
        overlay: 'oklch(0% 0 0 / 0.8)',
        disabled: 'oklch(34.77% 0.0130 248.20)',
      },
      fg: {
        primary: 'oklch(98.43% 0.0017 247.84)',
        secondary: 'oklch(86.60% 0.0107 247.95)',
        tertiary: 'oklch(76.93% 0.0148 248.02)',
        disabled: 'oklch(64.55% 0.0149 248.06)',
        hover: 'oklch(98.43% 0.0017 247.84)',
        active: 'oklch(98.43% 0.0017 247.84)',
        brand: 'oklch(71.57% 0.1425 254.45)',
        accent: 'oklch(73.41% 0.1819 149.33)',
        destructive: 'oklch(78.63% 0.1861 23.24)',
        warning: 'oklch(82.88% 0.1591 74.22)',
        success: 'oklch(73.41% 0.1819 149.33)',
      },
      surface: {
        base: 'oklch(19.14% 0.0063 248.16)',
        elevated: 'oklch(26.72% 0.0099 248.20)',
        sunken: 'oklch(19.14% 0.0063 248.16)',
        hover: 'oklch(34.77% 0.0130 248.20)',
        active: 'oklch(42.40% 0.0150 248.18)',
        brand: 'oklch(35.05% 0.0659 258.68)',
        accent: 'oklch(24.21% 0.1215 152.06)',
        destructive: 'oklch(27.31% 0.0991 21.32)',
        warning: 'oklch(29.15% 0.0979 70.33)',
        success: 'oklch(24.21% 0.1215 152.06)',
      },
      border: {
        primary: 'oklch(42.40% 0.0150 248.18)',
        secondary: 'oklch(34.77% 0.0130 248.20)',
        hover: 'oklch(64.55% 0.0149 248.06)',
        focus: 'oklch(62.61% 0.1859 259.60)',
        destructive: 'oklch(55.76% 0.1280 19.06)',
        warning: 'oklch(58.86% 0.1477 78.69)',
        success: 'oklch(43.86% 0.1299 155.16)',
      },
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
    '0_5': '0.125rem',  // Use underscore instead of dot
    1: '0.25rem',
    '1_5': '0.375rem',  // Use underscore instead of dot
    2: '0.5rem',
    '2_5': '0.625rem',  // Use underscore instead of dot
    3: '0.75rem',
    '3_5': '0.875rem',  // Use underscore instead of dot
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
  
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = `--${prefix}${prefix ? '-' : ''}${key}`;
    if (typeof value === 'object' && value !== null) {
      css += generateColorVars(value, `${prefix}${prefix ? '-' : ''}${key}`);
    } else {
      css += `  ${cssVar}: ${value};\n`;
    }
  });
  
  return css;
}

function generateTokenVars(tokenObj, prefix = '') {
  let css = '';
  
  Object.entries(tokenObj).forEach(([key, value]) => {
    const cssVar = `--${prefix}${prefix ? '-' : ''}${key}`;
    if (typeof value === 'object' && value !== null) {
      css += generateTokenVars(value, `${prefix}${prefix ? '-' : ''}${key}`);
    } else {
      css += `  ${cssVar}: ${value};\n`;
    }
  });
  
  return css;
}

// Generate the enhanced CSS file with OKLCH support
function generateCss() {
  return `/* Generated Design Tokens - Do not edit manually */
/* This file is auto-generated from design tokens */

/* =======================
   Light Theme (fallbacks)
   ======================= */
:root {
  /* Colors (HSL fallbacks) */
${generateColorVars(tokens.hsl.light)}

  /* Typography / space / radii / shadows (unchanged) */
${generateTokenVars(tokens.typography, 'font')}
${generateTokenVars(tokens.spacing, 'space')}
${generateTokenVars(tokens.shadows, 'shadow')}
${generateTokenVars(tokens.radius, 'radius')}
${generateTokenVars(tokens.animation, 'animate')}
}

/* =======================
   Dark Theme (fallbacks)
   ======================= */
[data-theme="dark"] {
${generateColorVars(tokens.hsl.dark)}
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
.focus-ring { outline: none; box-shadow: var(--focus-ring); }
.focus-ring-offset { outline: none; box-shadow: var(--focus-ring-offset); }

.animate-in { animation-duration: var(--animate-duration-normal); animation-timing-function: var(--animate-easing-ease-out); animation-fill-mode: both; }
.animate-out { animation-duration: var(--animate-duration-fast);   animation-timing-function: var(--animate-easing-ease-in);  animation-fill-mode: both; }

@keyframes fade-in { from{opacity:0} to{opacity:1} }
@keyframes fade-out { from{opacity:1} to{opacity:0} }
@keyframes scale-in { from{transform:scale(.95);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes scale-out { from{transform:scale(1);opacity:1} to{transform:scale(.95);opacity:0} }
.fade-in{ animation-name: fade-in } .fade-out{ animation-name: fade-out }
.scale-in{ animation-name: scale-in } .scale-out{ animation-name: scale-out }

/* ======================================
   Progressive enhancement: OKLCH overrides
   ====================================== */
@supports (color: oklch(0% 0 0)) {
  :root {
${generateColorVars(tokens.oklch.light)}
  }

  [data-theme="dark"] {
${generateColorVars(tokens.oklch.dark)}
  }
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