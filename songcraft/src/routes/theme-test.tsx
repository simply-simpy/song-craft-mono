import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "../components/ThemeProvider";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

export const Route = createFileRoute("/theme-test")({
  component: ThemeTestPage,
});

function ThemeTestPage() {
  const { colorScheme, brandSkin } = useTheme();

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="mb-4 text-3xl font-bold text-fg-primary">
          Theme System Test
        </h1>
        <p className="mb-6 text-lg text-fg-secondary">
          Testing the new unified theme system with semantic tokens.
        </p>

        <div className="mb-6">
          <p className="text-sm text-fg-tertiary">
            Current theme:{" "}
            <span className="px-2 py-1 font-mono rounded bg-surface-elevated">
              {colorScheme} + {brandSkin}
            </span>
          </p>
        </div>

        <div className="mb-8">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Color Demonstrations */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Background Colors */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-fg-primary">
            Background Colors
          </h2>

          <div className="p-4 rounded-lg border bg-bg-primary border-border-primary">
            <p className="text-fg-primary">Primary Background</p>
            <p className="text-sm text-fg-secondary">bg-bg-primary</p>
          </div>

          <div className="p-4 rounded-lg border bg-bg-secondary border-border-secondary">
            <p className="text-fg-primary">Secondary Background</p>
            <p className="text-sm text-fg-secondary">bg-bg-secondary</p>
          </div>

          <div className="p-4 rounded-lg bg-bg-brand text-fg-on-brand">
            <p className="font-medium">Brand Background</p>
            <p className="text-sm text-fg-on-brand/80">
              bg-bg-brand (adapts to skin)
            </p>
          </div>
        </div>

        {/* Surface Colors */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-fg-primary">
            Surface Colors
          </h2>

          <div className="p-4 rounded-lg border bg-surface-base border-border-primary">
            <p className="text-fg-primary">Base Surface</p>
            <p className="text-sm text-fg-secondary">bg-surface-base</p>
          </div>

          <div className="p-4 rounded-lg border shadow-sm bg-surface-elevated border-border-secondary">
            <p className="text-fg-primary">Elevated Surface</p>
            <p className="text-sm text-fg-secondary">bg-surface-elevated</p>
          </div>

          <div className="p-4 rounded-lg border bg-surface-brand border-border-primary">
            <p className="text-fg-brand">Brand Surface</p>
            <p className="text-sm text-fg-brand/80">
              bg-surface-brand (adapts to skin)
            </p>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-fg-primary">
            Semantic Colors
          </h2>

          <div className="p-4 rounded-lg bg-bg-destructive text-fg-on-destructive">
            <p className="font-medium">Destructive</p>
            <p className="text-sm text-fg-on-destructive/80">Always red</p>
          </div>

          <div className="p-4 rounded-lg bg-bg-warning text-fg-primary">
            <p className="font-medium">Warning</p>
            <p className="text-sm text-fg-primary/80">Always amber</p>
          </div>

          <div className="p-4 rounded-lg bg-bg-success text-fg-on-accent">
            <p className="font-medium">Success</p>
            <p className="text-sm text-fg-on-accent/80">Always jade</p>
          </div>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-fg-primary">
          Interactive Elements
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Buttons */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-fg-primary">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-md transition-colors bg-bg-brand text-fg-on-brand hover:bg-brand-hover"
              >
                Brand Button
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md border transition-colors bg-surface-elevated border-border-primary text-fg-primary hover:bg-surface-hover"
              >
                Secondary Button
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md transition-opacity bg-bg-destructive text-fg-on-destructive hover:opacity-90"
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
                className="px-3 py-2 w-full rounded-md border bg-surface-elevated border-border-secondary text-fg-primary placeholder-fg-tertiary focus:border-border-focus focus:outline-none"
              />
              <select className="px-3 py-2 w-full rounded-md border bg-surface-elevated border-border-secondary text-fg-primary focus:border-border-focus focus:outline-none">
                <option>Select option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 rounded-lg border bg-surface-elevated border-border-secondary">
        <h3 className="mb-3 text-lg font-semibold text-fg-primary">
          How to Test
        </h3>
        <ol className="space-y-2 list-decimal list-inside text-fg-secondary">
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

        <div className="p-3 mt-4 text-sm rounded border bg-surface-brand/20 border-brand-primary/30 text-fg-brand">
          <strong>Pro tip:</strong> Open browser dev tools and watch the{" "}
          <code>:root</code> CSS variables change as you switch themes. You'll
          see <code>--brand-primary</code>, <code>--bg-brand</code>, etc.
          updating instantly!
        </div>
      </div>
    </div>
  );
}
