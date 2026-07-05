import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, PlusSquare, User, ClipboardList, Shield, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/native";

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
      { label: "Explore", to: "/scout/explore", Icon: Compass },
      { label: "Picks", to: "/scout/selections", Icon: ClipboardList },
      { label: "Profile", to: "/scout/profile", Icon: User },
    ];
  } else if (role === "admin") {
    tabs = [
      { label: "Home", to: "/", Icon: Home },
      { label: "Admin", to: "/admin", Icon: Shield },
    ];
  } else {
    return null;
  }

  return (
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
          const active =
            to === "/player" || to === "/scout" || to === "/"
              ? pathname === to
              : pathname === to || pathname.startsWith(to + "/");
          const useGradient = active;
          const isEmphasized = emphasize && !active;
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
                            "linear-gradient(135deg, rgba(126,200,255,0.10) 0%, hsl(var(--teal-deep) / 0.10) 100%)",
                          border: "1px solid hsl(var(--teal-deep) / 0.18)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                        }
                  }
                >
                  <Icon
                    className={
                      useGradient
                        ? "h-[22px] w-[22px] text-white"
                        : "h-[22px] w-[22px] text-foreground/70"
                    }
                    strokeWidth={useGradient ? 2.2 : 1.9}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AppTabBar;
