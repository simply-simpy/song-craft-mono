#!/usr/bin/env node

/**
 * Smart CSS @apply Validator
 *
 * This script validates @apply directives with intelligent detection of:
 * 1. Valid Tailwind classes (using patterns)
 * 2. Custom theme classes (prefixed with design tokens)
 * 3. Arbitrary value classes (e.g., w-[200px])
 * 4. Responsive/variant classes (e.g., sm:, hover:, dark:)
 */

import { readFileSync } from 'fs';
import { glob } from 'glob';

// Tailwind class patterns for validation
const TAILWIND_PATTERNS = {
  // Layout & Display
  layout: /^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden|table|table-cell|table-row)$/,

  // Spacing (padding, margin)
  spacing: /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/,

  // Sizing
  sizing: /^(w|h|min-w|min-h|max-w|max-h)-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|auto|full|screen|fit|max|min)$/,

  // Colors (basic set)
  colors: /^(text|bg|border)-(white|black|transparent|current|inherit|gray|red|blue|green|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900)$/,

  // Placeholder colors
  placeholder: /^placeholder:(text|bg)-(white|black|transparent|gray|red|blue|green|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900)$/,

  // Ring utilities
  ring: /^ring(-(\d+|offset-\d+))?$/,
  ringColor: /^ring-(white|black|transparent|gray|red|blue|green|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900)$/,

  // Outline
  outline: /^outline-none$/,

  // Resize
  resize: /^resize-(none|y|x|both)$/,

  // Space between
  space: /^space-(x|y)-(\d+|0\.5|1\.5|2\.5|3\.5)$/,

  // Typography
  typography: /^(text)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
  fontWeight: /^(font)-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  textAlign: /^(text)-(left|center|right|justify)$/,

  // Borders
  borders: /^(border|rounded)(-?(0|2|4|8|sm|md|lg|xl|2xl|3xl|full))?$/,

  // Focus states
  focus: /^(focus|focus-visible):(outline-none|ring-\d+|ring-\w+-\d+|border-transparent)$/,

  // Transitions
  transitions: /^(transition|duration|ease)-(colors|all|opacity|transform|shadow|none|\d+|in|out|in-out)$/,

  // Arbitrary values (e.g., w-[200px], bg-[#123456])
  arbitrary: /^[a-z-]+\[[^\]]+\]$/,

  // Responsive/variant prefixes
  variants: /^(sm|md|lg|xl|2xl|hover|focus|active|disabled|dark|light):/,
};

// Custom theme classes (your design system)
const CUSTOM_THEME_CLASSES = new Set([
  // Surface colors
  'bg-surface-base', 'bg-surface-elevated', 'bg-surface-hover',
  'dark:bg-surface-base', 'dark:bg-surface-elevated',

  // Text colors
  'text-fg-primary', 'text-fg-secondary', 'text-fg-tertiary',
  'dark:text-fg-primary', 'dark:text-fg-secondary',

  // Border colors
  'border-border-primary', 'border-border-secondary', 'border-border-focus',
  'dark:border-border-primary', 'dark:border-border-secondary',

  // Brand colors
  'bg-brand-primary', 'bg-brand-hover', 'text-brand-primary', 'text-brand-hover',
  'hover:bg-brand-hover', 'hover:text-brand-hover', 'focus:ring-brand-primary',

  // Semantic colors
  'bg-bg-brand', 'bg-bg-destructive', 'bg-bg-overlay',
  'text-fg-on-brand', 'text-fg-on-destructive',

  // Form controls
  'form-control',

  // Custom sizing
  'max-w-none',

  // Custom spacing
  'space-y-1.5', 'space-x-2', 'gap-4', 'gap-1',

  // Custom positioning
  'left-[50%]', 'top-[50%]', 'translate-x-[-50%]', 'translate-y-[-50%]',
  'inset-0', 'z-50', 'fixed', 'absolute', 'relative',

  // Custom sizing
  'min-h-[200px]', 'min-w-5', 'max-w-lg', 'w-14', 'h-14',

  // Custom effects
  'backdrop-blur-sm', 'shadow-sm', 'shadow-lg', 'shadow-xl',
  'ring-offset-1', 'ring-offset-2', 'ring-4',

  // Custom opacity
  'opacity-75', 'opacity-50',

  // Custom borders
  'border-l-2', 'border-l-4', 'border-r', 'rounded-l-none', 'rounded-r-none', 'rounded-t-md',

  // Custom margins
  '-ml-px', '-top-1', '-right-1', 'bottom-6', 'right-6',

  // Custom padding
  'py-0.5', 'py-1.5', 'pl-4', 'pl-6', 'pt-4',

  // Custom text
  'leading-none', 'tracking-tight', 'font-mono', 'whitespace-nowrap',

  // Custom flexbox
  'flex-col', 'flex-col-reverse', 'items-center', 'justify-center', 'justify-end',
  'sm:flex-row', 'sm:justify-end', 'sm:text-left', 'sm:space-x-2',

  // Custom grid
  'grid-cols-2', 'grid-cols-3',

  // Custom lists
  'list-disc', 'list-decimal',

  // Custom states
  'cursor-not-allowed', 'cursor-pointer', 'pointer-events-none',
  'disabled:opacity-50', 'disabled:cursor-not-allowed', 'disabled:pointer-events-none',
  'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-offset-2',

  // Custom colors with opacity
  'bg-bg-destructive/90', 'bg-bg-overlay/80', 'hover:text-brand-primary/80',
  'focus:ring-brand-primary/25', 'dark:bg-gray-800/50', 'dark:bg-blue-900/20',
  'dark:bg-green-900/20', 'dark:bg-purple-900/20', 'dark:bg-orange-900/20',
  'dark:bg-gray-900/20', 'bg-brand-primary/20',

  // Custom colors
  'bg-green-50', 'bg-purple-50', 'bg-orange-50',
  'border-blue-500', 'border-green-500', 'border-purple-500', 'border-orange-500',
  'text-red-500', 'bg-red-600', 'border-red-500', 'focus:ring-red-500',
  'hover:opacity-90', 'hover:shadow-xl', 'hover:underline',
  'hover:bg-gray-50', 'hover:bg-gray-100', 'hover:bg-gray-200', 'hover:text-gray-900',
  'dark:hover:bg-gray-700', 'dark:bg-gray-800',

  // Custom margins
  'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-6', 'mt-1',

  // Custom padding
  'px-4', 'py-2',

  // Custom text
  'italic', 'underline', 'line-through',

  // Custom positioning
  'float-left',

  // Additional valid Tailwind classes found in your CSS
  'text-white', 'bg-white', 'bg-transparent',
  'placeholder-gray-500', 'placeholder:text-fg-tertiary',
  'resize-none', 'space-y-2', 'space-x-3',
  'border-b', 'rounded-r', 'ring-2', 'ring-brand-primary',
  'outline-none', 'text-fg-brand', 'border-brand-primary',

  // Lyrics editor specific classes
  'border-dashed', 'items-start', 'gap-3', 'scale-95',
  'flex-shrink-0', 'cursor-grab', 'cursor-grabbing',
  'flex-1', 'gap-2', 'uppercase', 'tracking-wide',
  'ml-auto', 'border-none', 'leading-relaxed',
  'bg-blue-50/30', 'bg-green-50/30', 'bg-purple-50/30',
  'bg-orange-50/30', 'bg-gray-50/30', 'bg-gray-50/20',
  'flex-wrap',
]);

function isValidTailwindClass(className) {
  // Check if it's a custom theme class
  if (CUSTOM_THEME_CLASSES.has(className)) {
    return true;
  }

  // Check against Tailwind patterns
  for (const pattern of Object.values(TAILWIND_PATTERNS)) {
    if (pattern.test(className)) {
      return true;
    }
  }

  return false;
}

function validateApplyDirectives(css) {
  const errors = [];
  const warnings = [];

  // Remove CSS comments before processing @apply directives
  const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  const applyRegex = /@apply\s+([^;]+);/g;
  let match;

  while ((match = applyRegex.exec(cssWithoutComments)) !== null) {
    const classes = match[1].trim().split(/\s+/);
    const line = cssWithoutComments.substring(0, match.index).split('\n').length;

    for (const className of classes) {
      // Skip empty strings
      if (!className.trim()) continue;

      if (!isValidTailwindClass(className)) {
        // Check if it looks like malformed CSS
        if (className.includes('{') || className.includes('}') || className.includes('/*') || className.includes('*/')) {
          warnings.push({
            class: className,
            line,
            type: 'malformed',
            message: 'Possible malformed CSS - check for unclosed braces or comments'
          });
        } else {
          errors.push({
            class: className,
            line,
            type: 'invalid',
            message: 'Invalid Tailwind class'
          });
        }
      }
    }
  }

  return { errors, warnings };
}

async function validateCSSFiles(pattern = 'src/**/*.css') {
  const files = await glob(pattern);
  let hasErrors = false;
  let hasWarnings = false;

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const { errors, warnings } = validateApplyDirectives(content);

      if (errors.length > 0 || warnings.length > 0) {
        console.log(`\n📄 ${file}:`);

        if (errors.length > 0) {
          hasErrors = true;
          console.error('  ❌ Errors:');
          for (const error of errors) {
            console.error(`    Line ${error.line}: ${error.message} "${error.class}"`);
          }
        }

        if (warnings.length > 0) {
          hasWarnings = true;
          console.warn('  ⚠️  Warnings:');
          for (const warning of warnings) {
            console.warn(`    Line ${warning.line}: ${warning.message} "${warning.class}"`);
          }
        }
      } else {
        console.log(`✅ ${file}: No @apply issues found`);
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n🚨 CSS validation failed! Fix errors before proceeding.');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('\n⚠️  CSS validation completed with warnings. Review warnings above.');
  } else {
    console.log('\n🎉 All CSS files are valid!');
  }
}

// Run validation
const pattern = process.argv[2] || 'src/**/*.css';
validateCSSFiles(pattern).catch(console.error);