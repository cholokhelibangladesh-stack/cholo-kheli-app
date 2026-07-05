import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Switch } from "@/components/ui/switch";
import { Loader2, Lock, Globe as GlobeIcon } from "lucide-react";

type Row = {
  is_private: boolean;
  activity_status: boolean;
  read_receipts: boolean;
  hide_like_counts: boolean;
  hide_share_counts: boolean;
};

const PrivacyPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("privacy_settings")
        .select("is_private, activity_status, read_receipts, hide_like_counts, hide_share_counts")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow(
        data ?? {
          is_private: false,
          activity_status: true,
          read_receipts: true,
          hide_like_counts: false,
          hide_share_counts: false,
        },
      );
      setLoading(false);
    })();
  }, [user]);

  const update = async (patch: Partial<Row>) => {
    if (!user || !row) return;
    const next = { ...row, ...patch };
    setRow(next);
    const { error } = await supabase
      .from("privacy_settings")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
    }
  };

  if (loading || !row) {
    return (
      <SettingsShell title="Account privacy">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Account privacy" description="Choose who can see your profile & videos">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <ToggleRow
          icon={row.is_private ? Lock : GlobeIcon}
          title="Private account"
          desc="When your account is private, only people you approve can watch your videos."
          checked={row.is_private}
          onChange={(v) => update({ is_private: v })}
        />
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03]">
        <ToggleRow
          title="Show activity status"
          desc="Allow others to see when you're active."
          checked={row.activity_status}
          onChange={(v) => update({ activity_status: v })}
        />
        <Divider />
        <ToggleRow
          title="Send read receipts"
          desc="Let people know when you've read their messages."
          checked={row.read_receipts}
          onChange={(v) => update({ read_receipts: v })}
        />
        <Divider />
        <ToggleRow
          title="Hide like counts"
          desc="Only you will see the total number of likes on your videos."
          checked={row.hide_like_counts}
          onChange={(v) => update({ hide_like_counts: v })}
        />
        <Divider />
        <ToggleRow
          title="Hide share counts"
          desc="Only you will see how many times your videos were shared."
          checked={row.hide_share_counts}
          onChange={(v) => update({ hide_share_counts: v })}
        />
      </div>
    </SettingsShell>
  );
};

const Divider = () => <div className="mx-4 border-t border-white/[0.05]" />;

const ToggleRow = ({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start gap-3 px-4 py-3">
    {Icon ? <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground/80" /> : null}
    <div className="min-w-0 flex-1">
      <div className="text-[15px] font-medium">{title}</div>
      {desc ? <div className="mt-0.5 text-xs text-foreground/55">{desc}</div> : null}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default PrivacyPage;
