import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type PaginationState,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

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

export function DataTable<TData>({
	title,
	columns,
	queryKey,
	queryFn,
	initialPageSize = 20,
	pageSizeOptions = [10, 20, 50, 100],
	className = "",
}: DataTableProps<TData>) {
	// Pagination state
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: initialPageSize,
	});

	// Fetch data with pagination
	const { data, isLoading, error, isFetching } = useQuery({
		queryKey: [...queryKey, pagination],
		queryFn: () => queryFn(pagination),
		placeholderData: keepPreviousData, // Keep previous data while loading
	});

	const defaultData = useMemo(() => [], []);

	const table = useReactTable({
		data: data?.data ?? defaultData,
		columns,
		rowCount: data?.rowCount ?? 0,
		state: {
			pagination,
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true, // Server-side pagination
	});

	if (isLoading) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<h1 className="text-2xl font-bold mb-6">{title}</h1>
				<div className="flex justify-center items-center h-32">
					<span className="loading loading-spinner loading-lg" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<h1 className="text-2xl font-bold mb-6">{title}</h1>
				<div className="alert alert-error">
					<span>Error loading data: {error.message}</span>
				</div>
			</div>
		);
	}

	if (!data?.data || data.data.length === 0) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<h1 className="text-2xl font-bold mb-6">{title}</h1>
				<div className="text-center text-gray-500 py-8">No data found</div>
			</div>
		);
	}

	return (
		<div className={`max-w-6xl mx-auto p-6 ${className}`}>
			<h1 className="text-2xl font-bold mb-6">{title}</h1>

			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} className="hover:bg-gray-50">
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			<div className="flex items-center gap-2 mt-4">
				<button
					type="button"
					className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={() => table.firstPage()}
					disabled={!table.getCanPreviousPage()}
				>
					{"<<"}
				</button>
				<button
					type="button"
					className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					{"<"}
				</button>
				<button
					type="button"
					className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					{">"}
				</button>
				<button
					type="button"
					className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={() => table.lastPage()}
					disabled={!table.getCanNextPage()}
				>
					{">>"}
				</button>
				<span className="flex items-center gap-1">
					<div>Page</div>
					<strong>
						{table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount().toLocaleString()}
					</strong>
				</span>
				<span className="flex items-center gap-1">
					| Go to page:
					<input
						type="number"
						min="1"
						max={table.getPageCount()}
						defaultValue={table.getState().pagination.pageIndex + 1}
						onChange={(e) => {
							const page = e.target.value ? Number(e.target.value) - 1 : 0;
							table.setPageIndex(page);
						}}
						className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</span>
				<select
					value={table.getState().pagination.pageSize}
					onChange={(e) => {
						table.setPageSize(Number(e.target.value));
					}}
					className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					{pageSizeOptions.map((pageSize) => (
						<option key={pageSize} value={pageSize}>
							Show {pageSize}
						</option>
					))}
				</select>
				{isFetching ? (
					<span className="loading loading-spinner loading-sm" />
				) : null}
			</div>
			<div className="mt-2 text-sm text-gray-600">
				Showing {table.getRowModel().rows.length.toLocaleString()} of{" "}
				{data?.rowCount?.toLocaleString()} Rows
			</div>
		</div>
	);
}
