import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { API_ENDPOINTS } from "../../lib/api";
import { requireAuth } from "../../lib/requireAuth.server";

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
      const requestBody = {
        ownerClerkId: "temp-user-id",
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

      const response = await fetch(API_ENDPOINTS.songs(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
