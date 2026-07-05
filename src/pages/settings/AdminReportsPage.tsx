import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsCard } from "@/components/settings/SettingsControls";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

type Req = {
  id: string;
  status: string;
  notes: string;
  admin_response: string | null;
  created_at: string;
  scout_id: string;
  player_id: string;
};

const AdminReportsPage = () => {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("scout_requests")
        .select("id, status, notes, admin_response, created_at, scout_id, player_id")
        .order("created_at", { ascending: false })
        .limit(50);
      setRows((data ?? []) as Req[]);
      setLoading(false);
    })();
  }, []);

  return (
    <SettingsShell title="Reports and appeals" description={`${rows.length} recent scout requests`}>
      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <SettingsCard>
          <div className="p-8 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-emerald-400" />
            <div className="mt-2 text-sm font-medium">Queue is clear</div>
          </div>
        </SettingsCard>
      ) : (
        <SettingsCard>
          {rows.map((r) => {
            const isApproved = r.status === "approved";
            const isRejected = r.status === "rejected";
            return (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      isApproved
                        ? "border-emerald-400/40 text-emerald-300"
                        : isRejected
                          ? "border-rose-400/40 text-rose-300"
                          : "border-amber-400/40 text-amber-300"
                    }`}
                  >
                    {isApproved ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : isRejected ? (
                      <ShieldAlert className="h-3 w-3" />
                    ) : null}
                    {r.status}
                  </span>
                  <span className="ml-auto text-[10px] text-foreground/55">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.notes ? (
                  <div className="mt-2 text-xs leading-snug text-foreground/85">{r.notes}</div>
                ) : null}
                {r.admin_response ? (
                  <div className="mt-1 rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-foreground/70">
                    <span className="font-semibold text-foreground/85">Admin: </span>
                    {r.admin_response}
                  </div>
                ) : null}
              </div>
            );
          })}
        </SettingsCard>
      )}
    </SettingsShell>
  );
};

export default AdminReportsPage;
