import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import SettingsShell from "@/components/settings/SettingsShell";
import { Switch } from "@/components/ui/switch";
import { Loader2, Moon } from "lucide-react";

const AccessibilityPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [row, setRow] = useState<{ reduce_motion: boolean; captions_default: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("privacy_settings").select("reduce_motion,captions_default").eq("user_id", user.id).maybeSingle();
      setRow(data ?? { reduce_motion: false, captions_default: false });
    })();
  }, [user]);

  const save = async (patch: Partial<NonNullable<typeof row>>) => {
    if (!user || !row) return;
    const next = { ...row, ...patch };
    setRow(next);
    const { error } = await supabase.from("privacy_settings").upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  if (!row) return <SettingsShell title="Accessibility"><div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div></SettingsShell>;

  const rows: { key: keyof typeof row; label: string; desc: string }[] = [
    { key: "reduce_motion", label: "Reduce motion", desc: "Minimise animations and auto-advancing content." },
    { key: "captions_default", label: "Captions on by default", desc: "Show captions on videos when available." },
  ];

  return (
    <SettingsShell title="Accessibility" description="Make Cholo Kheli easier to use">
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

export default AccessibilityPage;
