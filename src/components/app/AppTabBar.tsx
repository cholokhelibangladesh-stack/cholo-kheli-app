import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Upload, Compass, User, ClipboardList, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/native";

type Tab = {
  label: string;
  to: string;
  Icon: typeof Home;
};

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
      { label: "Explore", to: "/player/explore", Icon: Compass },
      { label: "Upload", to: "/player/upload", Icon: Upload },
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 backdrop-blur-xl"
      style={{
        background: "hsl(var(--background) / 0.92)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="mx-auto flex max-w-[430px] items-stretch justify-around px-1 h-16">
        {tabs.map(({ label, to, Icon }) => {
          const active =
            to === "/player" || to === "/scout" || to === "/"
              ? pathname === to
              : pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                onClick={() => haptic("light")}
                className={`relative flex h-full flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute top-1 h-1 w-8 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
                <Icon
                  className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`}
                  strokeWidth={active ? 2.4 : 1.8}
                />
                <span className={`text-[10px] font-semibold tracking-wide ${active ? "" : "opacity-80"}`}>
                  {label}
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
