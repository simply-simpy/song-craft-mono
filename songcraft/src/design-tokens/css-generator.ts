/**
 * CSS Generator for Design Tokens
 *
 * Converts our semantic design tokens into CSS custom properties
 * that can be consumed by Tailwind CSS and our components.
 */

import { tokens } from "./tokens";

// Helper function to convert nested objects to CSS custom properties
function objectToCssVars(obj: Record<string, unknown>, prefix = ""): string {
	let css = "";

	for (const [key, value] of Object.entries(obj)) {
		const cssKey = `--${prefix}${prefix ? "-" : ""}${key}`;

		if (typeof value === "object" && value !== null) {
			// Recursive for nested objects
			css += objectToCssVars(value, `${prefix}${prefix ? "-" : ""}${key}`);
		} else {
			// Convert the value to CSS
			css += `  ${cssKey}: ${value};\n`;
		}
	}

	return css;
}

// Generate light theme CSS variables
export function generateLightThemeCss(): string {
	const { semantic, typography, spacing, shadows, radius, animation } = tokens;

	return `/* Light Theme CSS Variables */
:root {
${objectToCssVars(semantic)}
${objectToCssVars(typography, "font")}
${objectToCssVars(spacing, "space")}
${objectToCssVars(shadows, "shadow")}
${objectToCssVars(radius, "radius")}
${objectToCssVars(animation, "animate")}
}`;
}

// Generate dark theme CSS variables
export function generateDarkThemeCss(): string {
	const { dark } = tokens;

	return `/* Dark Theme CSS Variables */
[data-theme="dark"] {
${objectToCssVars(dark)}
}`;
}

// Generate complete CSS file content
export function generateCompleteCss(): string {
	return `${generateLightThemeCss()}

${generateDarkThemeCss()}

/* Component-specific CSS variables that reference semantic tokens */
:root {
  /* Focus ring using semantic tokens */
  --focus-ring: 0 0 0 2px var(--border-focus);
  --focus-ring-offset: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--border-focus);
  
  /* Component sizes */
  --button-height-sm: 2rem;
  --button-height-base: 2.25rem;
  --button-height-lg: 2.5rem;
  
  --input-height-sm: 2rem;
  --input-height-base: 2.25rem;
  --input-height-lg: 2.5rem;
  
  /* Common border radius for components */
  --component-radius: var(--radius-md);
  
  /* Z-index scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
}

/* Utility classes for common patterns */
.focus-ring {
  outline: none;
  box-shadow: var(--focus-ring);
}

.focus-ring-offset {
  outline: none;
  box-shadow: var(--focus-ring-offset);
}

/* Custom scrollbar styles */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: var(--border-primary) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: var(--radius-full);
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

/* Animation utilities */
.animate-in {
  animation-duration: var(--animate-duration-normal);
  animation-timing-function: var(--animate-easing-ease-out);
  animation-fill-mode: both;
}

.animate-out {
  animation-duration: var(--animate-duration-fast);
  animation-timing-function: var(--animate-easing-ease-in);
  animation-fill-mode: both;
}

/* Fade animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.fade-in {
  animation-name: fade-in;
}

.fade-out {
  animation-name: fade-out;
}

/* Slide animations */
@keyframes slide-in-from-top {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

@keyframes slide-in-from-bottom {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slide-in-from-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slide-in-from-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.slide-in-from-top {
  animation-name: slide-in-from-top;
}

.slide-in-from-bottom {
  animation-name: slide-in-from-bottom;
}

.slide-in-from-left {
  animation-name: slide-in-from-left;
}

.slide-in-from-right {
  animation-name: slide-in-from-right;
}

/* Scale animations */
@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scale-out {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}

.scale-in {
  animation-name: scale-in;
}

.scale-out {
  animation-name: scale-out;
}
`;
}

// For build-time generation, we can write this to a file
export function writeCssFile(filePath: string): void {
	if (typeof window === "undefined") {
		// Node.js environment (build time)
		const fs = require("node:fs");
		const path = require("node:path");

		const cssContent = generateCompleteCss();
		const directory = path.dirname(filePath);

		// Ensure directory exists
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, { recursive: true });
		}

		fs.writeFileSync(filePath, cssContent, "utf8");
		console.log(`✅ Generated CSS tokens at ${filePath}`);
	}
}
