import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsCard } from "@/components/settings/SettingsControls";
import { Clock, Sparkles } from "lucide-react";

/**
 * Universal "coming soon" scaffold for settings that don't yet have a
 * backend surface. Shows the feature title, a real description of what it
 * will do, an ETA chip, and any bulleted spec points.
 */
const ScaffoldPage = ({
  title,
  description,
  emptyTitle,
  emptyText,
  eta = "In next release",
  points,
}: {
  title: string;
  description?: string;
  emptyTitle: string;
  emptyText: string;
  eta?: string;
  points?: string[];
}) => (
  <SettingsShell title={title} description={description}>
    <SettingsCard>
      <div className="p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#7EC8FF]/25 to-[hsl(var(--teal-deep))]/25">
          <Sparkles className="h-6 w-6 text-[hsl(var(--teal-deep))]" />
        </div>
        <div className="mt-3 text-[16px] font-semibold">{emptyTitle}</div>
        <p className="mx-auto mt-1.5 max-w-[300px] text-sm leading-snug text-foreground/60">
          {emptyText}
        </p>
        <span className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-foreground/70">
          <Clock className="h-3 w-3" />
          Coming soon · {eta}
        </span>
      </div>
    </SettingsCard>

    {points && points.length > 0 ? (
      <div className="mt-4">
        <SettingsCard>
          <div className="px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50">
              What you'll get
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
              {points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--teal-deep))]" />
                  <span className="leading-snug">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </SettingsCard>
      </div>
    ) : null}
  </SettingsShell>
);

export default ScaffoldPage;
