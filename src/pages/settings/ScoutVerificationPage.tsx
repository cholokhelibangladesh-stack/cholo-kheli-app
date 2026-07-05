import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsSection, SettingsDetail } from "@/components/settings/SettingsControls";
import { Loader2, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

type Row = {
  verification_status: string;
  full_name: string;
  organization: string | null;
  created_at: string;
  is_banned: boolean;
};

const badge = (status: string) => {
  if (status === "active") return { icon: ShieldCheck, label: "Verified", color: "text-emerald-400" };
  if (status === "pending") return { icon: ShieldQuestion, label: "Pending review", color: "text-amber-400" };
  return { icon: ShieldAlert, label: status.charAt(0).toUpperCase() + status.slice(1), color: "text-rose-400" };
};

const ScoutVerificationPage = () => {
  const { user } = useAuth();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("scout_profiles")
        .select("verification_status, full_name, organization, created_at, is_banned")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow(data as Row | null);
    })();
  }, [user]);

  if (!row) {
    return (
      <SettingsShell title="Scout verification">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  const b = badge(row.is_banned ? "suspended" : row.verification_status);
  const Icon = b.icon;

  return (
    <SettingsShell title="Scout verification" description="Your credentials and review status">
      <SettingsSection>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className={`grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] ${b.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className={`text-[15px] font-semibold ${b.color}`}>{b.label}</div>
            <div className="text-xs text-foreground/60">
              {row.verification_status === "active"
                ? "You have full access to Cholo Kheli scouting tools."
                : row.verification_status === "pending"
                  ? "Our team is reviewing your credentials."
                  : "Contact support to reactivate your account."}
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection label="Registered details">
        <SettingsDetail label="Full name" value={row.full_name || "—"} />
        <SettingsDetail label="Organisation" value={row.organization || "—"} />
        <SettingsDetail
          label="Applied on"
          value={new Date(row.created_at).toLocaleDateString()}
        />
      </SettingsSection>
    </SettingsShell>
  );
};

export default ScoutVerificationPage;
