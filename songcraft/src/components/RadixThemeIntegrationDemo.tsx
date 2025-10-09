import * as React from "react";
import { Button } from "@radix-ui/themes";
import {
  radixButtonVariants,
  DynamicThemedButton,
  StyledButton,
} from "./ui/radix-theme-examples";
import { Button as CustomButton } from "./ui/Button";
import { cn } from "../lib/utils";

export function RadixThemeIntegrationDemo() {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">
        Radix Theme Integration Examples
      </h2>

      {/* Approach 1: Using Radix CSS Variables in Tailwind */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Approach 1: Radix CSS Variables in Tailwind
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button className={cn(radixButtonVariants({ variant: "default" }))}>
            Primary
          </button>
          <button
            className={cn(radixButtonVariants({ variant: "destructive" }))}
          >
            Destructive
          </button>
          <button className={cn(radixButtonVariants({ variant: "outline" }))}>
            Outline
          </button>
          <button className={cn(radixButtonVariants({ variant: "secondary" }))}>
            Secondary
          </button>
          <button className={cn(radixButtonVariants({ variant: "ghost" }))}>
            Ghost
          </button>
          <button className={cn(radixButtonVariants({ variant: "link" }))}>
            Link
          </button>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            className={cn(
              radixButtonVariants({ variant: "default", size: "sm" })
            )}
          >
            Small
          </button>
          <button
            className={cn(
              radixButtonVariants({ variant: "default", size: "default" })
            )}
          >
            Default
          </button>
          <button
            className={cn(
              radixButtonVariants({ variant: "default", size: "lg" })
            )}
          >
            Large
          </button>
          <button
            className={cn(
              radixButtonVariants({ variant: "default", size: "icon" })
            )}
          >
            ⚙️
          </button>
        </div>
      </section>

      {/* Approach 2: Using Radix Theme Hook */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Approach 2: Dynamic Theme Hook
        </h3>
        <div className="flex gap-2 flex-wrap">
          <DynamicThemedButton variant="default">Default</DynamicThemedButton>
          <DynamicThemedButton variant="destructive">
            Destructive
          </DynamicThemedButton>
          <DynamicThemedButton variant="outline">Outline</DynamicThemedButton>
          <DynamicThemedButton variant="secondary">
            Secondary
          </DynamicThemedButton>
          <DynamicThemedButton variant="ghost">Ghost</DynamicThemedButton>
          <DynamicThemedButton variant="link">Link</DynamicThemedButton>
        </div>
      </section>

      {/* Approach 3: CSS-in-JS with Radix Variables */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Approach 3: CSS-in-JS with Radix Variables
        </h3>
        <div className="flex gap-2 flex-wrap">
          <StyledButton variant="default">Default</StyledButton>
          <StyledButton variant="destructive">Destructive</StyledButton>
          <StyledButton variant="outline">Outline</StyledButton>
          <StyledButton variant="secondary">Secondary</StyledButton>
          <StyledButton variant="ghost">Ghost</StyledButton>
          <StyledButton variant="link">Link</StyledButton>
        </div>
      </section>

      {/* Approach 4: Pure CSS Classes (moved to docs/examples) */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Approach 4: Pure CSS Classes</h3>
        <p className="text-sm text-fg-secondary">
          CSS examples moved to docs/examples/radix-themed-components.css
        </p>
        <div className="flex gap-2 flex-wrap">
          <CustomButton variant="default">Default</CustomButton>
          <CustomButton variant="destructive">Destructive</CustomButton>
          <CustomButton variant="outline">Outline</CustomButton>
          <CustomButton variant="secondary">Secondary</CustomButton>
          <CustomButton variant="ghost">Ghost</CustomButton>
          <CustomButton variant="link">Link</CustomButton>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <CustomButton variant="default" size="sm">
            Small
          </CustomButton>
          <CustomButton variant="default" size="default">
            Default
          </CustomButton>
          <CustomButton variant="default" size="lg">
            Large
          </CustomButton>
          <CustomButton variant="default" size="icon">
            ⚙️
          </CustomButton>
        </div>
      </section>

      {/* Approach 5: Mapped CSS Variables (moved to docs/examples) */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Approach 5: Mapped CSS Variables
        </h3>
        <p className="text-sm text-fg-secondary">
          CSS examples moved to docs/examples/radix-themed-components.css
        </p>
        <div className="flex gap-2 flex-wrap">
          <CustomButton variant="default">Primary</CustomButton>
          <CustomButton variant="destructive">Destructive</CustomButton>
          <CustomButton variant="outline">Outline</CustomButton>
          <CustomButton variant="secondary">Secondary</CustomButton>
          <CustomButton variant="ghost">Ghost</CustomButton>
          <CustomButton variant="link">Link</CustomButton>
        </div>
      </section>

      {/* Approach 6: Theme-aware Components (moved to docs/examples) */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Approach 6: Theme-aware Components
        </h3>
        <p className="text-sm text-fg-secondary">
          CSS examples moved to docs/examples/radix-themed-components.css
        </p>
        <div className="flex gap-2 flex-wrap">
          <CustomButton variant="default">Default</CustomButton>
          <CustomButton variant="default" size="sm">
            Small
          </CustomButton>
          <CustomButton variant="default" size="lg">
            Large
          </CustomButton>
          <CustomButton variant="default" size="icon">
            ⚙️
          </CustomButton>
        </div>
      </section>

      {/* Native Radix Button for Comparison */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Native Radix Button (for comparison)
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="solid">Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Button size="1">Size 1</Button>
          <Button size="2">Size 2</Button>
          <Button size="3">Size 3</Button>
          <Button size="4">Size 4</Button>
        </div>
      </section>

      {/* Theme Information */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Theme Information</h3>
        <div className="bg-gray-4 p-4 rounded-md">
          <p className="text-sm text-gray-11">
            All buttons above automatically adapt to your current Radix theme
            settings. Change the theme using the ThemePanel to see the colors
            update in real-time.
          </p>
          <p className="text-sm text-gray-11 mt-2">
            <strong>Available Radix CSS Variables:</strong>
          </p>
          <ul className="text-sm text-gray-11 mt-1 ml-4 list-disc">
            <li>
              <code>--accent-9</code>, <code>--accent-10</code>,{" "}
              <code>--accent-contrast</code>
            </li>
            <li>
              <code>--red-9</code>, <code>--red-10</code>,{" "}
              <code>--red-contrast</code>
            </li>
            <li>
              <code>--gray-4</code>, <code>--gray-5</code>,{" "}
              <code>--gray-6</code>, <code>--gray-11</code>,{" "}
              <code>--gray-12</code>
            </li>
            <li>
              <code>--radius-2</code>, <code>--font-size-2</code>,{" "}
              <code>--font-weight-medium</code>
            </li>
            <li>
              <code>--space-9</code>, <code>--space-10</code>,{" "}
              <code>--space-11</code>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
