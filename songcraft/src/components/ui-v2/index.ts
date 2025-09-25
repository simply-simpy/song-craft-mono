/**
 * UI Components v2 - Export Index
 * 
 * Centralized exports for our new design system components.
 * These components use Radix primitives, semantic design tokens,
 * and follow the established patterns for consistency.
 */

// Button component
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

// Theme system
export { 
  ThemeProvider, 
  ThemeToggle, 
  useTheme 
} from './theme-provider';
export type { Theme, Skin } from './theme-provider';

// Design system utilities
export {
  cn,
  focusRing,
  sizes,
  variants,
  intents,
  animations,
  zIndex,
  getIntentClasses,
  createResponsiveVariant,
  transitions,
} from '../../lib/ui-utils';
export type {
  Size,
  Variant, 
  Intent,
  BaseComponentProps,
  SlotProps,
} from '../../lib/ui-utils';

// Re-export design tokens for component usage
export { tokens } from '../../design-tokens/tokens';