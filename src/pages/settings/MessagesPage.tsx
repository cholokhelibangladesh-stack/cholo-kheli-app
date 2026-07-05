import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsSection, SettingsToggle } from "@/components/settings/SettingsControls";
import { Loader2 } from "lucide-react";

type Row = { messages: boolean; scout_requests: boolean };

const MessagesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("messages, scout_requests")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow((data as Row | null) ?? { messages: true, scout_requests: true });
    })();
  }, [user]);

  const save = async (patch: Partial<Row>) => {
    if (!user || !row) return;
    const next = { ...row, ...patch };
    setRow(next);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  if (!row) {
    return (
      <SettingsShell title="Direct messages">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="Direct messages"
      description="How scouts and other players can reach you"
    >
      <SettingsSection label="Incoming messages">
        <SettingsToggle
          title="Allow direct messages"
          description="Players and verified scouts can start a conversation with you."
          checked={row.messages}
          onChange={(v) => save({ messages: v })}
        />
        <SettingsToggle
          title="Allow scout requests"
          description="Verified scouts can send a shortlist or trial request."
          checked={row.scout_requests}
          onChange={(v) => save({ scout_requests: v })}
        />
      </SettingsSection>
    </SettingsShell>
  );
};

export default MessagesPage;
