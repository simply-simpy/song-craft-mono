import { Button } from "@radix-ui/themes";
import {
  radixButtonVariants,
  DynamicThemedButton,
  StyledButton,
} from "./ui/radix-theme-examples";
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
          <button
            type="button"
            className={cn(radixButtonVariants({ variant: "default" }))}
          >
            Primary
          </button>
          <button
            type="button"
            className={cn(radixButtonVariants({ variant: "destructive" }))}
          >
            Destructive
          </button>
          <button
            type="button"
            className={cn(radixButtonVariants({ variant: "outline" }))}
          >
            Outline
          </button>
          <button
            type="button"
            className={cn(radixButtonVariants({ variant: "secondary" }))}
          >
            Secondary
          </button>
          <button
            type="button"
            className={cn(radixButtonVariants({ variant: "ghost" }))}
          >
            Ghost
          </button>
          <button
            type="button"
            className={cn(radixButtonVariants({ variant: "link" }))}
          >
            Link
          </button>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            type="button"
            className={cn(
              radixButtonVariants({ variant: "default", size: "sm" })
            )}
          >
            Small
          </button>
          <button
            type="button"
            className={cn(
              radixButtonVariants({ variant: "default", size: "default" })
            )}
          >
            Default
          </button>
          <button
            type="button"
            className={cn(
              radixButtonVariants({ variant: "default", size: "lg" })
            )}
          >
            Large
          </button>
          <button
            type="button"
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

      {/* Approach 4: Pure CSS Classes */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Approach 4: Pure CSS Classes</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="radix-themed-button radix-themed-button--default radix-themed-button--default-size"
          >
            Default
          </button>
          <button
            type="button"
            className="radix-themed-button radix-themed-button--destructive radix-themed-button--default-size"
          >
            Destructive
          </button>
          <button
            type="button"
            className="radix-themed-button radix-themed-button--outline radix-themed-button--default-size"
          >
            Outline
          </button>
          <button
            type="button"
            className="radix-themed-button radix-themed-button--secondary radix-themed-button--default-size"
          >
            Secondary
          </button>
          <button
            type="button"
            className="radix-themed-button radix-themed-button--ghost radix-themed-button--default-size"
          >
            Ghost
          </button>
          <button
            type="button"
            className="radix-themed-button radix-themed-button--link radix-themed-button--default-size"
          >
            Link
          </button>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            type="button"
            className="radix-themed-button radix-themed-button--default radix-themed-button--sm"
          >
            Small
          </button>
          <button
            type="button"
            className="radix-themed-button radix-themed-button--default radix-themed-button--default-size"
          >
            Default
          </button>
          <button
            type="button"
            className="radix-themed-button radix-themed-button--default radix-themed-button--lg"
          >
            Large
          </button>
          <button
            type="button"
            className="radix-themed-button radix-themed-button--default radix-themed-button--icon"
          >
            ⚙️
          </button>
        </div>
      </section>

      {/* Approach 5: Mapped CSS Variables */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Approach 5: Mapped CSS Variables
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button type="button" className="btn-mapped btn-mapped--primary">
            Primary
          </button>
          <button type="button" className="btn-mapped btn-mapped--destructive">
            Destructive
          </button>
          <button type="button" className="btn-mapped btn-mapped--outline">
            Outline
          </button>
          <button type="button" className="btn-mapped btn-mapped--secondary">
            Secondary
          </button>
          <button type="button" className="btn-mapped btn-mapped--ghost">
            Ghost
          </button>
          <button type="button" className="btn-mapped btn-mapped--link">
            Link
          </button>
        </div>
      </section>

      {/* Approach 6: Theme-aware Components */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">
          Approach 6: Theme-aware Components
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="theme-aware-button theme-aware-button--default"
          >
            Default
          </button>
          <button
            type="button"
            className="theme-aware-button theme-aware-button--sm"
          >
            Small
          </button>
          <button
            type="button"
            className="theme-aware-button theme-aware-button--lg"
          >
            Large
          </button>
          <button
            type="button"
            className="theme-aware-button theme-aware-button--icon"
          >
            ⚙️
          </button>
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
