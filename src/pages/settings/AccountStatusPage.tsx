import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SettingsShell from "@/components/settings/SettingsShell";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

const AccountStatusPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("moderation_alerts")
        .select("*")
        .eq("target_user_id", user.id)
        .order("created_at", { ascending: false });
      setAlerts(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <SettingsShell
      title="Account Status"
      description="Your account's standing with Cholo Kheli"
    >
      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-[hsl(var(--teal-deep))]" />
          <div className="mt-3 text-[15px] font-semibold">Your account is in good standing</div>
          <p className="mt-1 text-xs text-foreground/55">
            No violations or restrictions have been recorded.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/10 bg-white/[0.03]">
          {alerts.map((a) => (
            <div key={a.id} className="flex gap-3 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium capitalize">{a.kind} flagged</div>
                <div className="text-xs text-foreground/55">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsShell>
  );
};

export default AccountStatusPage;
