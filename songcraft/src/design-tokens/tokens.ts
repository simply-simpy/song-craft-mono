/**
 * Design Tokens System
 *
 * This file defines semantic design tokens that generate both:
 * 1. CSS custom properties (--token-name)
 * 2. TypeScript literal types for compile-time safety
 *
 * Tokens use semantic naming (bg, fg, surface, brand) rather than
 * raw color scales (gray-50) to enable theme switching without component rewrites.
 */

// Base color palette - these are the raw colors
const palette = {
	// Neutral grays
	neutral: {
		50: "hsl(210 20% 98%)",
		100: "hsl(210 20% 95%)",
		200: "hsl(210 16% 93%)",
		300: "hsl(210 14% 89%)",
		400: "hsl(210 14% 83%)",
		500: "hsl(210 11% 71%)",
		600: "hsl(210 7% 56%)",
		700: "hsl(210 9% 31%)",
		800: "hsl(210 10% 23%)",
		900: "hsl(210 11% 15%)",
		950: "hsl(210 12% 8%)",
	},

	// Brand colors
	brand: {
		50: "hsl(213 100% 96%)",
		100: "hsl(214 95% 93%)",
		200: "hsl(213 97% 87%)",
		300: "hsl(212 96% 78%)",
		400: "hsl(213 94% 68%)",
		500: "hsl(217 91% 60%)", // Primary brand
		600: "hsl(221 83% 53%)",
		700: "hsl(224 76% 48%)",
		800: "hsl(226 71% 40%)",
		900: "hsl(224 64% 33%)",
		950: "hsl(226 55% 21%)",
	},

	// Accent colors
	accent: {
		50: "hsl(138 76% 97%)",
		100: "hsl(141 84% 93%)",
		200: "hsl(141 79% 85%)",
		300: "hsl(142 77% 73%)",
		400: "hsl(142 69% 58%)",
		500: "hsl(142 76% 36%)", // Success green
		600: "hsl(142 72% 29%)",
		700: "hsl(142 69% 24%)",
		800: "hsl(143 64% 20%)",
		900: "hsl(144 61% 16%)",
		950: "hsl(145 80% 9%)",
	},

	// Semantic colors
	destructive: {
		50: "hsl(0 86% 97%)",
		100: "hsl(0 93% 94%)",
		200: "hsl(0 96% 89%)",
		300: "hsl(0 94% 82%)",
		400: "hsl(0 91% 71%)",
		500: "hsl(0 84% 60%)",
		600: "hsl(0 72% 51%)",
		700: "hsl(0 74% 42%)",
		800: "hsl(0 70% 35%)",
		900: "hsl(0 63% 31%)",
		950: "hsl(0 75% 15%)",
	},

	warning: {
		50: "hsl(48 100% 96%)",
		100: "hsl(48 96% 89%)",
		200: "hsl(48 97% 77%)",
		300: "hsl(46 87% 65%)",
		400: "hsl(43 74% 66%)",
		500: "hsl(38 92% 50%)",
		600: "hsl(32 95% 44%)",
		700: "hsl(26 90% 37%)",
		800: "hsl(23 83% 31%)",
		900: "hsl(22 78% 26%)",
		950: "hsl(21 92% 14%)",
	},
} as const;

// Semantic token definitions - these map to actual usage
export const semanticTokens = {
	// Background colors
	bg: {
		// Primary backgrounds
		primary: palette.neutral[50], // Main canvas
		secondary: palette.neutral[100], // Secondary areas
		tertiary: palette.neutral[200], // Tertiary areas

		// Interactive backgrounds
		hover: palette.neutral[100], // Hover states
		active: palette.neutral[200], // Active states
		selected: palette.brand[50], // Selected states

		// Semantic backgrounds
		brand: palette.brand[500], // Brand elements
		accent: palette.accent[500], // Accent elements
		destructive: palette.destructive[500], // Destructive actions
		warning: palette.warning[500], // Warning states
		success: palette.accent[500], // Success states

		// Special backgrounds
		overlay: "hsl(0 0% 0% / 0.5)", // Modal overlays
		disabled: palette.neutral[100], // Disabled elements
	},

	// Foreground colors (text, icons)
	fg: {
		// Primary text
		primary: palette.neutral[900], // Main text
		secondary: palette.neutral[600], // Secondary text
		tertiary: palette.neutral[500], // Tertiary text
		disabled: palette.neutral[400], // Disabled text

		// Interactive text
		hover: palette.neutral[950], // Hover text
		active: palette.neutral[950], // Active text

		// Semantic text
		brand: palette.brand[600], // Brand text
		accent: palette.accent[600], // Accent text
		destructive: palette.destructive[600], // Error text
		warning: palette.warning[600], // Warning text
		success: palette.accent[600], // Success text

		// On colored backgrounds
		"on-brand": palette.neutral[50], // Text on brand bg
		"on-accent": palette.neutral[50], // Text on accent bg
		"on-destructive": palette.neutral[50], // Text on destructive bg
	},

	// Surface colors (cards, panels)
	surface: {
		// Elevation levels
		base: palette.neutral[50], // Base surface
		elevated: "#ffffff", // Elevated surfaces
		sunken: palette.neutral[100], // Sunken surfaces

		// Interactive surfaces
		hover: palette.neutral[100], // Hoverable surfaces
		active: palette.neutral[200], // Active surfaces

		// Semantic surfaces
		brand: palette.brand[50], // Brand surfaces
		accent: palette.accent[50], // Accent surfaces
		destructive: palette.destructive[50], // Destructive surfaces
		warning: palette.warning[50], // Warning surfaces
		success: palette.accent[50], // Success surfaces
	},

	// Border colors
	border: {
		primary: palette.neutral[300], // Default borders
		secondary: palette.neutral[200], // Subtle borders
		hover: palette.neutral[400], // Hover borders
		focus: palette.brand[500], // Focus borders
		destructive: palette.destructive[300], // Error borders
		warning: palette.warning[300], // Warning borders
		success: palette.accent[300], // Success borders
	},

	// Brand colors (specific brand usage)
	brand: {
		primary: palette.brand[500], // Primary brand
		secondary: palette.brand[400], // Secondary brand
		tertiary: palette.brand[300], // Tertiary brand
		hover: palette.brand[600], // Brand hover
		active: palette.brand[700], // Brand active
	},
} as const;

// Dark theme overrides
export const darkTokens = {
	bg: {
		primary: palette.neutral[950],
		secondary: palette.neutral[900],
		tertiary: palette.neutral[800],
		hover: palette.neutral[800],
		active: palette.neutral[700],
		selected: palette.brand[950],
		overlay: "hsl(0 0% 0% / 0.8)",
		disabled: palette.neutral[800],
	},

	fg: {
		primary: palette.neutral[50],
		secondary: palette.neutral[400],
		tertiary: palette.neutral[500],
		disabled: palette.neutral[600],
		hover: palette.neutral[50],
		active: palette.neutral[50],
		brand: palette.brand[400],
		accent: palette.accent[400],
		destructive: palette.destructive[400],
		warning: palette.warning[400],
		success: palette.accent[400],
	},

	surface: {
		base: palette.neutral[950],
		elevated: palette.neutral[900],
		sunken: palette.neutral[950],
		hover: palette.neutral[800],
		active: palette.neutral[700],
		brand: palette.brand[950],
		accent: palette.accent[950],
		destructive: palette.destructive[950],
		warning: palette.warning[950],
		success: palette.accent[950],
	},

	border: {
		primary: palette.neutral[700],
		secondary: palette.neutral[800],
		hover: palette.neutral[600],
		focus: palette.brand[500],
		destructive: palette.destructive[700],
		warning: palette.warning[700],
		success: palette.accent[700],
	},
} as const;

// Typography tokens
export const typography = {
	// Font families
	font: {
		sans: "Lato, system-ui, sans-serif",
		mono: "ui-monospace, SFMono-Regular, monospace",
	},

	// Font sizes (using rem for accessibility)
	text: {
		xs: "0.75rem", // 12px
		sm: "0.875rem", // 14px
		base: "1rem", // 16px
		lg: "1.125rem", // 18px
		xl: "1.25rem", // 20px
		"2xl": "1.5rem", // 24px
		"3xl": "1.875rem", // 30px
		"4xl": "2.25rem", // 36px
		"5xl": "3rem", // 48px
	},

	// Font weights
	weight: {
		light: "300",
		normal: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
	},

	// Line heights
	leading: {
		tight: "1.25",
		normal: "1.5",
		relaxed: "1.75",
	},
} as const;

// Spacing tokens (using rem for consistency)
export const spacing = {
	0: "0",
	px: "1px",
	0.5: "0.125rem", // 2px
	1: "0.25rem", // 4px
	1.5: "0.375rem", // 6px
	2: "0.5rem", // 8px
	2.5: "0.625rem", // 10px
	3: "0.75rem", // 12px
	3.5: "0.875rem", // 14px
	4: "1rem", // 16px
	5: "1.25rem", // 20px
	6: "1.5rem", // 24px
	7: "1.75rem", // 28px
	8: "2rem", // 32px
	9: "2.25rem", // 36px
	10: "2.5rem", // 40px
	11: "2.75rem", // 44px
	12: "3rem", // 48px
	14: "3.5rem", // 56px
	16: "4rem", // 64px
	20: "5rem", // 80px
	24: "6rem", // 96px
	28: "7rem", // 112px
	32: "8rem", // 128px
	36: "9rem", // 144px
	40: "10rem", // 160px
	44: "11rem", // 176px
	48: "12rem", // 192px
	52: "13rem", // 208px
	56: "14rem", // 224px
	60: "15rem", // 240px
	64: "16rem", // 256px
	72: "18rem", // 288px
	80: "20rem", // 320px
	96: "24rem", // 384px
} as const;

// Shadow tokens
export const shadows = {
	xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
	sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
	base: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
	md: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
	lg: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
	xl: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
	"2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
	inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

// Border radius tokens
export const radius = {
	none: "0",
	sm: "0.125rem", // 2px
	base: "0.25rem", // 4px
	md: "0.375rem", // 6px
	lg: "0.5rem", // 8px
	xl: "0.75rem", // 12px
	"2xl": "1rem", // 16px
	"3xl": "1.5rem", // 24px
	full: "9999px",
} as const;

// Animation tokens
export const animation = {
	duration: {
		fast: "150ms",
		normal: "250ms",
		slow: "350ms",
	},

	easing: {
		linear: "linear",
		ease: "ease",
		"ease-in": "ease-in",
		"ease-out": "ease-out",
		"ease-in-out": "ease-in-out",
		bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
	},
} as const;

// Export all tokens as a single object
export const tokens = {
	semantic: semanticTokens,
	dark: darkTokens,
	typography,
	spacing,
	shadows,
	radius,
	animation,
} as const;

// Type definitions for compile-time safety
export type SemanticTokens = typeof semanticTokens;
export type DarkTokens = typeof darkTokens;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadows = typeof shadows;
export type Radius = typeof radius;
export type Animation = typeof animation;

// Utility types for component props
export type ColorTokens =
	| keyof SemanticTokens["bg"]
	| keyof SemanticTokens["fg"]
	| keyof SemanticTokens["surface"]
	| keyof SemanticTokens["border"]
	| keyof SemanticTokens["brand"];
export type SpacingTokens = keyof typeof spacing;
export type TextSizeTokens = keyof typeof typography.text;
export type ShadowTokens = keyof typeof shadows;
export type RadiusTokens = keyof typeof radius;
