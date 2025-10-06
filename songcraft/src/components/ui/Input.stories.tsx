import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
	title: "UI/Input",
	component: Input,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: { type: "select" },
			options: ["sm", "default", "lg"],
		},
		disabled: {
			control: { type: "boolean" },
		},
		type: {
			control: { type: "select" },
			options: ["text", "email", "password", "number", "search"],
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		placeholder: "Enter text...",
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		placeholder: "Small input",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		placeholder: "Large input",
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		placeholder: "Disabled input",
		defaultValue: "Cannot edit this",
	},
};

export const WithValue: Story = {
	args: {
		defaultValue: "Pre-filled value",
		placeholder: "Enter text...",
	},
};

export const Email: Story = {
	args: {
		type: "email",
		placeholder: "Enter email...",
	},
};

export const Password: Story = {
	args: {
		type: "password",
		placeholder: "Enter password...",
	},
};

export const AllSizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-64">
			<Input size="sm" placeholder="Small input" />
			<Input size="default" placeholder="Default input" />
			<Input size="lg" placeholder="Large input" />
		</div>
	),
};

export const AllTypes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-64">
			<Input type="text" placeholder="Text input" />
			<Input type="email" placeholder="Email input" />
			<Input type="password" placeholder="Password input" />
			<Input type="number" placeholder="Number input" />
			<Input type="search" placeholder="Search input" />
		</div>
	),
};
