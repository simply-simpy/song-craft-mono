/**
 * Custom useTheme hook for Radix UI Themes
 *
 * Since @radix-ui/themes doesn't export useTheme directly,
 * we create our own hook using ThemeContext.
 */

import { ThemeContext } from "@radix-ui/themes";
import { useContext } from "react";

export const useRadixTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useRadixTheme must be used within a ThemeProvider");
	}
	return context;
};

// Export as useTheme for convenience
export const useTheme = useRadixTheme;
