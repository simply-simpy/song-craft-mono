/**
 * Theme Switcher - Unified Design System
 * 
 * Provides theme switching for both color scheme (light/dark)
 * and brand skin (blue/green/red/purple) using semantic tokens.
 */

import { useState } from "react";
import { useTheme, THEME_OPTIONS, type ColorScheme, type BrandSkin } from "./ThemeProvider";
import { cn } from "../lib/ui-utils";

export function ThemeSwitcher() {
	const { colorScheme, brandSkin, setColorScheme, setBrandSkin } = useTheme();
	const [isOpen, setIsOpen] = useState(false);

	const toggleDropdown = () => setIsOpen(!isOpen);
	const closeDropdown = () => setIsOpen(false);

	const handleColorSchemeChange = (scheme: ColorScheme) => {
		setColorScheme(scheme);
		closeDropdown();
	};

	const handleBrandSkinChange = (skin: BrandSkin) => {
		setBrandSkin(skin);
		closeDropdown();
	};

	return (
		<div className="relative">
			{/* Theme Toggle Button */}
			<button
				type="button"
				onClick={toggleDropdown}
				className={cn(
					"inline-flex gap-2 items-center px-3 py-2 text-sm font-medium rounded-md",
					"border bg-surface-elevated hover:bg-surface-hover border-border-secondary",
					"transition-colors text-fg-secondary hover:text-fg-primary",
					"focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2"
				)}
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				{/* Theme Icon */}
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
				Theme
				{/* Dropdown Arrow */}
				<svg
					aria-hidden="true"
					className={cn(
						"w-4 h-4 transition-transform",
						isOpen && "rotate-180"
					)}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<button
						type="button"
						className="fixed inset-0 z-10"
						onClick={closeDropdown}
					/>

					{/* Dropdown Content */}
					<div className={cn(
						"absolute right-0 top-full z-20 mt-2 w-64",
						"rounded-lg border shadow-lg bg-surface-elevated border-border-secondary",
						"animate-in fade-in scale-in"
					)}>
						<div className="p-2">
							{/* Color Scheme Section */}
							<div className="mb-4">
								<div className="px-2 py-1 mb-2 text-xs font-semibold tracking-wider uppercase text-fg-tertiary">
									Color Scheme
								</div>
								<div className="space-y-1">
									{THEME_OPTIONS.colorSchemes.map((scheme) => (
										<button
											key={scheme.value}
											type="button"
											onClick={() => handleColorSchemeChange(scheme.value)}
											className={cn(
												"flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors",
												colorScheme === scheme.value
													? "bg-surface-brand text-fg-brand font-medium"
													: "text-fg-secondary hover:bg-surface-hover hover:text-fg-primary"
											)}
										>
											<span className="text-base">{scheme.icon}</span>
											<span className="flex-1 text-left">{scheme.label}</span>
											{colorScheme === scheme.value && (
												<svg
													aria-hidden="true"
													className="w-4 h-4 text-fg-brand"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											)}
										</button>
									))}
								</div>
							</div>

							{/* Separator */}
							<div className="mb-4 border-t border-border-secondary" />

							{/* Brand Colors Section */}
							<div>
								<div className="px-2 py-1 mb-2 text-xs font-semibold tracking-wider uppercase text-fg-tertiary">
									Brand Color
								</div>
								<div className="space-y-1">
									{THEME_OPTIONS.brandSkins.map((skin) => (
										<button
											key={skin.value}
											type="button"
											onClick={() => handleBrandSkinChange(skin.value)}
											className={cn(
												"flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors",
												brandSkin === skin.value
													? "bg-surface-brand text-fg-brand font-medium"
													: "text-fg-secondary hover:bg-surface-hover hover:text-fg-primary"
											)}
										>
											{/* Color Swatch */}
											<div
												className="flex-shrink-0 w-4 h-4 rounded-full border border-border-secondary"
												style={{ backgroundColor: skin.color }}
											/>
											<span className="flex-1 text-left">{skin.label}</span>
											{brandSkin === skin.value && (
												<svg
													aria-hidden="true"
													className="w-4 h-4 text-fg-brand"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											)}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
