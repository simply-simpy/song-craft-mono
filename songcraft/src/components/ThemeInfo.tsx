import * as React from "react";
import { useRadixTheme } from "../lib/use-radix-theme";

export function ThemeInfo() {
  const theme = useRadixTheme();

  return (
    <div className="p-4 bg-gray-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Current Theme Info</h3>
      <div className="space-y-1 text-sm">
        <p>
          <strong>Appearance:</strong> {theme.appearance}
        </p>
        <p>
          <strong>Accent Color:</strong> {theme.accentColor}
        </p>
        <p>
          <strong>Gray Color:</strong> {theme.grayColor}
        </p>
        <p>
          <strong>Radius:</strong> {theme.radius}
        </p>
        <p>
          <strong>Scaling:</strong> {theme.scaling}
        </p>
      </div>
    </div>
  );
}
