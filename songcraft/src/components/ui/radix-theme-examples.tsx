/**
 * Radix Theme Integration Examples
 *
 * This file demonstrates different ways to integrate Radix theming
 * with your custom components.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// ============================================================================
// APPROACH 1: Using Radix CSS Variables (Recommended)
// ============================================================================

const radixButtonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				// Using CSS custom properties that map to Radix theme variables - these automatically adapt to theme changes
				default:
					"bg-[var(--accent-9)] text-[var(--accent-contrast)] hover:bg-[var(--accent-10)]",
				destructive:
					"bg-[var(--red-9)] text-[var(--red-contrast)] hover:bg-[var(--red-10)]",
				outline:
					"border border-[var(--gray-6)] bg-transparent hover:bg-[var(--gray-4)] text-[var(--gray-12)]",
				secondary:
					"bg-[var(--gray-4)] text-[var(--gray-11)] hover:bg-[var(--gray-5)]",
				ghost: "hover:bg-[var(--gray-4)] text-[var(--gray-11)]",
				link: "text-[var(--accent-11)] underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

// ============================================================================
// APPROACH 2: Using CSS Custom Properties with Radix Theme Context
// ============================================================================

const themedButtonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				// Using CSS custom properties that map to Radix theme
				default:
					"bg-[var(--accent-9)] text-[var(--accent-contrast)] hover:bg-[var(--accent-10)]",
				destructive:
					"bg-[var(--red-9)] text-[var(--red-contrast)] hover:bg-[var(--red-10)]",
				outline:
					"border border-[var(--gray-6)] bg-transparent hover:bg-[var(--gray-4)] text-[var(--gray-12)]",
				secondary:
					"bg-[var(--gray-4)] text-[var(--gray-11)] hover:bg-[var(--gray-5)]",
				ghost: "hover:bg-[var(--gray-4)] text-[var(--gray-11)]",
				link: "text-[var(--accent-11)] underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

// ============================================================================
// APPROACH 3: Using Radix Theme Hook (Advanced)
// ============================================================================

import { useRadixTheme } from "../../lib/use-radix-theme";

const DynamicThemedButton = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		variant?:
			| "default"
			| "destructive"
			| "outline"
			| "secondary"
			| "ghost"
			| "link";
		size?: "default" | "sm" | "lg" | "icon";
		asChild?: boolean;
	}
>(
	(
		{
			className,
			variant = "default",
			size = "default",
			asChild = false,
			...props
		},
		ref,
	) => {
		const theme = useRadixTheme();

		// Dynamic styling based on current theme
		const getVariantStyles = () => {
			const accentColor = theme.accentColor;
			const grayColor = theme.grayColor;

			switch (variant) {
				case "default":
					return `bg-${accentColor}-9 text-${accentColor}-contrast hover:bg-${accentColor}-10`;
				case "destructive":
					return "bg-red-9 text-red-contrast hover:bg-red-10";
				case "outline":
					return `border border-${grayColor}-6 bg-transparent hover:bg-${grayColor}-4 text-${grayColor}-12`;
				case "secondary":
					return `bg-${grayColor}-4 text-${grayColor}-11 hover:bg-${grayColor}-5`;
				case "ghost":
					return `hover:bg-${grayColor}-4 text-${grayColor}-11`;
				case "link":
					return `text-${accentColor}-11 underline-offset-4 hover:underline`;
				default:
					return `bg-${accentColor}-9 text-${accentColor}-contrast hover:bg-${accentColor}-10`;
			}
		};

		const getSizeStyles = () => {
			switch (size) {
				case "sm":
					return "h-9 rounded-md px-3";
				case "lg":
					return "h-11 rounded-md px-8";
				case "icon":
					return "h-10 w-10";
				default:
					return "h-10 px-4 py-2";
			}
		};

		const Comp = asChild ? Slot : "button";

		return (
			<Comp
				className={cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
					getVariantStyles(),
					getSizeStyles(),
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

DynamicThemedButton.displayName = "DynamicThemedButton";

// ============================================================================
// APPROACH 4: CSS-in-JS with Radix Theme Variables
// ============================================================================

const StyledButton = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		variant?:
			| "default"
			| "destructive"
			| "outline"
			| "secondary"
			| "ghost"
			| "link";
		size?: "default" | "sm" | "lg" | "icon";
		asChild?: boolean;
	}
>(
	(
		{
			className,
			variant = "default",
			size = "default",
			asChild = false,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";

		// CSS-in-JS styles using Radix theme variables
		const styles = React.useMemo(() => {
			const baseStyles = {
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				whiteSpace: "nowrap" as const,
				borderRadius: "var(--radius-2)",
				fontSize: "var(--font-size-2)",
				fontWeight: "var(--font-weight-medium)",
				transition: "colors 0.2s",
				outline: "none",
				border: "none",
				cursor: "pointer",
			};

			const variantStyles = {
				default: {
					backgroundColor: "var(--accent-9)",
					color: "var(--accent-contrast)",
					"&:hover": { backgroundColor: "var(--accent-10)" },
				},
				destructive: {
					backgroundColor: "var(--red-9)",
					color: "var(--red-contrast)",
					"&:hover": { backgroundColor: "var(--red-10)" },
				},
				outline: {
					backgroundColor: "transparent",
					color: "var(--gray-12)",
					border: "1px solid var(--gray-6)",
					"&:hover": { backgroundColor: "var(--gray-4)" },
				},
				secondary: {
					backgroundColor: "var(--gray-4)",
					color: "var(--gray-11)",
					"&:hover": { backgroundColor: "var(--gray-5)" },
				},
				ghost: {
					backgroundColor: "transparent",
					color: "var(--gray-11)",
					"&:hover": { backgroundColor: "var(--gray-4)" },
				},
				link: {
					backgroundColor: "transparent",
					color: "var(--accent-11)",
					textDecoration: "underline",
					textUnderlineOffset: "4px",
					"&:hover": { textDecoration: "underline" },
				},
			};

			const sizeStyles = {
				default: {
					height: "var(--space-10)",
					padding: "var(--space-2) var(--space-4)",
				},
				sm: {
					height: "var(--space-9)",
					padding: "var(--space-1) var(--space-3)",
					borderRadius: "var(--radius-2)",
				},
				lg: {
					height: "var(--space-11)",
					padding: "var(--space-2) var(--space-8)",
					borderRadius: "var(--radius-2)",
				},
				icon: { height: "var(--space-10)", width: "var(--space-10)" },
			};

			return {
				...baseStyles,
				...variantStyles[variant],
				...sizeStyles[size],
			};
		}, [variant, size]);

		return <Comp style={styles} className={className} ref={ref} {...props} />;
	},
);

StyledButton.displayName = "StyledButton";

// ============================================================================
// EXPORTS
// ============================================================================

export {
	radixButtonVariants,
	themedButtonVariants,
	DynamicThemedButton,
	StyledButton,
};
