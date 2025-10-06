import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "../components/ThemeProvider";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

export const Route = createFileRoute("/theme-test")({
  component: ThemeTestPage,
});

function ThemeTestPage() {
  const { colorScheme, brandSkin } = useTheme();

  return (
    <div className="space-y-8 p-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-fg-primary mb-4">
          Theme System Test
        </h1>
        <p className="text-lg text-fg-secondary mb-6">
          Testing the new unified theme system with semantic tokens.
        </p>

        <div className="mb-6">
          <p className="text-sm text-fg-tertiary">
            Current theme:{" "}
            <span className="font-mono bg-surface-elevated px-2 py-1 rounded">
              {colorScheme} + {brandSkin}
            </span>
          </p>
        </div>

        <div className="mb-8">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Color Demonstrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Background Colors */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-fg-primary">
            Background Colors
          </h2>

          <div className="bg-bg-primary border border-border-primary p-4 rounded-lg">
            <p className="text-fg-primary">Primary Background</p>
            <p className="text-fg-secondary text-sm">bg-bg-primary</p>
          </div>

          <div className="bg-bg-secondary border border-border-secondary p-4 rounded-lg">
            <p className="text-fg-primary">Secondary Background</p>
            <p className="text-fg-secondary text-sm">bg-bg-secondary</p>
          </div>

          <div className="bg-bg-brand text-fg-on-brand p-4 rounded-lg">
            <p className="font-medium">Brand Background</p>
            <p className="text-fg-on-brand/80 text-sm">
              bg-bg-brand (adapts to skin)
            </p>
          </div>
        </div>

        {/* Surface Colors */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-fg-primary">
            Surface Colors
          </h2>

          <div className="bg-surface-base border border-border-primary p-4 rounded-lg">
            <p className="text-fg-primary">Base Surface</p>
            <p className="text-fg-secondary text-sm">bg-surface-base</p>
          </div>

          <div className="bg-surface-elevated shadow-sm border border-border-secondary p-4 rounded-lg">
            <p className="text-fg-primary">Elevated Surface</p>
            <p className="text-fg-secondary text-sm">bg-surface-elevated</p>
          </div>

          <div className="bg-surface-brand border border-border-primary p-4 rounded-lg">
            <p className="text-fg-brand">Brand Surface</p>
            <p className="text-fg-brand/80 text-sm">
              bg-surface-brand (adapts to skin)
            </p>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-fg-primary">
            Semantic Colors
          </h2>

          <div className="bg-bg-destructive text-fg-on-destructive p-4 rounded-lg">
            <p className="font-medium">Destructive</p>
            <p className="text-fg-on-destructive/80 text-sm">Always red</p>
          </div>

          <div className="bg-bg-warning text-fg-primary p-4 rounded-lg">
            <p className="font-medium">Warning</p>
            <p className="text-fg-primary/80 text-sm">Always amber</p>
          </div>

          <div className="bg-bg-success text-fg-on-accent p-4 rounded-lg">
            <p className="font-medium">Success</p>
            <p className="text-fg-on-accent/80 text-sm">Always jade</p>
          </div>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-fg-primary">
          Interactive Elements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-fg-primary">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-bg-brand text-fg-on-brand rounded-md hover:bg-brand-hover transition-colors"
              >
                Brand Button
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-surface-elevated border border-border-primary text-fg-primary rounded-md hover:bg-surface-hover transition-colors"
              >
                Secondary Button
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-bg-destructive text-fg-on-destructive rounded-md hover:opacity-90 transition-opacity"
              >
                Destructive Button
              </button>
            </div>
          </div>

          {/* Form Elements */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-fg-primary">
              Form Elements
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Text input"
                className="w-full px-3 py-2 bg-surface-elevated border border-border-secondary rounded-md text-fg-primary placeholder-fg-tertiary focus:border-border-focus focus:outline-none"
              />
              <select className="w-full px-3 py-2 bg-surface-elevated border border-border-secondary rounded-md text-fg-primary focus:border-border-focus focus:outline-none">
                <option>Select option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-surface-elevated border border-border-secondary rounded-lg p-6">
        <h3 className="text-lg font-semibold text-fg-primary mb-3">
          How to Test
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-fg-secondary">
          <li>
            Use the theme switcher above to change between light/dark modes
          </li>
          <li>Try different brand skins (blue, green, red, purple)</li>
          <li>
            Notice how semantic tokens adapt while maintaining consistency
          </li>
          <li>Refresh the page - your theme should persist</li>
          <li>Check browser dev tools to see CSS variables updating</li>
        </ol>

        <div className="mt-4 p-3 bg-surface-brand/20 border border-brand-primary/30 rounded text-fg-brand text-sm">
          <strong>Pro tip:</strong> Open browser dev tools and watch the{" "}
          <code>:root</code> CSS variables change as you switch themes. You'll
          see <code>--brand-primary</code>, <code>--bg-brand</code>, etc.
          updating instantly!
        </div>
      </div>
    </div>
  );
}
