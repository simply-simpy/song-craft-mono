import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "Button variant style",
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
      description: "Button size",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disabled state",
    },
    children: {
      control: { type: "text" },
      description: "Button content",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🚀</Button>
    </div>
  ),
};

export const ThemeDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Primary Buttons (adapt to theme)
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          Semantic Buttons (fixed colors)
        </h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="destructive">Destructive</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">All Sizes</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">⚙️</Button>
        </div>
      </div>

      <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
        <p>
          <strong>🎨 Theme Controls:</strong>
        </p>
        <p>
          • <strong>Accent Color:</strong> Changes primary button colors
        </p>
        <p>
          • <strong>Gray Color:</strong> Changes neutral elements
        </p>
        <p>
          • <strong>Radius:</strong> Changes border radius
        </p>
        <p>
          • <strong>Scaling:</strong> Changes component size
        </p>
        <p>
          • <strong>Appearance:</strong> Changes light/dark mode
        </p>
        <p className="mt-2">
          <strong>Note:</strong> Primary buttons adapt to theme changes,
          semantic buttons stay consistent!
        </p>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};
