interface PendingComponentProps {
	message?: string;
}

export function PendingComponent({
	message = "Loading...",
}: PendingComponentProps) {
	return (
		<div className="p-4 text-center">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
			<p className="mt-2 text-gray-600">{message}</p>
		</div>
	);
}
