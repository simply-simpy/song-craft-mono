import type { Meta, StoryObj } from "@storybook/react";
import { ThemePanel } from "@radix-ui/themes";
import { Button } from "./Button";

const meta: Meta = {
  title: "Theme/Theme Panel",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveTheme: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", minHeight: "500px" }}>
      {/* Left side - Component examples */}
      <div style={{ flex: 1, padding: "2rem" }}>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Button Examples</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Primary Variants</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button>Primary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Semantic Variants
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="secondary">Secondary</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Sizes</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">⚙️</Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Typography</h2>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <h3 className="text-2xl font-medium">Heading 3</h3>
              <p className="text-lg">Large paragraph text</p>
              <p className="text-base">Regular paragraph text</p>
              <p className="text-sm text-gray-600">Small text</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Form Elements</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label
                  htmlFor="input-field"
                  className="block text-sm font-medium mb-1"
                >
                  Input Field
                </label>
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="select"
                  className="block text-sm font-medium mb-1"
                >
                  Select
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Theme panel */}
      <div
        style={{
          width: "350px",
          borderLeft: "1px solid #e5e7eb",
          padding: "1rem",
          backgroundColor: "#f9fafb",
        }}
      >
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          Theme Controls
        </h3>
        <ThemePanel />
      </div>
    </div>
  ),
};
