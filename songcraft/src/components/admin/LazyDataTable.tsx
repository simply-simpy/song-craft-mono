import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Suspense, lazy } from "react";

// Lazy load the DataTable component
const DataTable = lazy(() =>
	import("./DataTable").then((module) => ({
		default: module.DataTable,
	})),
);

interface DataTableProps<TData> {
	title: string;
	columns: ColumnDef<TData>[];
	queryKey: (string | number)[];
	queryFn: (pagination: PaginationState) => Promise<{
		data: TData[];
		rowCount: number;
		pageCount: number;
	}>;
	initialPageSize?: number;
	pageSizeOptions?: number[];
	className?: string;
}

// Loading component for the data table
const DataTableSkeleton = ({ title }: { title: string }) => (
	<div className="max-w-6xl mx-auto p-6">
		<h1 className="text-2xl font-bold mb-6">{title}</h1>
		<div className="space-y-4">
			<div className="skeleton h-12 w-full" />
			<div className="skeleton h-12 w-full" />
			<div className="skeleton h-12 w-full" />
			<div className="skeleton h-12 w-full" />
			<div className="skeleton h-12 w-full" />
		</div>
		<div className="flex items-center gap-2 mt-4">
			<div className="skeleton h-8 w-20" />
			<div className="skeleton h-8 w-20" />
			<div className="skeleton h-8 w-20" />
			<div className="skeleton h-8 w-20" />
		</div>
	</div>
);
// TODO: check if this is safe with unknown
export function LazyDataTable<TData>(props: DataTableProps<TData>) {
	return (
		<Suspense fallback={<DataTableSkeleton title={props.title} />}>
			<DataTable {...(props as DataTableProps<unknown>)} />
		</Suspense>
	);
}
