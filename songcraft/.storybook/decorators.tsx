import React from "react";
import { RadixThemeProvider } from "../src/components/ui/radix-theme-provider";
import { ThemePanel } from "@radix-ui/themes";

// Theme decorator for Storybook
export const withRadixTheme = (Story: any, context: any) => {
  const themeArgs = context.args?.theme || {};

  return (
    <RadixThemeProvider
      accentColor={themeArgs.accentColor || "blue"}
      grayColor={themeArgs.grayColor || "gray"}
      radius={themeArgs.radius || "medium"}
      scaling={themeArgs.scaling || "100%"}
      appearance={themeArgs.appearance || "inherit"}
    >
      <div style={{ padding: "1rem" }}>
        <Story />
      </div>
    </RadixThemeProvider>
  );
};

// Theme panel decorator for interactive theme testing
export const withThemePanel = (Story: any) => {
  return (
    <div style={{ display: "flex", gap: "1rem", minHeight: "400px" }}>
      <div style={{ flex: 1 }}>
        <Story />
      </div>
      <div
        style={{
          width: "300px",
          borderLeft: "1px solid #e5e7eb",
          padding: "1rem",
        }}
      >
        <h3
          style={{ margin: "0 0 1rem 0", fontSize: "14px", fontWeight: "600" }}
        >
          Theme Controls
        </h3>
        <ThemePanel />
      </div>
    </div>
  );
};
