import { Link } from "@tanstack/react-router";
import { ChevronRight, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

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
  const inner = (
    <div className="flex w-full items-center gap-3 px-1 py-3">
      <Icon
        className={
          tint === "destructive"
            ? "h-5 w-5 shrink-0 text-[hsl(var(--destructive))]"
            : tint === "accent"
            ? "h-5 w-5 shrink-0 text-[hsl(var(--teal-deep))]"
            : "h-5 w-5 shrink-0 text-foreground/85"
        }
        strokeWidth={1.75}
      />
      <span className={`flex-1 truncate text-[15px] font-medium ${labelClass}`}>{label}</span>
      {trailing ? (
        <span className="text-xs text-foreground/55">{trailing}</span>
      ) : null}
      {to || onClick ? (
        <ChevronRight className="h-4 w-4 text-foreground/40" />
      ) : null}
    </div>
  );
  if (to) {
    return (
      <Link to={to} className="block hover:bg-white/[0.02]">
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-left hover:bg-white/[0.02]">
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
  <section className="pt-5">
    {label ? (
      <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
        {label}
      </h2>
    ) : null}
    <div className="divide-y divide-white/[0.05]">{children}</div>
  </section>
);
