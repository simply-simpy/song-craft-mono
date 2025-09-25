/**
 * UI Utilities
 * 
 * Utility functions for working with our design system components.
 * These are used by both the new ui-v2 components and can be 
 * gradually adopted by existing components.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Focus ring utility classes
 * Consistent focus management across the design system
 */
export const focusRing = {
  // Basic focus ring using semantic tokens
  base: 'focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg-primary',
  
  // Focus ring without offset (for elements inside other focused elements)
  inset: 'focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-inset',
  
  // Destructive focus ring
  destructive: 'focus:outline-none focus:ring-2 focus:ring-border-destructive focus:ring-offset-2 focus:ring-offset-bg-primary',
} as const;

/**
 * Common component size variants
 * Standardized sizing across components
 */
export const sizes = {
  sm: 'sm',
  base: 'base', 
  lg: 'lg',
} as const;

/**
 * Common component variants
 * Standardized visual variants across components
 */
export const variants = {
  primary: 'primary',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
} as const;

/**
 * Common intent variants for semantic meaning
 * Used for buttons, alerts, etc.
 */
export const intents = {
  default: 'default',
  brand: 'brand',
  accent: 'accent',
  destructive: 'destructive',
  warning: 'warning',
  success: 'success',
} as const;

/**
 * Animation utilities
 * Consistent animations using semantic tokens
 */
export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',
  
  // Scale animations
  scaleIn: 'animate-in scale-in',
  scaleOut: 'animate-out scale-out',
  
  // Slide animations
  slideInFromTop: 'animate-in slide-in-from-top',
  slideInFromBottom: 'animate-in slide-in-from-bottom',
  slideInFromLeft: 'animate-in slide-in-from-left',
  slideInFromRight: 'animate-in slide-in-from-right',
} as const;

/**
 * Z-index utilities
 * Consistent layering using semantic tokens
 */
export const zIndex = {
  dropdown: 'z-[var(--z-dropdown)]',
  sticky: 'z-[var(--z-sticky)]',
  fixed: 'z-[var(--z-fixed)]',
  modalBackdrop: 'z-[var(--z-modal-backdrop)]',
  modal: 'z-[var(--z-modal)]',
  popover: 'z-[var(--z-popover)]',
  tooltip: 'z-[var(--z-tooltip)]',
  toast: 'z-[var(--z-toast)]',
} as const;

/**
 * Type utilities for component props
 */
export type Size = keyof typeof sizes;
export type Variant = keyof typeof variants;
export type Intent = keyof typeof intents;

/**
 * Common component prop interfaces
 */
export interface BaseComponentProps {
  className?: string;
  size?: Size;
  variant?: Variant;
  intent?: Intent;
}

/**
 * Slot component props for asChild pattern
 */
export interface SlotProps {
  asChild?: boolean;
}

/**
 * Utility to get color classes based on intent
 */
export function getIntentClasses(intent: Intent = 'default') {
  const intentClasses = {
    default: {
      bg: 'bg-bg-secondary',
      text: 'text-fg-primary',
      border: 'border-border-primary',
      hover: 'hover:bg-bg-hover',
    },
    brand: {
      bg: 'bg-bg-brand',
      text: 'text-fg-on-brand',
      border: 'border-brand-primary',
      hover: 'hover:bg-brand-hover',
    },
    accent: {
      bg: 'bg-bg-accent',
      text: 'text-fg-on-accent',
      border: 'border-border-success',
      hover: 'hover:bg-bg-success/80',
    },
    destructive: {
      bg: 'bg-bg-destructive',
      text: 'text-fg-on-destructive',
      border: 'border-border-destructive',
      hover: 'hover:bg-bg-destructive/80',
    },
    warning: {
      bg: 'bg-bg-warning',
      text: 'text-fg-primary',
      border: 'border-border-warning',
      hover: 'hover:bg-bg-warning/80',
    },
    success: {
      bg: 'bg-bg-success',
      text: 'text-fg-on-accent',
      border: 'border-border-success',
      hover: 'hover:bg-bg-success/80',
    },
  } as const;

  return intentClasses[intent];
}

/**
 * Utility to create responsive variants
 * Helps with mobile-first design patterns
 */
export function createResponsiveVariant(
  mobile: string,
  tablet?: string,
  desktop?: string
) {
  return cn(
    mobile,
    tablet && `md:${tablet}`,
    desktop && `lg:${desktop}`
  );
}

/**
 * Common transition classes
 * Consistent transitions using semantic tokens
 */
export const transitions = {
  base: 'transition-all duration-[var(--animate-duration-normal)] ease-[var(--animate-easing-ease)]',
  fast: 'transition-all duration-[var(--animate-duration-fast)] ease-[var(--animate-easing-ease)]',
  slow: 'transition-all duration-[var(--animate-duration-slow)] ease-[var(--animate-easing-ease)]',
  colors: 'transition-colors duration-[var(--animate-duration-normal)] ease-[var(--animate-easing-ease)]',
} as const;