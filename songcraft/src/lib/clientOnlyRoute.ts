// songcraft/src/lib/clientOnlyRoute.ts
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import React from "react";

/**
 * Creates a client-only route that avoids SSR issues
 * Useful for interactive pages with complex state management
 */
export function createClientOnlyRoute(
	path: string,
	component: React.ComponentType,
) {
	return createFileRoute(path)({
		component: () => {
			const [isClient, setIsClient] = useState(false);

			useEffect(() => {
				setIsClient(true);
			}, []);

			if (!isClient) {
				return React.createElement(
					"div",
					{ className: "min-h-screen flex items-center justify-center" },
					React.createElement(
						"div",
						{ className: "text-center" },
						React.createElement("div", {
							className:
								"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4",
						}),
						React.createElement(
							"div",
							{ className: "text-gray-500" },
							"Loading...",
						),
					),
				);
			}

			const Component = component;
			return React.createElement(Component);
		},
		staticData: {
			isPublic: false,
			clientOnly: true,
		},
	});
}

/**
 * Hook to detect if we're on the client side
 * Useful for components that need to avoid SSR issues
 */
export function useIsClient() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return isClient;
}
