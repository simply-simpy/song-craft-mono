import { Button, Input, ThemeToggle } from "@/components/ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ui-simple")({
	component: UiSimple,
});

function UiSimple() {
	return (
		<div className="container mx-auto p-8 max-w-4xl">
			<h1 className="text-3xl font-bold text-fg-primary mb-8">UI v2 Demo</h1>

			<div className="space-y-8">
				<section>
					<h2 className="text-xl font-semibold mb-4">Theme Toggle</h2>
					<ThemeToggle className="px-4 py-2 bg-bg-secondary hover:bg-bg-hover rounded-md border border-border-primary" />
				</section>

				<section>
					<h2 className="text-xl font-semibold mb-4">Button Variants</h2>
					<div className="flex flex-wrap gap-3">
						<Button variant="primary">Primary</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="link">Link</Button>
					</div>
				</section>

				<section>
					<h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
					<div className="flex flex-wrap items-center gap-3">
						<Button size="sm">Small</Button>
						<Button size="base">Base</Button>
						<Button size="lg">Large</Button>
					</div>
				</section>

				<section>
					<h2 className="text-xl font-semibold mb-4">Button Intents</h2>
					<div className="flex flex-wrap gap-3">
						<Button intent="brand">Brand</Button>
						<Button intent="accent">Accent</Button>
						<Button intent="destructive">Destructive</Button>
						<Button intent="warning">Warning</Button>
						<Button intent="success">Success</Button>
					</div>
				</section>

				<section>
					<h2 className="text-xl font-semibold mb-4">Input Components</h2>
					<div className="space-y-4 max-w-md">
						<Input placeholder="Standard input with semantic tokens" />
						<Input type="email" placeholder="Email input" />
						<Input type="password" placeholder="Password input" />
						<Input placeholder="Disabled input" disabled />
						<Input placeholder="Invalid input" aria-invalid="true" />
					</div>
				</section>

				<section>
					<h2 className="text-xl font-semibold mb-4">Color Tokens</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="p-4 bg-bg-primary border border-border-primary rounded">
							bg-primary
						</div>
						<div className="p-4 bg-bg-secondary border border-border-primary rounded">
							bg-secondary
						</div>
						<div className="p-4 bg-bg-brand text-fg-on-brand border border-border-primary rounded">
							bg-brand
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
