import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsSection, SettingsChoice } from "@/components/settings/SettingsControls";
import { Loader2 } from "lucide-react";

type Val = "everyone" | "followers" | "close_friends" | "off";
type Row = { story_visibility: Val };

const StoryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("privacy_settings")
        .select("story_visibility")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow((data as Row | null) ?? { story_visibility: "followers" });
    })();
  }, [user]);

  const save = async (v: Val) => {
    if (!user) return;
    setRow({ story_visibility: v });
    const { error } = await supabase
      .from("privacy_settings")
      .upsert({ user_id: user.id, story_visibility: v }, { onConflict: "user_id" });
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  if (!row) {
    return (
      <SettingsShell title="Live and location">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Live and location" description="Choose who can see your live sessions">
      <SettingsSection label="Live audience">
        <SettingsChoice<Val>
          value={row.story_visibility}
          onChange={save}
          options={[
            { value: "everyone", title: "Everyone", description: "Anyone on Cholo Kheli can watch." },
            { value: "followers", title: "Followers", description: "Only people who follow you." },
            { value: "close_friends", title: "Trusted circle", description: "Only people in your Trusted Circle." },
            { value: "off", title: "Off", description: "Do not broadcast at all." },
          ]}
        />
      </SettingsSection>
    </SettingsShell>
  );
};

export default StoryPage;
