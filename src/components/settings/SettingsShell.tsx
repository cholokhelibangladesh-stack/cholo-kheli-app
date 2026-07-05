import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

/**
 * Shared shell for every settings detail page.
 * Renders a translucent header with a back arrow + title, and a
 * padded content area over the app background.
 */
const SettingsShell = ({
  title,
  description,
  children,
  backTo = "/player/settings",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  backTo?: string;
}) => {
  return (
    <div className="min-h-full bg-background pb-24">
      <header
        className="sticky top-0 z-20 flex items-center gap-2 px-3 py-3 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0.7) 100%)",
          borderBottom: "1px solid hsl(var(--border) / 0.4)",
        }}
      >
        <Link
          to={backTo}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:bg-white/5"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="truncate text-xs text-foreground/55">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="px-4 pt-4">{children}</div>
    </div>
  );
};

export default SettingsShell;
