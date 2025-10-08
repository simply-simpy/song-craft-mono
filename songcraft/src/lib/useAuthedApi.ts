import type { ApiRequestConfig } from "./api";
import { apiRequest } from "./api";
import { useAuth } from "./auth";

export function useAuthedApi() {
	const { getAuthHeaders } = useAuth();
	return function authedApi<T>(config: ApiRequestConfig<T>) {
		const headers = { ...(config.headers ?? {}), ...getAuthHeaders() };
		return apiRequest<T>({ ...config, headers });
	};
}
