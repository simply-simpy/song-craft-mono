/**
 * Page Layout Components
 *
 * Reusable layout components extracted from common patterns in routes.
 * Uses semantic tokens and @apply classes for consistent styling.
 */

import { cn } from "../../lib/ui-utils";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "none";
}

export function PageContainer({
	children,
	className,
	maxWidth = "6xl",
}: PageContainerProps) {
	const maxWidthClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		"2xl": "max-w-2xl",
		"4xl": "max-w-4xl",
		"6xl": "max-w-6xl",
		none: "",
	};

	return (
		<div
			className={cn(
				"mx-auto p-6",
				maxWidth !== "none" && maxWidthClasses[maxWidth],
				className,
			)}
		>
			{children}
		</div>
	);
}

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	subtitle,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<div className={cn("flex justify-between items-center mb-6", className)}>
			<div>
				<h1 className="text-3xl font-bold text-fg-primary">{title}</h1>
				{subtitle && (
					<p className="text-lg text-fg-secondary mt-1">{subtitle}</p>
				)}
			</div>
			{actions && <div className="flex items-center gap-4">{actions}</div>}
		</div>
	);
}

interface LoadingStateProps {
	message?: string;
	className?: string;
}

export function LoadingState({
	message = "Loading...",
	className,
}: LoadingStateProps) {
	return (
		<PageContainer className={className}>
			<div className="text-center text-fg-secondary">{message}</div>
		</PageContainer>
	);
}

interface ErrorStateProps {
	title?: string;
	message: string;
	className?: string;
}

export function ErrorState({
	title = "Error",
	message,
	className,
}: ErrorStateProps) {
	return (
		<PageContainer className={className}>
			<div className="text-center">
				<h1 className="text-2xl font-bold text-fg-destructive mb-4">{title}</h1>
				<p className="text-fg-secondary">{message}</p>
			</div>
		</PageContainer>
	);
}

interface EmptyStateProps {
	title: string;
	description: string;
	action?: React.ReactNode;
	className?: string;
}

export function EmptyState({
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div className={cn("text-center py-12", className)}>
			<div className="text-fg-tertiary text-lg mb-4">{title}</div>
			<p className="text-fg-secondary mb-4">{description}</p>
			{action}
		</div>
	);
}
