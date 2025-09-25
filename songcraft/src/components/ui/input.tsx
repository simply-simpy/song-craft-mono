/**
 * Input Component
 *
 * Form input component using semantic design tokens for consistent theming.
 * Supports all standard input types with proper focus and validation states.
 */

import * as React from "react";
import { cn, transitions } from "@/lib/ui-utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          // Base styles using semantic tokens
          "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base md:text-sm",
          "bg-bg-primary border-border-primary text-fg-primary",
          "placeholder:text-fg-tertiary",
          "selection:bg-brand-primary selection:text-fg-on-brand",
          // File input styles
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg-primary",
          // Focus styles using semantic tokens
          "focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-border-focus/20 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-primary",
          "outline-none",
          // Invalid/error states
          "aria-invalid:border-border-destructive aria-invalid:ring-2 aria-invalid:ring-border-destructive/20",
          // Disabled states
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-disabled",
          // Transitions
          transitions.colors,
          "shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
