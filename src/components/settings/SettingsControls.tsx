import { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { Check, LucideIcon } from "lucide-react";

/**
 * Glass card container that matches the settings-hub aesthetic.
 * Use for grouping controls on any detail page.
 */
export const SettingsCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`overflow-hidden rounded-2xl border border-white/12 backdrop-blur-xl ${className}`}
    style={{
      background:
        "linear-gradient(180deg, hsl(var(--background) / 0.55) 0%, hsl(var(--background) / 0.35) 100%)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.10), 0 10px 28px -22px rgba(20,50,90,0.55)",
    }}
  >
    <div className="divide-y divide-white/[0.07]">{children}</div>
  </div>
);

export const SettingsSection = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => (
  <section className="pt-6 first:pt-0">
    {label ? (
      <h2 className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50">
        {label}
      </h2>
    ) : null}
    <SettingsCard>{children}</SettingsCard>
  </section>
);

/** Row with a title, optional description, and a Switch. */
export const SettingsToggle = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-start gap-3 px-4 py-3.5">
    {Icon ? <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground/85" strokeWidth={1.85} /> : null}
    <div className="min-w-0 flex-1">
      <div className="text-[15px] font-medium leading-tight">{title}</div>
      {description ? (
        <div className="mt-1 text-xs text-foreground/60 leading-snug">{description}</div>
      ) : null}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
  </div>
);

/** Radio-style single choice within a glass card. */
export function SettingsChoice<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; title: string; description?: string }>;
}) {
  return (
    <>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.06] active:bg-white/[0.09]"
          >
            <span
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                active
                  ? "border-[hsl(var(--teal-deep))] bg-[hsl(var(--teal-deep))]"
                  : "border-foreground/25"
              }`}
            >
              {active ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium leading-tight">{o.title}</span>
              {o.description ? (
                <span className="mt-1 block text-xs text-foreground/60 leading-snug">
                  {o.description}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </>
  );
}

/** Simple key: value read-only row for details pages. */
export const SettingsDetail = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 px-4 py-3.5">
    <span className="text-sm text-foreground/70">{label}</span>
    <span
      className={`min-w-0 truncate text-right text-sm ${mono ? "font-mono" : "font-medium"} text-foreground/95`}
    >
      {value}
    </span>
  </div>
);
