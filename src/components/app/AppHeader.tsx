import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, Settings } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import CholoKheliMark from "@/components/CholoKheliMark";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/native";

// Routes where a tab-root header (logo, no back) is shown
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
 * Glass top app bar:
 * - frosted translucent surface with a candy-blue → teal hairline
 * - logo mark on tab-roots, back arrow on nested routes
 * - notifications + settings inside circular glass pills
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
  const homeHref =
    role === "scout" ? "/scout" : role === "player" ? "/player" : role === "admin" ? "/admin" : "/";

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-2xl"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        background:
          "linear-gradient(180deg, hsl(var(--background) / 0.75) 0%, hsl(var(--background) / 0.5) 100%)",
        boxShadow:
          "inset 0 -1px 0 hsl(var(--teal-deep) / 0.18), 0 8px 28px -20px rgba(20, 50, 90, 0.5)",
      }}
    >
      {/* candy-blue → teal hairline glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #7EC8FF 25%, hsl(var(--teal-deep)) 55%, #7EC8FF 80%, transparent 100%)",
        }}
      />

      <div className="mx-auto flex h-16 max-w-[430px] items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {!isTabRoot ? (
            <button
              type="button"
              onClick={() => {
                haptic("light");
                router.history.back();
              }}
              aria-label="Back"
              className="-ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-foreground backdrop-blur-xl active:scale-95 transition-transform"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px hsl(var(--teal-deep) / 0.10), 0 4px 14px -8px rgba(20,50,90,0.4)",
              }}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
          ) : (
            <Link
              to={homeHref as any}
              onClick={() => haptic("light")}
              aria-label="Cholo Kheli home"
              className="flex shrink-0 items-center active:scale-[0.97] transition-transform"
            >
              <CholoKheliMark className="h-14 w-14 drop-shadow-[0_3px_12px_hsl(var(--teal-deep)/0.5)]" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-xl"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px hsl(var(--teal-deep) / 0.10), 0 4px 14px -8px rgba(20,50,90,0.4)",
            }}
          >
            <NotificationBell />
          </div>
          <Link
            to={settingsHref as any}
            onClick={() => haptic("light")}
            aria-label="Settings"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-foreground/90 hover:text-foreground backdrop-blur-xl active:scale-95 transition-transform"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px hsl(var(--teal-deep) / 0.10), 0 4px 14px -8px rgba(20,50,90,0.4)",
            }}
          >
            <Settings className="h-[19px] w-[19px]" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
