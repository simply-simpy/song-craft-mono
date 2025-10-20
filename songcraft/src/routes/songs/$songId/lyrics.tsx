import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import { useAccountContext } from "../../../lib/useAccountContext";

// Import new reusable components
import {
  PageContainer,
  PageHeader,
} from "../../../components/layout/PageLayout";
import { FormButton, InfoBox } from "../../../components/forms/FormComponents";
import {
  LyricsEditor,
  LyricsToolbar,
} from "../../../components/editor/LyricsEditor";

export const Route = createFileRoute("/songs/$songId/lyrics")({
  component: LyricsPage,
});

function LyricsPage() {
  const { songId } = useParams({ from: "/songs/$songId/lyrics" });
  const { user, getAuthHeaders, isLoaded } = useAuth();
  const { currentContext, isLoading: isLoadingContext } = useAccountContext(
    user?.id || ""
  );

  const [lyricsContent, setLyricsContent] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch song data
  const {
    data: songData,
    isLoading: isLoadingSong,
    error: songError,
  } = useQuery({
    queryKey: ["song", songId],
    queryFn: async () => {
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authHeaders["x-clerk-user-id"]) {
        headers["x-clerk-user-id"] = authHeaders["x-clerk-user-id"];
      }

      if (currentContext?.currentAccountId) {
        headers["x-account-id"] = currentContext.currentAccountId;
      }

      const response = await fetch(API_ENDPOINTS.songs(songId), {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch song: ${response.status}`);
      }

      return response.json();
    },
    enabled: isLoaded && !!currentContext,
  });

  // Fetch song versions (lyrics history)
  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    queryKey: ["songVersions", songId],
    queryFn: async () => {
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authHeaders["x-clerk-user-id"]) {
        headers["x-clerk-user-id"] = authHeaders["x-clerk-user-id"];
      }

      if (currentContext?.currentAccountId) {
        headers["x-account-id"] = currentContext.currentAccountId;
      }

      const response = await fetch(`${API_ENDPOINTS.songs(songId)}/versions`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch song versions: ${response.status}`);
      }

      return response.json();
    },
    enabled: isLoaded && !!currentContext,
  });

  // Save lyrics mutation
  const saveLyrics = useMutation({
    mutationFn: async (content: any[]) => {
      if (!isLoaded || !user || !currentContext) {
        throw new Error("User not authenticated or context not loaded");
      }

      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authHeaders["x-clerk-user-id"]) {
        headers["x-clerk-user-id"] = authHeaders["x-clerk-user-id"];
      }

      if (currentContext?.currentAccountId) {
        headers["x-account-id"] = currentContext.currentAccountId;
      }

      // Convert Plate.js content to markdown or HTML for storage
      const lyricsText = content
        .map((block) => {
          if (block.type === "p") {
            return block.children.map((child: any) => child.text).join("");
          }
          return "";
        })
        .join("\n\n");

      const response = await fetch(API_ENDPOINTS.songs(songId), {
        method: "PUT",
        headers,
        body: JSON.stringify({
          lyrics: lyricsText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save lyrics: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      console.error("Failed to save lyrics:", error);
    },
  });

  // Initialize lyrics content when song data loads
  useEffect(() => {
    if (songData?.song?.lyrics) {
      // Convert lyrics text to Plate.js format
      const lines = songData.song.lyrics.split("\n\n");
      const plateContent = lines.map((line: string) => ({
        type: "p",
        children: [{ text: line }],
      }));

      if (plateContent.length === 0) {
        plateContent.push({
          type: "p",
          children: [{ text: "" }],
        });
      }

      setLyricsContent(plateContent);
    }
  }, [songData]);

  const handleLyricsChange = (newContent: any[]) => {
    setLyricsContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    saveLyrics.mutate(lyricsContent);
  };

  // Show loading state while auth/context is loading
  if (!isLoaded || isLoadingContext) {
    return (
      <PageContainer maxWidth="4xl">
        <PageHeader title="Song Lyrics" />
        <div className="text-center py-8">
          <div className="text-gray-500">
            Loading authentication and account context...
          </div>
        </div>
      </PageContainer>
    );
  }

  // Show error if no user or context
  if (!user || !currentContext) {
    return (
      <PageContainer maxWidth="4xl">
        <PageHeader title="Song Lyrics" />
        <div className="text-center py-8">
          <div className="text-red-500">
            User not authenticated or no account context available.
          </div>
        </div>
      </PageContainer>
    );
  }

  if (isLoadingSong) {
    return (
      <PageContainer maxWidth="4xl">
        <PageHeader title="Song Lyrics" />
        <div className="text-center py-8">
          <div className="text-gray-500">Loading song data...</div>
        </div>
      </PageContainer>
    );
  }

  if (songError) {
    return (
      <PageContainer maxWidth="4xl">
        <PageHeader title="Song Lyrics" />
        <div className="text-center py-8">
          <div className="text-red-500">
            Error loading song: {songError.message}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title={`Lyrics: ${songData?.song?.title || "Untitled Song"}`}
        subtitle={
          songData?.song?.artist ? `by ${songData.song.artist}` : undefined
        }
      />

      <InfoBox title="Lyrics Editor">
        Write your song lyrics using the Notion-style block editor below. Use
        the toolbar to add different song sections like verses, choruses, and
        bridges.
      </InfoBox>

      <div className="space-y-4">
        <LyricsToolbar />

        <LyricsEditor
          initialValue={lyricsContent}
          onChange={handleLyricsChange}
          placeholder="Start writing your lyrics... Use the toolbar above to add song sections."
          className="w-full"
        />

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {hasUnsavedChanges && "You have unsaved changes"}
          </div>

          <div className="flex gap-2">
            <FormButton
              type="button"
              variant="secondary"
              onClick={() => {
                // Reset to original content
                if (songData?.song?.lyrics) {
                  const lines = songData.song.lyrics.split("\n\n");
                  const plateContent = lines.map((line: string) => ({
                    type: "p",
                    children: [{ text: line }],
                  }));
                  setLyricsContent(plateContent);
                  setHasUnsavedChanges(false);
                }
              }}
              disabled={!hasUnsavedChanges}
            >
              Reset
            </FormButton>

            <FormButton
              type="button"
              onClick={handleSave}
              loading={saveLyrics.isPending}
              disabled={!hasUnsavedChanges || saveLyrics.isPending}
            >
              {saveLyrics.isPending ? "Saving..." : "Save Lyrics"}
            </FormButton>
          </div>
        </div>

        {/* Version History */}
        {versionsData?.versions && versionsData.versions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Version History</h3>
            <div className="space-y-2">
              {versionsData.versions.map((version: any, index: number) => (
                <div
                  key={version.id}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{version.versionName}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => {
                        // Load this version
                        const lines = version.contentMd.split("\n\n");
                        const plateContent = lines.map((line: string) => ({
                          type: "p",
                          children: [{ text: line }],
                        }));
                        setLyricsContent(plateContent);
                        setHasUnsavedChanges(true);
                      }}
                    >
                      Load Version
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
