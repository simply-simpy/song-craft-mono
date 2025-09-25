/**
 * Button Component
 * 
 * Enhanced button component using semantic design tokens and CVA variants.
 * Supports asChild pattern for composition flexibility and includes intent-based styling.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRing, transitions } from "@/lib/ui-utils";

const buttonVariants = cva(
  // Base classes using semantic tokens
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'whitespace-nowrap',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-all',
    'disabled:pointer-events-none',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    '[&_svg]:pointer-events-none',
    '[&_svg]:h-4',
    '[&_svg]:w-4',
    '[&_svg]:shrink-0',
    // Focus styles using semantic tokens
    focusRing.base,
    // Transitions using semantic tokens
    transitions.colors,
  ],
  {
    variants: {
      variant: {
        // Primary variant - brand colors
        default:
          'bg-bg-brand text-fg-on-brand border border-brand-primary shadow-sm hover:bg-brand-hover active:bg-brand-active active:scale-[0.98]',
        
        // Destructive variant
        destructive:
          'bg-bg-destructive text-fg-on-destructive border border-border-destructive shadow-sm hover:bg-bg-destructive/90 active:bg-bg-destructive/80',
        
        // Outline variant
        outline:
          'bg-transparent text-fg-primary border border-border-primary shadow-sm hover:bg-bg-hover hover:border-border-hover active:bg-bg-active',
        
        // Secondary variant
        secondary:
          'bg-bg-secondary text-fg-primary border border-border-primary shadow-sm hover:bg-bg-hover active:bg-bg-active active:scale-[0.98]',
        
        // Ghost variant
        ghost:
          'bg-transparent text-fg-primary border-transparent hover:bg-bg-hover active:bg-bg-active',
        
        // Link variant
        link:
          'bg-transparent text-fg-brand underline-offset-4 hover:underline active:text-brand-active',
      },
      
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md gap-1.5 px-3 text-xs',
        lg: 'h-10 rounded-md px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
      
      intent: {
        default: '',
        
        brand:
          'bg-bg-brand text-fg-on-brand border-brand-primary hover:bg-brand-hover active:bg-brand-active',
        
        accent:
          'bg-bg-accent text-fg-on-accent border-border-success hover:bg-bg-success/90 active:bg-bg-success/80',
        
        destructive:
          'bg-bg-destructive text-fg-on-destructive border-border-destructive hover:bg-bg-destructive/90 active:bg-bg-destructive/80',
        
        warning:
          'bg-bg-warning text-fg-primary border-border-warning hover:bg-bg-warning/90 active:bg-bg-warning/80',
        
        success:
          'bg-bg-success text-fg-on-accent border-border-success hover:bg-bg-success/90 active:bg-bg-success/80',
      },
    },
    
    defaultVariants: {
      variant: 'default',
      size: 'default',
      intent: 'default',
    },
    
    // Compound variants for intent overrides
    compoundVariants: [
      // When intent is specified, it overrides variant colors
      {
        intent: ['brand', 'accent', 'destructive', 'warning', 'success'],
        variant: ['secondary', 'outline', 'ghost'],
        class: 'border-current',
      },
      
      // Ghost variant with intents should not have borders
      {
        variant: 'ghost',
        intent: ['brand', 'accent', 'destructive', 'warning', 'success'],
        class: 'border-transparent',
      },
      
      // Link variant with intents should maintain link styling
      {
        variant: 'link',
        intent: ['brand', 'accent', 'destructive', 'warning', 'success'],
        class: 'bg-transparent border-transparent',
      },
    ],
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders as a child component instead of a button.
   * Useful for rendering buttons as links or other elements.
   */
  asChild?: boolean;
}

/**
 * Button component with semantic design tokens and enhanced variant support
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, intent, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, intent, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
