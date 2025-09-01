// app/routes/index.page.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    // API should return { songId: string | null }
    const res = await fetch("/api/core/me/last", { cache: "no-store" });
    if (res.ok) {
      const { songId } = await res.json();
      if (songId)
        throw redirect({ to: "/songs/$songId/lyrics", params: { songId } });
    }
    // fallback to songs list
    throw redirect({ to: "/songs" });
  },
  component: () => null,
});
