/**
 * Data Table Layout Components
 *
 * Reusable table components extracted from songs/index.tsx patterns.
 * Provides consistent styling for data tables across the app.
 */

import type React from "react";
import { cn } from "../../lib/ui-utils";

interface TableContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function TableContainer({ children, className }: TableContainerProps) {
	return (
		<div
			className={cn(
				"bg-surface-base border border-border-secondary rounded-lg overflow-hidden shadow-sm",
				className,
			)}
		>
			{children}
		</div>
	);
}

interface TableHeaderProps {
	children: React.ReactNode;
	className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
	return (
		<div
			className={cn(
				"bg-bg-secondary border-b border-border-secondary",
				className,
			)}
		>
			<div
				className={cn(
					"px-6 py-3 text-left text-xs font-medium text-fg-tertiary uppercase tracking-wider",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
}

interface TableGridHeaderProps {
	columns: Array<{
		key: string;
		label: string;
		span?: number;
	}>;
	totalCols?: number;
	className?: string;
}

export function TableGridHeader({
	columns,
	totalCols = 12,
	className,
}: TableGridHeaderProps) {
	return (
		<TableHeader className={className}>
			<div className={`grid grid-cols-${totalCols} gap-4`}>
				{columns.map(({ key, label, span = 1 }) => (
					<div key={key} className={`col-span-${span}`}>
						{label}
					</div>
				))}
			</div>
		</TableHeader>
	);
}

interface TableBodyProps {
	children: React.ReactNode;
	maxHeight?: string;
	virtualized?: boolean;
	className?: string;
}

export function TableBody({
	children,
	maxHeight,
	virtualized = false,
	className,
}: TableBodyProps) {
	const heightClass = maxHeight || (virtualized ? "h-150" : "max-h-96");

	return (
		<div className={cn(heightClass, "overflow-auto", className)}>
			{children}
		</div>
	);
}

interface TableRowProps {
	children: React.ReactNode;
	interactive?: boolean;
	className?: string;
}

export function TableRow({
	children,
	interactive = false,
	className,
}: TableRowProps) {
	return (
		<div
			className={cn(
				"border-b border-border-secondary px-6 py-4",
				interactive &&
					"hover:bg-surface-hover cursor-pointer transition-colors",
				className,
			)}
		>
			{children}
		</div>
	);
}

interface TableGridRowProps {
	children: React.ReactNode;
	totalCols?: number;
	interactive?: boolean;
	className?: string;
}

export function TableGridRow({
	children,
	totalCols = 12,
	interactive = false,
	className,
}: TableGridRowProps) {
	return (
		<TableRow interactive={interactive} className={className}>
			<div className={`grid grid-cols-${totalCols} gap-4 items-center`}>
				{children}
			</div>
		</TableRow>
	);
}

interface TableCellProps {
	children: React.ReactNode;
	span?: number;
	align?: "left" | "center" | "right";
	className?: string;
}

export function TableCell({
	children,
	span = 1,
	align = "left",
	className,
}: TableCellProps) {
	const alignClass = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	}[align];

	return (
		<div
			className={cn(
				`col-span-${span}`,
				alignClass,
				"text-fg-primary",
				className,
			)}
		>
			{children}
		</div>
	);
}

interface TableFooterProps {
	children: React.ReactNode;
	className?: string;
}

export function TableFooter({ children, className }: TableFooterProps) {
	return (
		<div
			className={cn(
				"bg-bg-secondary px-6 py-2 border-t border-border-secondary",
				className,
			)}
		>
			<div className="text-sm text-fg-tertiary">{children}</div>
		</div>
	);
}

interface TableStatsProps {
	itemCount: number;
	itemLabel?: string;
	additionalInfo?: string;
	className?: string;
}

export function TableStats({
	itemCount,
	itemLabel = "item",
	additionalInfo,
	className,
}: TableStatsProps) {
	const displayText = `${itemCount} ${
		itemCount === 1 ? itemLabel : `${itemLabel}s`
	} total`;

	return (
		<TableFooter className={className}>
			{displayText}
			{additionalInfo && ` ${additionalInfo}`}
		</TableFooter>
	);
}

// Action buttons for table rows
interface TableActionsProps {
	children: React.ReactNode;
	align?: "left" | "center" | "right";
	className?: string;
}

export function TableActions({
	children,
	align = "left",
	className,
}: TableActionsProps) {
	const alignClass = {
		left: "justify-start",
		center: "justify-center",
		right: "justify-end",
	}[align];

	return (
		<div className={cn("flex gap-2", alignClass, className)}>{children}</div>
	);
}

// Helper component for ID display with monospace font
interface TableIdProps {
	id: string;
	className?: string;
}

export function TableId({ id, className }: TableIdProps) {
	return (
		<span
			className={cn(
				"font-mono text-sm bg-surface-elevated px-2 py-1 rounded text-fg-secondary",
				className,
			)}
		>
			{id}
		</span>
	);
}
