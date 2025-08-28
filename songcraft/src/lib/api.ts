// src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/core";

export async function api<T>(path: string, init?: RequestInit) {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: { "content-type": "application/json", ...(init?.headers || {}) },
		cache: "no-store",
	});
	if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
	return res.json() as Promise<T>;
}
