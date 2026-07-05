import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsSection, SettingsChoice } from "@/components/settings/SettingsControls";
import { Loader2 } from "lucide-react";

type Val = "everyone" | "followers" | "off";

type Row = { allow_tags: Val; allow_mentions: Val };

const TagsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("privacy_settings")
        .select("allow_tags, allow_mentions")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow((data as Row | null) ?? { allow_tags: "everyone", allow_mentions: "everyone" });
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
      <SettingsShell title="Tags and mentions">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  const opts = [
    { value: "everyone" as Val, title: "Everyone" },
    { value: "followers" as Val, title: "People you follow" },
    { value: "off" as Val, title: "Nobody" },
  ];

  return (
    <SettingsShell title="Tags and mentions" description="Decide who can tag or mention you">
      <SettingsSection label="Who can tag you">
        <SettingsChoice<Val>
          value={row.allow_tags}
          onChange={(v) => save({ allow_tags: v })}
          options={opts}
        />
      </SettingsSection>
      <SettingsSection label="Who can @mention you">
        <SettingsChoice<Val>
          value={row.allow_mentions}
          onChange={(v) => save({ allow_mentions: v })}
          options={opts}
        />
      </SettingsSection>
    </SettingsShell>
  );
};

export default TagsPage;
