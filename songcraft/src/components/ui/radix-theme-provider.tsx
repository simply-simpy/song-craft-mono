/**
 * Radix Theme Provider
 *
 * Wraps the app with Radix UI's Theme provider for consistent theming
 * across all Radix components.
 */

import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

interface RadixThemeProviderProps {
	children: React.ReactNode;
	appearance?: "light" | "dark" | "inherit";
	accentColor?:
		| "ruby"
		| "gray"
		| "gold"
		| "bronze"
		| "brown"
		| "yellow"
		| "amber"
		| "orange"
		| "tomato"
		| "red"
		| "crimson"
		| "pink"
		| "plum"
		| "purple"
		| "violet"
		| "iris"
		| "indigo"
		| "blue"
		| "cyan"
		| "teal"
		| "jade"
		| "green"
		| "grass"
		| "lime"
		| "mint"
		| "sky";
	grayColor?: "gray" | "mauve" | "slate" | "sage" | "olive" | "sand";
	radius?: "none" | "small" | "medium" | "large" | "full";
	scaling?: "90%" | "95%" | "100%" | "105%" | "110%";
}

export function RadixThemeProvider({
	children,
	appearance = "inherit",
	accentColor = "blue",
	grayColor = "gray",
	radius = "medium",
	scaling = "100%",
}: RadixThemeProviderProps) {
	return (
		<Theme
			appearance={appearance}
			accentColor={accentColor}
			grayColor={grayColor}
			radius={radius}
			scaling={scaling}
		>
			{children}
		</Theme>
	);
}
