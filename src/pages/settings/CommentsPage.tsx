import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsSection, SettingsChoice, SettingsToggle } from "@/components/settings/SettingsControls";
import { Loader2 } from "lucide-react";

type ChoiceValue = "everyone" | "followers" | "off";

type Row = {
  comment_control: ChoiceValue;
  hidden_words_enabled: boolean;
};

const CommentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("privacy_settings")
        .select("comment_control, hidden_words_enabled")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow(
        (data as Row | null) ?? {
          comment_control: "everyone",
          hidden_words_enabled: false,
        },
      );
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
      <SettingsShell title="Comments">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Comments" description="Control who can comment on your videos">
      <SettingsSection label="Allow comments from">
        <SettingsChoice<ChoiceValue>
          value={row.comment_control}
          onChange={(v) => save({ comment_control: v })}
          options={[
            { value: "everyone", title: "Everyone", description: "Any Cholo Kheli account can comment." },
            { value: "followers", title: "Followers only", description: "Only people who follow you." },
            { value: "off", title: "Turn off comments", description: "Nobody can comment on new videos." },
          ]}
        />
      </SettingsSection>

      <SettingsSection label="Filters">
        <SettingsToggle
          title="Filter muted words"
          description="Comments that contain any of your muted words will be hidden automatically."
          checked={row.hidden_words_enabled}
          onChange={(v) => save({ hidden_words_enabled: v })}
        />
      </SettingsSection>
    </SettingsShell>
  );
};

export default CommentsPage;
