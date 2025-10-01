import { useMe } from "../../lib/useMe";

function CurrentUser() {
	const { data: me, isLoading, error } = useMe();

	if (isLoading) {
		return <div className="text-xs text-gray-500">Loading user...</div>;
	}

	if (error) {
		return <div className="text-xs text-red-500">Error loading user</div>;
	}

	if (!me?.data) {
		return <div className="text-xs text-gray-500">No user data</div>;
	}

	const { user, currentContext, permissions } = me.data;

	return (
		<div>
			<div className="font-medium">{user.email}</div>
			<div className="text-gray-500">
				{user.globalRole} • {currentContext?.accountName || "No context"}
			</div>
			<div className="text-gray-400">{permissions.length} permissions</div>
			<ul>
				{permissions.map((permission) => (
					<li key={permission}>{permission}</li>
				))}
			</ul>
		</div>
	);
}

export default CurrentUser;
