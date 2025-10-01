/**
 * Radix Theme Integration
 * 
 * Integrates our unified theme system with Radix UI themes by:
 * - Mapping our brand skins to Radix accent colors
 * - Syncing light/dark modes
 * - Maintaining consistent theming across both systems
 */

import { RadixThemeProvider } from "./ui/radix-theme-provider";
import { useTheme } from "./ThemeProvider";

interface RadixThemeIntegrationProps {
  children: React.ReactNode;
}

// Map our brand skins to Radix accent colors
const BRAND_TO_RADIX_MAPPING = {
  blue: "blue" as const,
  green: "jade" as const,
  red: "red" as const,
  purple: "violet" as const,
};

export function RadixThemeIntegration({ children }: RadixThemeIntegrationProps) {
  const { colorScheme, brandSkin } = useTheme();
  
  // Map our theme values to Radix theme values
  const radixAccentColor = BRAND_TO_RADIX_MAPPING[brandSkin];
  const radixAppearance = colorScheme; // "light" | "dark" maps directly

  return (
    <RadixThemeProvider
      appearance={radixAppearance}
      accentColor={radixAccentColor}
      grayColor="gray"
      radius="small"
      scaling="100%"
    >
      {children}
    </RadixThemeProvider>
  );
}