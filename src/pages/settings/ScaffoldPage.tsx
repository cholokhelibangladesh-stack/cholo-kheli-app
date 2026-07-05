import SettingsShell from "@/components/settings/SettingsShell";
import { Sparkles } from "lucide-react";

/**
 * Scaffold page used by every settings row that will get its full behavior
 * wired in Batch 2 / Batch 3. Not a "coming soon" — it renders the row's
 * title, description, and an empty-state that matches the eventual UI.
 */
const ScaffoldPage = ({
  title,
  description,
  emptyTitle,
  emptyText,
}: {
  title: string;
  description?: string;
  emptyTitle: string;
  emptyText: string;
}) => (
  <SettingsShell title={title} description={description}>
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#7EC8FF]/20 to-[hsl(var(--teal-deep))]/20">
        <Sparkles className="h-6 w-6 text-[hsl(var(--teal-deep))]" />
      </div>
      <div className="mt-3 text-[15px] font-semibold">{emptyTitle}</div>
      <p className="mx-auto mt-1 max-w-[280px] text-xs text-foreground/55">{emptyText}</p>
    </div>
  </SettingsShell>
);

export default ScaffoldPage;
