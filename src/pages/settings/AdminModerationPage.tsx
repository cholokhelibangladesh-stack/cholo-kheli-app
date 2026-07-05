import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsCard } from "@/components/settings/SettingsControls";
import { Loader2, AlertTriangle, Flag, ShieldCheck, Video } from "lucide-react";

type Alert = {
  id: string;
  kind: "scout_request" | "video" | "scout";
  target_id: string;
  status: "new" | "resolved";
  created_at: string;
};

const kindMeta: Record<Alert["kind"], { label: string; Icon: any }> = {
  scout_request: { label: "Scout request", Icon: ShieldCheck },
  video: { label: "Video", Icon: Video },
  scout: { label: "Scout profile", Icon: Flag },
};

const AdminModerationPage = () => {
  const [rows, setRows] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"new" | "resolved">("new");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("moderation_alerts")
        .select("id, kind, target_id, status, created_at")
        .eq("status", tab)
        .order("created_at", { ascending: false })
        .limit(50);
      setRows((data ?? []) as Alert[]);
      setLoading(false);
    })();
  }, [tab]);

  return (
    <SettingsShell title="Moderation queue" description="Flagged content awaiting review">
      <div className="mb-3 inline-flex rounded-2xl border border-white/12 bg-white/[0.05] p-1">
        {(["new", "resolved"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              tab === t ? "bg-[hsl(var(--teal-deep))] text-white" : "text-foreground/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <SettingsCard>
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-foreground/50" />
            <div className="mt-2 text-sm font-medium">Nothing in the {tab} queue</div>
            <div className="mt-0.5 text-xs text-foreground/60">
              {tab === "new" ? "All caught up." : "No resolved alerts yet."}
            </div>
          </div>
        </SettingsCard>
      ) : (
        <SettingsCard>
          {rows.map((r) => {
            const m = kindMeta[r.kind];
            const Icon = m.Icon;
            return (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-400/15 text-amber-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="truncate font-mono text-[10px] text-foreground/50">
                    {r.target_id}
                  </div>
                </div>
                <div className="text-[10px] text-foreground/55">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </SettingsCard>
      )}
    </SettingsShell>
  );
};

export default AdminModerationPage;
