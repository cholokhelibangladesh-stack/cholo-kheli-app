import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PlusSquare, User, ClipboardList, Shield, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/native";
import TabSwipeNavigator from "./TabSwipeNavigator";

type Tab = {
  label: string;
  to: string;
  Icon: typeof Home;
  emphasize?: boolean;
};

/**
 * Glass bottom tab bar:
 * - frosted translucent surface with a candy-blue → teal top hairline
 * - active tab sits inside a soft teal/candy-blue glass pill with a glow dot
 * - inactive icons are muted foreground; center create button gets a
 *   candy-blue → teal gradient chip
 */
const AppTabBar = () => {
  const { user, role } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return null;

  const hiddenOn = ["/auth", "/reset-password"];
  if (hiddenOn.some((p) => pathname.startsWith(p))) return null;

  let tabs: Tab[] = [];
  if (role === "player") {
    tabs = [
      { label: "Home", to: "/player", Icon: Home },
      { label: "Explore", to: "/player/explore", Icon: Search },
      { label: "Upload", to: "/player/upload", Icon: PlusSquare, emphasize: true },
      { label: "Profile", to: "/player/profile", Icon: User },
    ];
  } else if (role === "scout") {
    tabs = [
      { label: "Home", to: "/scout", Icon: Home },
      { label: "Explore", to: "/scout/explore", Icon: Search },
      { label: "Picks", to: "/scout/selections", Icon: ClipboardList },
      { label: "Profile", to: "/scout/profile", Icon: User },
    ];
  } else if (role === "admin") {
    tabs = [
      { label: "Home", to: "/admin", Icon: Home },
      { label: "Explore", to: "/admin/explore", Icon: Search },
      { label: "Panel", to: "/admin/panel", Icon: Shield },
    ];
  } else {
    return null;
  }

  return (
    <>
    <TabSwipeNavigator tabs={tabs.map((t) => t.to)} />
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 backdrop-blur-2xl"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        background:
          "linear-gradient(0deg, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.6) 100%)",
        boxShadow:
          "inset 0 1px 0 hsl(var(--teal-deep) / 0.18), 0 -8px 30px -18px rgba(20, 50, 90, 0.45)",
      }}
    >
      {/* candy-blue → teal hairline glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #7EC8FF 25%, hsl(var(--teal-deep)) 55%, #7EC8FF 80%, transparent 100%)",
        }}
      />

      <ul className="mx-auto flex h-16 max-w-[430px] items-stretch justify-around px-3">
        {tabs.map(({ label, to, Icon, emphasize }) => {
          const exactOnly = to === "/player" || to === "/scout" || to === "/admin" || to === "/";
          const isExploreTab = to.endsWith("/explore");
          const onResume = pathname.startsWith("/resume/") || pathname.startsWith("/resume");
          const active = exactOnly
            ? pathname === to
            : pathname === to || pathname.startsWith(to + "/") || (isExploreTab && onResume);
          const useGradient = active;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                onClick={() => haptic("light")}
                aria-label={label}
                className="relative flex h-full items-center justify-center"
              >
                <span
                  className="relative grid h-11 w-16 place-items-center rounded-2xl transition-all"
                  style={
                    useGradient
                      ? {
                          background:
                            "linear-gradient(135deg, #7EC8FF 0%, hsl(var(--teal-deep)) 100%)",
                          boxShadow:
                            "0 6px 18px -6px hsl(var(--teal-deep) / 0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
                        }
                      : {
                          background:
                            "linear-gradient(135deg, rgba(126,200,255,0.06) 0%, hsl(var(--teal-deep) / 0.06) 100%)",
                          border: "1px solid hsl(var(--teal-deep) / 0.14)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                        }
                  }
                >
                  <Icon
                    className={
                      useGradient
                        ? "h-[22px] w-[22px] text-white"
                        : "h-[22px] w-[22px] text-foreground/60"
                    }
                    strokeWidth={useGradient ? 2.2 : 1.75}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
    </>
  );
};

export default AppTabBar;
