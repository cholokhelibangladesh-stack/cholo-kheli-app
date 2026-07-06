import { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

/**
 * Shared shell for every settings detail page.
 * Glass header with a back arrow (uses router history so it always returns
 * to wherever the user came from — hub, notification, deep link).
 */
const SettingsShell = ({
  title,
  description,
  children,
  right,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  right?: ReactNode;
}) => {
  const router = useRouter();
  return (
    <div className="min-h-full bg-background pb-24">
      <header
        className="sticky top-0 z-20 flex items-center gap-2 px-3 py-3 backdrop-blur-2xl"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)",
          background:
            "linear-gradient(180deg, hsl(var(--background) / 0.9) 0%, hsl(var(--background) / 0.6) 100%)",
          boxShadow: "inset 0 -1px 0 hsl(var(--teal-deep) / 0.18)",
        }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground/85 hover:bg-white/[0.06]"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="truncate text-xs text-foreground/55">{description}</p>
          ) : null}
        </div>
        {right}
      </header>
      <div className="mx-auto w-full max-w-[430px] px-4 pt-4 sm:max-w-2xl sm:px-6 lg:max-w-3xl">{children}</div>
    </div>
  );
};

export default SettingsShell;
