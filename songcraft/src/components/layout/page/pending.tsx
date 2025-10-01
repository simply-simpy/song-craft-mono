function PendingComponent() {
	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
				<p>Loading organizations...</p>
			</div>
		</div>
	);
}

export default PendingComponent;
