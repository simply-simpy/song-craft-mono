import { z } from "zod";

import { env } from "../env";

export const API_URL = env.VITE_API_URL || "/api";

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizeBase = (base: string) =>
  base.endsWith("/") && base !== "/" ? base.slice(0, -1) : base;

const normalizePath = (endpoint: string) =>
  endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

export const buildApiUrl = (endpoint: string): string => {
  if (isAbsoluteUrl(endpoint)) {
    return endpoint;
  }

  const base = normalizeBase(API_URL);
  return `${base}${normalizePath(endpoint)}`;
};

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

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
    public readonly body: unknown
  ) {
    super(`API request failed (${status} ${statusText})`);
    this.name = "ApiError";
  }
}

export interface ApiRequestConfig<T> {
  endpoint: string;
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  schema?: z.ZodType<T>;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
}

export const apiRequest = async <T = unknown>(
  config: ApiRequestConfig<T>
): Promise<T> => {
  const {
    endpoint,
    method = "GET",
    body,
    headers,
    schema,
    signal,
    credentials,
  } = config;

  const url = buildApiUrl(endpoint);

  const requestHeaders = new Headers(headers ?? {});
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (isFormData) {
    requestHeaders.delete("Content-Type");
  }

  const normalizedContentType =
    (requestHeaders.get("Content-Type") ?? "").toLowerCase();

  let requestBody: BodyInit | undefined;
  if (isFormData) {
    requestBody = body as FormData;
  } else if (body !== undefined) {
    const shouldSerializeBody =
      normalizedContentType.includes("application/json") &&
      typeof body !== "string";

    requestBody = shouldSerializeBody
      ? (JSON.stringify(body) as BodyInit)
      : (body as BodyInit);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    signal,
    credentials,
    body: requestBody,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let payload: unknown = null;
  if (![204, 205].includes(response.status)) {
    if (isJson) {
      payload = await response.json();
    } else {
      const text = await response.text();
      payload = text.length > 0 ? text : null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error: unknown }).error)
        : response.statusText;

    throw new ApiError(response.status, errorMessage, url, payload);
  }

  if (schema) {
    return schema.parse(payload);
  }

  return payload as T;
};
