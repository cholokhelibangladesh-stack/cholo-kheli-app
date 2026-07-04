import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, LogOut } from "lucide-react";
import CholoKheliMark from "@/components/CholoKheliMark";
import NotificationBell from "@/components/NotificationBell";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/native";

// Routes where a tab-root header (logo, no back) is shown
const TAB_ROOTS = new Set(["/player", "/scout", "/admin", "/"]);

const AppHeader = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return null;
  if (pathname.startsWith("/auth") || pathname.startsWith("/reset-password")) return null;

  const isTabRoot = TAB_ROOTS.has(pathname);

  return (
    <header
      className="sticky top-0 z-30 border-b border-border/50 backdrop-blur-xl"
      style={{
        background: "hsl(var(--background) / 0.9)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
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
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 text-foreground active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <CholoKheliMark className="h-6 w-8 text-foreground" accent="hsl(var(--teal-deep))" />
              <span className="font-display text-sm font-semibold tracking-[0.04em]">
                CHOLO <span className="text-[hsl(var(--teal-deep))] font-bold">KHELI</span>
              </span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher variant="chip" className="border border-border/60 text-muted-foreground hover:text-foreground" />
          <NotificationBell />
          <button
            type="button"
            onClick={async () => {
              haptic("medium");
              await signOut();
            }}
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
