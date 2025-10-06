import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta = {
	title: "Theme/Theme Test",
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ThemeControlsTest: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="text-center">
				<h2 className="text-xl font-bold mb-4">Theme Controls Test</h2>
				<p className="text-gray-600 mb-4">
					Use the Controls panel to change theme settings and watch the buttons
					update!
				</p>
			</div>

			<div className="flex flex-col items-center gap-4">
				<div className="flex gap-2 flex-wrap justify-center">
					<Button>Primary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="link">Link</Button>
				</div>

				<div className="flex gap-2 flex-wrap justify-center">
					<Button variant="destructive">Destructive</Button>
					<Button variant="secondary">Secondary</Button>
				</div>

				<div className="flex gap-2 flex-wrap justify-center items-center">
					<Button size="sm">Small</Button>
					<Button size="default">Default</Button>
					<Button size="lg">Large</Button>
					<Button size="icon">⚙️</Button>
				</div>
			</div>

			<div className="text-center text-sm text-gray-500 mt-6 p-4 bg-gray-50 rounded-lg">
				<p>
					<strong>Expected Behavior:</strong>
				</p>
				<p>
					• Primary buttons should change color when you change "Accent Color"
				</p>
				<p>• Border radius should change when you change "Radius"</p>
				<p>• Component size should change when you change "Scaling"</p>
				<p>• Destructive buttons should stay red (semantic color)</p>
			</div>
		</div>
	),
};
