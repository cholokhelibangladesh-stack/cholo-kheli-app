import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const CountsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<{ hide_like_counts: boolean; hide_share_counts: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("privacy_settings")
        .select("hide_like_counts,hide_share_counts")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow(data ?? { hide_like_counts: false, hide_share_counts: false });
    })();
  }, [user]);

  const save = async (patch: Partial<NonNullable<typeof row>>) => {
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
      <SettingsShell title="Like and share counts">
        <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
      </SettingsShell>
    );
  }

  const rows: { key: keyof typeof row; label: string; desc: string }[] = [
    { key: "hide_like_counts", label: "Hide like counts", desc: "Only you will see how many people like your videos." },
    { key: "hide_share_counts", label: "Hide share counts", desc: "Only you will see how many times your videos were shared." },
  ];

  return (
    <SettingsShell title="Like and share counts" description="Control who sees engagement numbers">
      <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
        {rows.map((r) => (
          <div key={r.key} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="text-[15px] font-medium">{r.label}</div>
              <p className="mt-1 text-xs text-foreground/55">{r.desc}</p>
            </div>
            <Switch checked={row[r.key]} onCheckedChange={(v) => save({ [r.key]: v } as Partial<typeof row>)} />
          </div>
        ))}
      </div>
    </SettingsShell>
  );
};

export default CountsPage;
