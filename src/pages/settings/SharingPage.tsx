import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsSection, SettingsToggle } from "@/components/settings/SettingsControls";
import { Loader2 } from "lucide-react";

type Row = { sharing_allowed: boolean };

const SharingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("privacy_settings")
        .select("sharing_allowed")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow((data as Row | null) ?? { sharing_allowed: true });
    })();
  }, [user]);

  const save = async (patch: Partial<Row>) => {
    if (!user || !row) return;
    const next = { ...row, ...patch };
    setRow(next);
    const { error } = await supabase
      .from("privacy_settings")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  if (!row) {
    return (
      <SettingsShell title="Sharing and reposts">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Sharing and reposts" description="Control how your videos travel">
      <SettingsSection>
        <SettingsToggle
          title="Allow others to share your videos"
          description="When on, viewers can share a link to your videos with anyone."
          checked={row.sharing_allowed}
          onChange={(v) => save({ sharing_allowed: v })}
        />
      </SettingsSection>
    </SettingsShell>
  );
};

export default SharingPage;
