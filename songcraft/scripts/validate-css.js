#!/usr/bin/env node

/**
 * CSS @apply Validator
 * 
 * This script validates @apply directives in CSS files to ensure
 * all referenced Tailwind classes are valid.
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';

// Common Tailwind classes that are likely to be used
const VALID_TAILWIND_CLASSES = new Set([
  // Layout
  'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid',
  'hidden', 'table', 'table-cell', 'table-row',
  
  // Spacing
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16', 'p-20', 'p-24', 'p-32', 'p-40', 'p-48', 'p-56', 'p-64', 'p-72', 'p-80', 'p-96',
  'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'px-10', 'px-12', 'px-16', 'px-20', 'px-24', 'px-32', 'px-40', 'px-48', 'px-56', 'px-64', 'px-72', 'px-80', 'px-96',
  'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-8', 'py-10', 'py-12', 'py-16', 'py-20', 'py-24', 'py-32', 'py-40', 'py-48', 'py-56', 'py-64', 'py-72', 'py-80', 'py-96',
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12', 'm-16', 'm-20', 'm-24', 'm-32', 'm-40', 'm-48', 'm-56', 'm-64', 'm-72', 'm-80', 'm-96',
  'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-8', 'mx-10', 'mx-12', 'mx-16', 'mx-20', 'mx-24', 'mx-32', 'mx-40', 'mx-48', 'mx-56', 'mx-64', 'mx-72', 'mx-80', 'mx-96',
  'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-8', 'my-10', 'my-12', 'my-16', 'my-20', 'my-24', 'my-32', 'my-40', 'my-48', 'my-56', 'my-64', 'my-72', 'my-80', 'my-96',
  
  // Colors
  'text-white', 'text-black', 'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
  'bg-white', 'bg-black', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
  'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900',
  'text-blue-50', 'text-blue-100', 'text-blue-200', 'text-blue-300', 'text-blue-400', 'text-blue-500', 'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
  
  // Typography
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
  'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
  'text-left', 'text-center', 'text-right', 'text-justify',
  
  // Borders
  'border', 'border-0', 'border-2', 'border-4', 'border-8',
  'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500',
  'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
  
  // Display
  'w-full', 'w-auto', 'w-fit', 'w-max', 'w-min', 'w-0', 'w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-8', 'w-10', 'w-12', 'w-16', 'w-20', 'w-24', 'w-32', 'w-40', 'w-48', 'w-56', 'w-64', 'w-72', 'w-80', 'w-96',
  'h-full', 'h-auto', 'h-fit', 'h-max', 'h-min', 'h-0', 'h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-8', 'h-10', 'h-12', 'h-16', 'h-20', 'h-24', 'h-32', 'h-40', 'h-48', 'h-56', 'h-64', 'h-72', 'h-80', 'h-96',
  'min-h-screen', 'min-h-full', 'min-h-0', 'min-h-1', 'min-h-2', 'min-h-3', 'min-h-4', 'min-h-5', 'min-h-6', 'min-h-8', 'min-h-10', 'min-h-12', 'min-h-16', 'min-h-20', 'min-h-24', 'min-h-32', 'min-h-40', 'min-h-48', 'min-h-56', 'min-h-64', 'min-h-72', 'min-h-80', 'min-h-96',
  
  // Focus states
  'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent',
  
  // Dark mode
  'dark:bg-surface-elevated', 'dark:text-fg-primary', 'dark:border-border-secondary', 'dark:focus:ring-brand-primary',
  
  // Custom theme classes (from your design system)
  'bg-surface-base', 'text-fg-primary', 'border-border-primary', 'focus:ring-brand-primary', 'placeholder:text-fg-tertiary',
  'bg-surface-elevated', 'text-fg-secondary', 'border-border-secondary',
]);

function validateApplyDirectives(css) {
  const errors = [];
  const applyRegex = /@apply\s+([^;]+);/g;
  let match;
  
  while ((match = applyRegex.exec(css)) !== null) {
    const classes = match[1].trim().split(/\s+/);
    
    for (const className of classes) {
      if (!VALID_TAILWIND_CLASSES.has(className)) {
        errors.push({
          class: className,
          line: css.substring(0, match.index).split('\n').length,
          column: match.index - css.lastIndexOf('\n', match.index)
        });
      }
    }
  }
  
  return errors;
}

async function validateCSSFiles(pattern = 'src/**/*.css') {
  const files = await glob(pattern);
  let hasErrors = false;
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const errors = validateApplyDirectives(content);
      
      if (errors.length > 0) {
        hasErrors = true;
        console.error(`\n❌ ${file}:`);
        for (const error of errors) {
          console.error(`  Line ${error.line}: Invalid Tailwind class "${error.class}"`);
        }
      } else {
        console.log(`✅ ${file}: No @apply errors found`);
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.error('\n🚨 CSS validation failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 All CSS files are valid!');
  }
}

// Run validation
const pattern = process.argv[2] || 'src/**/*.css';
validateCSSFiles(pattern).catch(console.error);
