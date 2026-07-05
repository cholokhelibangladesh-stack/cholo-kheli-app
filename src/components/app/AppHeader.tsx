import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, Settings } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/native";

// Routes where a tab-root header (wordmark, no back) is shown
const TAB_ROOTS = new Set([
  "/player",
  "/player/explore",
  "/player/upload",
  "/player/profile",
  "/scout",
  "/scout/explore",
  "/scout/selections",
  "/scout/profile",
  "/admin",
  "/",
]);

/**
 * Instagram-style top app bar:
 * - brand wordmark left, small icon actions right
 * - hairline bottom border
 * - back arrow on nested/detail routes only
 * - notifications and settings live here; language moves to profile settings
 */
const AppHeader = () => {
  const { user, role } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return null;
  if (pathname.startsWith("/auth") || pathname.startsWith("/reset-password")) return null;

  const isTabRoot = TAB_ROOTS.has(pathname);
  const settingsHref =
    role === "scout" ? "/scout/settings" : role === "player" ? "/player/settings" : "/";

  // On tab-root screens the header is minimal chrome (wordmark + right icons).
  // On nested screens we show a back button + no wordmark, freeing space for a
  // route-provided title beneath.
  return (
    <header
      className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-11 max-w-[430px] items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {!isTabRoot ? (
            <button
              type="button"
              onClick={() => {
                haptic("light");
                router.history.back();
              }}
              aria-label="Back"
              className="-ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
            </button>
          ) : (
            <Link to="/" className="flex shrink-0 items-center">
              <span
                className="text-[22px] font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Cholo<span className="text-[hsl(var(--teal-deep,var(--primary)))]">Kheli</span>
              </span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <Link
            to={settingsHref as any}
            onClick={() => haptic("light")}
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-foreground active:scale-95 transition-transform"
          >
            <Settings className="h-[22px] w-[22px]" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
