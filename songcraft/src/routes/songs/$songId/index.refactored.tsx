// app/routes/songs/$songId/index.page.tsx
import { createFileRoute, useParams } from "@tanstack/react-router";

// Import new reusable components
import { PageContainer, PageHeader } from "../../../components/layout/PageLayout";
import { ActionLink, NavMenu, NavGroup } from "../../../components/navigation/NavigationComponents";

export const Route = createFileRoute("/songs/$songId/index/refactored")({ component: Page });

function Page() {
  const { songId } = useParams({ from: "/songs/$songId/" });
  
  return (
    <PageContainer maxWidth="4xl">
      <PageHeader title="Song Overview" />
      
      <NavMenu>
        <NavGroup title="Song Tools">
          <ActionLink 
            to="/songs/$songId/lyrics" 
            params={{ songId }}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            }
            description="Write and edit song lyrics with version history"
          >
            Lyric Writing
          </ActionLink>
          
          <ActionLink 
            to="/songs/$songId/record" 
            params={{ songId }}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            }
            description="Record audio takes and manage recordings"
          >
            Record Takes
          </ActionLink>
          
          <ActionLink 
            to="/songs/$songId/midi" 
            params={{ songId }}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            }
            description="Generate and edit MIDI data for the song"
          >
            Create MIDI
          </ActionLink>
        </NavGroup>

        <NavGroup title="Publishing">
          <ActionLink 
            to="/songs/$songId/package" 
            params={{ songId }}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            description="Prepare copyright and publishing documentation"
          >
            Copyright Package
          </ActionLink>
        </NavGroup>

        <NavGroup title="Collaboration">
          <ActionLink 
            to="/songs/$songId/collab" 
            params={{ songId }}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            description="Enable real-time collaboration with other musicians"
          >
            Enter Collaboration Mode
          </ActionLink>
        </NavGroup>
      </NavMenu>
    </PageContainer>
  );
}