/**
 * Input Component
 *
 * Form input component using semantic design tokens for consistent theming.
 * Supports all standard input types with proper focus and validation states.
 */

import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const inputVariants = cva(
	// Base styles using semantic tokens
	"flex w-full min-w-0 rounded-md border text-base transition-colors shadow-sm outline-none bg-surface-base border-border-primary text-fg-primary placeholder:text-fg-tertiary selection:bg-brand-primary selection:text-fg-on-brand file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg-primary focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-border-focus/20 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-primary aria-invalid:border-border-destructive aria-invalid:ring-2 aria-invalid:ring-border-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-disabled",
	{
		variants: {
			size: {
				sm: "h-8 px-2 py-1 text-sm",
				default: "h-9 px-3 py-1 md:text-sm",
				lg: "h-11 px-4 py-2 text-lg",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

export interface InputProps
	extends Omit<React.ComponentProps<"input">, "size">,
		VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, size, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(inputVariants({ size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);

Input.displayName = "Input";

export { Input, inputVariants };
