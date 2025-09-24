// Centralized API configuration for SongCraft
import { env } from "../env";

// API URL configuration with proper fallbacks
export const API_URL = env.VITE_API_URL || "/api";

// Helper function to build API endpoints
export const buildApiUrl = (endpoint: string): string => {
  // If we have a full URL (like http://backend:4500), use it directly
  if (API_URL.startsWith("http")) {
    return `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  }

  // If we have a relative path (like /api), combine it with the endpoint
  return `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  songs: () => buildApiUrl("/songs"),
  song: (id: string) => buildApiUrl(`/songs/${id}`),
  songVersions: (id: string) => buildApiUrl(`/songs/${id}/versions`),
  health: () => buildApiUrl("/health"),
  me: () => buildApiUrl("/me"),
  admin: {
    orgs: () => buildApiUrl("/admin/orgs"),
    users: () => buildApiUrl("/admin/users"),
    accounts: () => buildApiUrl("/admin/accounts"),
    stats: () => buildApiUrl("/admin/stats"),
    userContext: (userId: string) =>
      buildApiUrl(`/admin/users/${userId}/context`),
    switchUserContext: (userId: string) =>
      buildApiUrl(`/admin/users/${userId}/context/switch`),
  },
  projects: () => buildApiUrl("/projects"),
  project: (id: string) => buildApiUrl(`/projects/${id}`),
  sessions: () => buildApiUrl("/sessions"),
  projectSessions: (id: string) => buildApiUrl(`/projects/${id}/sessions`),
} as const;

// Helper function for API requests
export const apiRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};
