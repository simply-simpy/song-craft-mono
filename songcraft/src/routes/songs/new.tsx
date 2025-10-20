import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { API_ENDPOINTS } from "../../lib/api";
import { requireAuth } from "../../lib/requireAuth.server";
import { useAuth } from "../../lib/auth";
import { useAccountContext } from "../../lib/useAccountContext";

// Import new reusable components
import { PageContainer, PageHeader } from "../../components/layout/PageLayout";
import {
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  FormRow,
  FormActions,
  FormButton,
  InfoBox,
} from "../../components/forms/FormComponents";

export const Route = createFileRoute("/songs/new")({
  beforeLoad: () => requireAuth(),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user, getAuthHeaders, isLoaded } = useAuth();
  const { currentContext, isLoading: isLoadingContext } = useAccountContext(
    user?.id || ""
  );

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    bpm: "",
    key: "",
    tags: [] as string[],
    lyrics: "",
    midiData: "",
    collaborators: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSong.mutate(formData);
  };

  const createSong = useMutation({
    mutationFn: async (songData: typeof formData) => {
      // Check if we have the required authentication and context
      if (!isLoaded || !user) {
        throw new Error("User not authenticated");
      }

      if (isLoadingContext || !currentContext) {
        throw new Error("Account context not loaded");
      }

      const requestBody = {
        title: songData.title,
        artist: songData.artist || undefined,
        bpm: songData.bpm ? Number.parseInt(songData.bpm) : undefined,
        key: songData.key || undefined,
        tags: songData.tags,
        lyrics: songData.lyrics || undefined,
        midiData: songData.midiData || undefined,
        collaborators: songData.collaborators,
      };

      console.log("🚀 Frontend sending song data:", requestBody);
      console.log("🔐 Auth headers:", getAuthHeaders());
      console.log("🏢 Account context:", currentContext);

      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-account-id": currentContext.currentAccountId,
      };

      // Add auth headers if they exist
      if (authHeaders["x-clerk-user-id"]) {
        headers["x-clerk-user-id"] = authHeaders["x-clerk-user-id"];
      }

      const response = await fetch(API_ENDPOINTS.songs(), {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log("📡 API response status:", response.status);
      const responseData = await response.json();
      console.log("📡 API response data:", responseData);

      if (!response.ok) {
        throw new Error(
          `Failed to create song: ${response.status} - ${JSON.stringify(
            responseData
          )}`
        );
      }

      return responseData;
    },
    onSuccess: (data) => {
      console.log("✅ Song created successfully:", data);
      navigate({ to: "/songs" });
    },
    onError: (error) => {
      console.error("❌ Song creation failed:", error);
    },
  });

  // Show loading state while auth/context is loading
  if (!isLoaded || isLoadingContext) {
    return (
      <PageContainer maxWidth="2xl">
        <PageHeader title="Create New Song" />
        <div className="text-center py-8">
          <div className="text-gray-500">
            Loading authentication and account context...
          </div>
        </div>
      </PageContainer>
    );
  }

  // Show error if no user or context
  if (!user) {
    return (
      <PageContainer maxWidth="2xl">
        <PageHeader title="Create New Song" />
        <div className="text-center py-8">
          <div className="text-red-500">
            User not authenticated. Please sign in.
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!currentContext) {
    return (
      <PageContainer maxWidth="2xl">
        <PageHeader title="Create New Song" />
        <div className="text-center py-8">
          <div className="text-red-500">
            No account context available. Please contact support.
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader title="Create New Song" />

      <InfoBox title="Note">
        A unique short ID will be automatically generated for your song when
        it's created.
      </InfoBox>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField>
          <FormLabel htmlFor="title" required>
            Title
          </FormLabel>
          <FormInput
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter song title"
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor="artist">Artist</FormLabel>
          <FormInput
            id="artist"
            type="text"
            value={formData.artist}
            onChange={(e) =>
              setFormData({ ...formData, artist: e.target.value })
            }
            placeholder="Enter artist name"
          />
        </FormField>

        <FormRow>
          <FormField>
            <FormLabel htmlFor="bpm">BPM</FormLabel>
            <FormInput
              id="bpm"
              type="number"
              min="1"
              max="300"
              value={formData.bpm}
              onChange={(e) =>
                setFormData({ ...formData, bpm: e.target.value })
              }
              placeholder="120"
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="key">Key</FormLabel>
            <FormInput
              id="key"
              type="text"
              value={formData.key}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              placeholder="C"
            />
          </FormField>
        </FormRow>

        <FormField>
          <FormLabel htmlFor="lyrics">Lyrics</FormLabel>
          <FormTextarea
            id="lyrics"
            rows={4}
            value={formData.lyrics}
            onChange={(e) =>
              setFormData({ ...formData, lyrics: e.target.value })
            }
            placeholder="Enter your lyrics here..."
          />
        </FormField>

        <FormActions>
          <FormButton
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: "/songs" })}
          >
            Cancel
          </FormButton>
          <FormButton
            type="submit"
            loading={createSong.isPending}
            disabled={createSong.isPending}
          >
            Create Song
          </FormButton>
        </FormActions>
      </form>
    </PageContainer>
  );
}
