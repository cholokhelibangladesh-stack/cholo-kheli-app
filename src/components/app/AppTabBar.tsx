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
 * Instagram-style bottom tab bar:
 * - hairline top border, no pill indicator
 * - thin outline icons, filled when active
 * - no labels, larger touch target
 * - center "create" slot slightly emphasized for players
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
      { label: "Search", to: "/player/explore", Icon: Search },
      { label: "Create", to: "/player/upload", Icon: PlusSquare, emphasize: true },
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-12 max-w-[430px] items-stretch justify-around px-1">
        {tabs.map(({ label, to, Icon, emphasize }) => {
          const active =
            to === "/player" || to === "/scout" || to === "/"
              ? pathname === to
              : pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                onClick={() => haptic("light")}
                aria-label={label}
                className="relative flex h-full items-center justify-center"
              >
                <Icon
                  className={`h-[26px] w-[26px] transition-all ${
                    active ? "text-foreground scale-105" : "text-foreground/70"
                  }`}
                  strokeWidth={active ? 2.4 : 1.75}
                  fill={active && !emphasize ? "currentColor" : "none"}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AppTabBar;
