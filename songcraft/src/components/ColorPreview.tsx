import { Button } from "./ui/Button";

export function ColorPreview() {
	return (
		<div className="p-6 space-y-6">
			<h2 className="text-2xl font-bold text-fg-primary">
				Button Color Preview
			</h2>

			{/* Button Variants */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-fg-primary">
					Button Variants
				</h3>
				<div className="flex flex-wrap gap-4">
					<Button variant="default">Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="link">Link</Button>
				</div>
			</div>

			{/* Button Sizes */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-fg-primary">Button Sizes</h3>
				<div className="flex flex-wrap items-center gap-4">
					<Button size="sm">Small</Button>
					<Button size="default">Default</Button>
					<Button size="lg">Large</Button>
					<Button size="icon">🎵</Button>
				</div>
			</div>

			{/* Color Palette */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-fg-primary">Color Palette</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-fg-secondary">
							Brand Colors
						</h4>
						<div className="space-y-1">
							<div className="h-8 bg-brand-primary rounded flex items-center justify-center text-white text-xs">
								Primary
							</div>
							<div className="h-8 bg-brand-hover rounded flex items-center justify-center text-white text-xs">
								Hover
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<h4 className="text-sm font-medium text-fg-secondary">
							Surface Colors
						</h4>
						<div className="space-y-1">
							<div className="h-8 bg-surface-base rounded flex items-center justify-center text-fg-primary text-xs border border-border-primary">
								Base
							</div>
							<div className="h-8 bg-surface-elevated rounded flex items-center justify-center text-fg-primary text-xs border border-border-primary">
								Elevated
							</div>
							<div className="h-8 bg-surface-hover rounded flex items-center justify-center text-fg-primary text-xs border border-border-primary">
								Hover
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<h4 className="text-sm font-medium text-fg-secondary">
							Text Colors
						</h4>
						<div className="space-y-1">
							<div className="h-8 bg-surface-base rounded flex items-center justify-center text-fg-primary text-xs border border-border-primary">
								Primary
							</div>
							<div className="h-8 bg-surface-base rounded flex items-center justify-center text-fg-secondary text-xs border border-border-primary">
								Secondary
							</div>
							<div className="h-8 bg-surface-base rounded flex items-center justify-center text-fg-tertiary text-xs border border-border-primary">
								Tertiary
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<h4 className="text-sm font-medium text-fg-secondary">
							Status Colors
						</h4>
						<div className="space-y-1">
							<div className="h-8 bg-bg-destructive rounded flex items-center justify-center text-white text-xs">
								Destructive
							</div>
							<div className="h-8 bg-bg-warning rounded flex items-center justify-center text-white text-xs">
								Warning
							</div>
							<div className="h-8 bg-bg-success rounded flex items-center justify-center text-white text-xs">
								Success
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CSS Variable Values */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-fg-primary">
					CSS Variable Values
				</h3>
				<div className="bg-surface-elevated p-4 rounded-lg border border-border-primary">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
						<div>
							<div className="text-fg-secondary mb-2">Brand Colors:</div>
							<div className="space-y-1">
								<div>
									<span className="text-fg-tertiary">--brand-primary:</span>{" "}
									<span className="text-fg-primary">hsl(217 91% 60%)</span>
								</div>
								<div>
									<span className="text-fg-tertiary">--brand-hover:</span>{" "}
									<span className="text-fg-primary">hsl(217 91% 55%)</span>
								</div>
							</div>
						</div>
						<div>
							<div className="text-fg-secondary mb-2">Surface Colors:</div>
							<div className="space-y-1">
								<div>
									<span className="text-fg-tertiary">--surface-base:</span>{" "}
									<span className="text-fg-primary">hsl(210 20% 98%)</span>
								</div>
								<div>
									<span className="text-fg-tertiary">--surface-elevated:</span>{" "}
									<span className="text-fg-primary">#ffffff</span>
								</div>
								<div>
									<span className="text-fg-tertiary">--surface-hover:</span>{" "}
									<span className="text-fg-primary">hsl(210 20% 95%)</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
