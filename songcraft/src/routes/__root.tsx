import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
// app/routes/__root.tsx
import * as React from "react";
import ClerkProvider from "../integrations/clerk/provider";
// Import styles
import "../styles.css";
import Navigation from "@/components/layout/navigation/navigation";
import { AccountContextDisplay } from "@/components/layout/navigation/AccountContextDisplay.tsx";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "@tanstack/react-router";
import CurrentUser from "@/components/admin/currentUser";
import { ThemeProvider } from "@/components/ui-v2";
export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "SongCraft",
      },
    ],
    links: [
      // Google Fonts
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,300&display=swap",
      },
    ],
  }),
  component: Root,
});

function Root() {
  const [rightOpen, setRightOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const location = useRouterState({ select: (s) => s.location });
  const isAuthPage = location.pathname.startsWith("/sign-in");

  // Cmd+K command palette toggle
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <ClerkProvider>
        <ThemeProvider>
          <body>
          {isAuthPage ? (
            <main className="p-6 min-h-screen grid place-items-center">
              <Outlet />
            </main>
          ) : (
            <>
              {/* Temporarily disable auth redirect for development */}
              <SignedOut>
                <Navigate
                  to="/sign-in"
                  search={{
                    returnTo: `${location.pathname}${location.search ?? ""}`,
                  }}
                />
              </SignedOut>{" "}
              <SignedIn>
                <div className="h-screen grid grid-rows-[48px_1fr]">
                  {/* Top bar with search */}
                  <div className="flex items-center gap-3 px-3 border-b border-gray-200">
                    <Link to="/" className="font-bold">
                      SongScribe
                    </Link>
                    <Link to="/ui-simple" className="text-sm text-blue-600 hover:underline">
                      UI Demo
                    </Link>
                    <input
                      placeholder="Search (⌘K)"
                      onFocus={() => setCmdOpen(true)}
                      className="flex-1 h-8 border border-gray-300 rounded-md px-2"
                    />
                    <SignedIn>
                      <button
                        type="button"
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                      <AccountContextDisplay />
                    </SignedIn>
                    <button
                      type="button"
                      onClick={() => setRightOpen((v) => !v)}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {rightOpen ? "Hide" : "Show"} Panel
                    </button>
                  </div>

                  {/* 3-column layout */}
                  <div className="grid grid-cols-[260px_1fr]   h-full">
                    {/* Left nav */}
                    <aside className="border-r border-gray-200 p-3">
                      <Navigation />
                      <CurrentUser />
                    </aside>

                    {/* Main content */}
                    <main className="p-3 overflow-auto">
                      <Outlet />
                    </main>
                  </div>

                  {/* Command palette modal */}
                  {cmdOpen && (
                    <div
                      onClick={() => setCmdOpen(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setCmdOpen(false);
                        }
                      }}
                      // biome-ignore lint/a11y/useSemanticElements: <explanation>Role seems appropriate</explanation>
                      role="button"
                      tabIndex={0}
                      className="fixed inset-0 bg-black/20 grid place-items-start-center pt-[10vh]"
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                          }
                        }}
                        // biome-ignore lint/a11y/useSemanticElements: <explanation>Role seems appropriate</explanation>
                        role="button"
                        tabIndex={0}
                        className="w-[720px] max-w-[90vw] bg-white rounded-lg shadow-2xl"
                      >
                        <div className="p-3 border-b border-gray-200">
                          <input
                            placeholder="Search songs, commands…"
                            className="w-full h-9 border border-gray-300 rounded-md px-2"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-gray-600">
                            Recent: last opened songs…
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SignedIn>
            </>
          )}
          <Scripts />
          </body>
        </ThemeProvider>
      </ClerkProvider>
    </html>
  );
}
