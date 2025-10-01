// songcraft/src/lib/auth.ts
import { useUser } from "@clerk/tanstack-react-start";
import { env } from "../env";

/**
 * Check if development auth should be enabled
 * Only enabled in development mode with explicit env var
 */
const isDevAuthEnabled = () => {
	return (
		import.meta.env.MODE === "development" &&
		env.VITE_ENABLE_DEV_AUTH === "true"
	);
};

/**
 * Get mock user for development
 * Returns null if dev auth is not enabled or required env vars are missing
 */
const getMockUser = () => {
	if (!isDevAuthEnabled()) {
		return null;
	}

	const devUserId = env.VITE_DEV_USER_ID;
	const devUserEmail = env.VITE_DEV_USER_EMAIL;

	if (!devUserId || !devUserEmail) {
		console.warn(
			"Development auth is enabled but VITE_DEV_USER_ID or VITE_DEV_USER_EMAIL is not set",
		);
		return null;
	}

	return {
		id: devUserId,
		emailAddresses: [{ emailAddress: devUserEmail }],
	};
};

export const useAuth = () => {
	const { user, isLoaded } = useUser();
	const mockUser = getMockUser();

	const getAuthHeaders = () => {
		const currentUser = user || mockUser;
		if (!currentUser) return {};

		return {
			"x-clerk-user-id": currentUser.id,
		};
	};

	return {
		user: user || mockUser,
		isLoaded: isLoaded || !!mockUser, // Consider loaded if we have a mock user
		getAuthHeaders,
	};
};
