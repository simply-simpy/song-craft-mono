/**
 * UI Components - Export Index
 * 
 * Centralized exports for the design system components.
 * These components use Radix primitives and semantic design tokens.
 */

// Core components
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';

// Form components
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

export { Switch } from './switch';

// Layout and feedback components
export { PendingComponent } from './pending-component';

// Theme components
export { ThemeProvider, ThemeToggle, useTheme } from './theme-provider';
export type { Theme, Skin } from './theme-provider';

// Re-export utilities
export { cn, focusRing, transitions, animations, zIndex } from '../../lib/ui-utils';
export type { Size, Variant, Intent } from '../../lib/ui-utils';