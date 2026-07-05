import { Link } from "@tanstack/react-router";
import { ChevronRight, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

/**
 * Glass settings card row — consistent with the app-wide glass aesthetic.
 * Sits inside a SettingsGroup which frames a translucent card container.
 */
export const SettingsRow = ({
  icon: Icon,
  label,
  to,
  onClick,
  trailing,
  tint = "default",
}: {
  icon: LucideIcon;
  label: string;
  to?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  tint?: "default" | "destructive" | "accent";
}) => {
  const labelClass =
    tint === "destructive"
      ? "text-[hsl(var(--destructive))]"
      : tint === "accent"
      ? "text-[hsl(var(--teal-deep))]"
      : "text-foreground";
  const iconClass =
    tint === "destructive"
      ? "text-[hsl(var(--destructive))]"
      : tint === "accent"
      ? "text-[hsl(var(--teal-deep))]"
      : "text-foreground/85";

  const inner = (
    <div className="flex w-full items-center gap-3 px-4 py-3.5">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 backdrop-blur-md"
        style={{
          background:
            "linear-gradient(135deg, rgba(126,200,255,0.16) 0%, hsl(var(--teal-deep) / 0.10) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 hsl(var(--teal-deep) / 0.18)",
        }}
      >
        <Icon className={`h-[18px] w-[18px] ${iconClass}`} strokeWidth={1.85} />
      </span>
      <span className={`flex-1 truncate text-[15px] font-medium ${labelClass}`}>{label}</span>
      {trailing ? <span className="text-xs text-foreground/55">{trailing}</span> : null}
      {to || onClick ? (
        <ChevronRight className="h-4 w-4 text-foreground/40" />
      ) : null}
    </div>
  );

  const interactive =
    "transition-colors hover:bg-white/[0.06] active:bg-white/[0.09]";

  if (to) {
    return (
      <Link to={to} className={`block ${interactive}`}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`block w-full text-left ${interactive}`}>
      {inner}
    </button>
  );
};

export const SettingsGroup = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => (
  <section className="pt-6">
    {label ? (
      <h2 className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50">
        {label}
      </h2>
    ) : null}
    <div
      className="overflow-hidden rounded-2xl border border-white/12 backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--background) / 0.55) 0%, hsl(var(--background) / 0.35) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.10), 0 10px 28px -22px rgba(20,50,90,0.55)",
      }}
    >
      <div className="divide-y divide-white/[0.07]">{children}</div>
    </div>
  </section>
);
