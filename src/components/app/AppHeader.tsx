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

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-2xl"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        background:
          "linear-gradient(180deg, hsl(var(--background) / 0.72) 0%, hsl(var(--background) / 0.55) 100%)",
        boxShadow:
          "inset 0 -1px 0 hsl(var(--teal-deep) / 0.18), 0 6px 22px -18px rgba(20, 50, 90, 0.35)",
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

      <div className="mx-auto flex h-14 max-w-[430px] items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {!isTabRoot ? (
            <button
              type="button"
              onClick={() => {
                haptic("light");
                router.history.back();
              }}
              aria-label="Back"
              className="-ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground backdrop-blur-md active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
          ) : (
            <Link to="/" aria-label="Cholo Kheli home" className="flex shrink-0 items-center">
              <CholoKheliMark className="h-11 w-11 drop-shadow-[0_2px_8px_hsl(var(--teal-deep)/0.4)]" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
            style={{ boxShadow: "inset 0 0 0 1px hsl(var(--teal-deep) / 0.08)" }}
          >
            <NotificationBell />
          </div>
          <Link
            to={settingsHref as any}
            onClick={() => haptic("light")}
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground/85 hover:text-foreground backdrop-blur-md active:scale-95 transition-transform"
            style={{ boxShadow: "inset 0 0 0 1px hsl(var(--teal-deep) / 0.08)" }}
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
