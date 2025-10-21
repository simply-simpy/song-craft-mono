// songcraft/src/routes/songs/$songId/LyricsPageClient.tsx
import { useParams } from "@tanstack/react-router";
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

export function LyricsPageClient() {
  const { songId } = useParams({ from: "/songs/$songId/lyrics" });
  const { user, getAuthHeaders, isLoaded } = useAuth();
  const { currentContext, isLoading: isLoadingContext } = useAccountContext(
    user?.id || ""
  );

  const [lyricsContent, setLyricsContent] = useState<unknown[]>([]);
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

      const response = await fetch(`${API_ENDPOINTS.songs()}/${songId}`, {
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
  const { data: versionsData } = useQuery({
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

      const response = await fetch(
        `${API_ENDPOINTS.songs()}/${songId}/versions`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch song versions: ${response.status}`);
      }

      return response.json();
    },
    enabled: isLoaded && !!currentContext,
  });

  // Save lyrics mutation
  const saveLyrics = useMutation({
    mutationFn: async (content: unknown[]) => {
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
          if (
            typeof block === "object" &&
            block !== null &&
            "type" in block &&
            (block as { type: string }).type === "p"
          ) {
            const blockObj = (block as unknown) as { children: unknown[] };
            return blockObj.children
              .map((child: unknown) => {
                if (
                  typeof child === "object" &&
                  child !== null &&
                  "text" in child
                ) {
                  return (child as { text: string }).text;
                }
                return "";
              })
              .join("");
          }
          return "";
        })
        .join("\n\n");

      const response = await fetch(`${API_ENDPOINTS.songs()}/${songId}`, {
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

  // Convert song data to Plate.js format when it loads
  useEffect(() => {
    if (songData?.song?.lyrics) {
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

  const handleLyricsChange = (newContent: unknown[]) => {
    setLyricsContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    saveLyrics.mutate(lyricsContent);
  };

  const handleReset = () => {
    if (songData?.song?.lyrics) {
      const lines = songData.song.lyrics.split("\n\n");
      const plateContent = lines.map((line: string) => ({
        type: "p",
        children: [{ text: line }],
      }));
      setLyricsContent(plateContent);
      setHasUnsavedChanges(false);
    }
  };

  // Loading states
  if (!isLoaded || isLoadingContext) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          Loading authentication and account context...
        </div>
      </div>
    );
  }

  if (!user || !currentContext) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">
          User not authenticated or no account context available.
        </div>
      </div>
    );
  }

  if (songError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">
          Error loading song: {songError.message}
        </div>
      </div>
    );
  }

  if (isLoadingSong) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading song data...</div>
      </div>
    );
  }

  return (
    <>
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
        />

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {hasUnsavedChanges && "You have unsaved changes"}
          </div>

          <div className="flex gap-2">
            <FormButton
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
            >
              Reset
            </FormButton>

            <FormButton
              type="button"
              onClick={handleSave}
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
              {versionsData.versions.map((version: unknown) => (
                <div
                  key={(version as { id: string }).id}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {(version as { versionName: string }).versionName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(
                          (version as { createdAt: string }).createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => {
                        // Load this version
                        const versionObj = version as { contentMd: string };
                        const lines = versionObj.contentMd.split("\n\n");
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
    </>
  );
}
