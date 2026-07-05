import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import AppTabBar from "./AppTabBar";
import AppHeader from "./AppHeader";
import { initNative, isNative } from "@/lib/native";

/**
 * Root visual frame that turns the site into an app-style shell:
 *  - Fixed AppHeader + bottom AppTabBar on authenticated screens.
 *  - Phone-shaped max-width container on desktop preview.
 *  - Full-viewport with safe-area padding on native devices.
 *
 * Marketing routes (unauthenticated) fall through to the existing
 * FloatingHeader/SiteFooter layout so the public site is untouched.
 */

// Routes considered "in-app" (authenticated shell shown)
const APP_PREFIXES = ["/player", "/scout", "/admin"];

const AppFrame = ({ children }: { children: React.ReactNode }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  useEffect(() => {
    initNative();
  }, []);

  const inApp = user && APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!inApp) {
    // Marketing / auth pages — render children directly. Still cap width on
    // very large desktop screens so previews feel phone-shaped when the user
    // has the mobile preview enabled.
    return <>{children}</>;
  }

  return (
    <div
      className="relative mx-auto flex w-full max-w-[430px] flex-col bg-background text-foreground"
      style={{
        minHeight: "100dvh",
        boxShadow: isNative() ? "none" : "0 0 0 1px hsl(var(--border) / 0.4)",
      }}
    >
      <AppHeader />
      <main
        className="flex-1"
        style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>
      <AppTabBar />
    </div>
  );
};

export default AppFrame;
