import type { Preview } from "@storybook/react-vite";
import { withRadixThemeControls } from "./decorators";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [withRadixThemeControls],
  argTypes: {
    // Individual theme controls for better UX
    accentColor: {
      control: { type: "select" },
      options: [
        "ruby",
        "gray",
        "gold",
        "bronze",
        "brown",
        "yellow",
        "amber",
        "orange",
        "tomato",
        "red",
        "crimson",
        "pink",
        "plum",
        "purple",
        "violet",
        "iris",
        "indigo",
        "blue",
        "cyan",
        "teal",
        "jade",
        "green",
        "grass",
        "lime",
        "mint",
        "sky",
      ],
      description: "Accent color for primary elements",
      defaultValue: "blue",
    },
    grayColor: {
      control: { type: "select" },
      options: ["gray", "mauve", "slate", "sage", "olive", "sand"],
      description: "Gray color palette",
      defaultValue: "gray",
    },
    radius: {
      control: { type: "select" },
      options: ["none", "small", "medium", "large", "full"],
      description: "Border radius for components",
      defaultValue: "medium",
    },
    scaling: {
      control: { type: "select" },
      options: ["90%", "95%", "100%", "105%", "110%"],
      description: "Component scaling",
      defaultValue: "100%",
    },
    appearance: {
      control: { type: "select" },
      options: ["light", "dark", "inherit"],
      description: "Theme appearance",
      defaultValue: "inherit",
    },
  },
};

export default preview;
