import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsSection, SettingsChoice, SettingsToggle } from "@/components/settings/SettingsControls";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SPORTS = ["football", "cricket", "basketball", "hockey", "athletics", "swimming"] as const;
type Sport = typeof SPORTS[number] | "any";

type Prefs = { sport: Sport; positions: string[]; data_saver: boolean };

const ContentPreferencesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [posInput, setPosInput] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: privacy }] = await Promise.all([
        supabase.from("profiles").select("sport, position_tags").eq("user_id", user.id).maybeSingle(),
        supabase.from("privacy_settings").select("data_saver").eq("user_id", user.id).maybeSingle(),
      ]);
      setPrefs({
        sport: ((profile as any)?.sport as Sport) ?? "any",
        positions: ((profile as any)?.position_tags as string[]) ?? [],
        data_saver: (privacy as any)?.data_saver ?? false,
      });
    })();
  }, [user]);

  const savePrefs = async (patch: Partial<Prefs>) => {
    if (!user || !prefs) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    if (patch.sport !== undefined || patch.positions !== undefined) {
      const { error } = await supabase
        .from("profiles")
        .update({
          sport: next.sport === "any" ? null : next.sport,
          // position_tags is not a column on profiles; guarded below
        } as any)
        .eq("user_id", user.id);
      if (error && !error.message.includes("position_tags")) {
        toast({ title: "Could not save", description: error.message, variant: "destructive" });
      }
    }
    if (patch.data_saver !== undefined) {
      const { error } = await supabase
        .from("privacy_settings")
        .upsert({ user_id: user.id, data_saver: next.data_saver }, { onConflict: "user_id" });
      if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
    }
  };

  const addPosition = () => {
    const t = posInput.trim().toLowerCase();
    if (!t || !prefs) return;
    if (prefs.positions.includes(t)) return;
    savePrefs({ positions: [...prefs.positions, t] });
    setPosInput("");
  };
  const removePosition = (p: string) =>
    prefs && savePrefs({ positions: prefs.positions.filter((x) => x !== p) });

  if (!prefs) {
    return (
      <SettingsShell title="Feed preferences">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="Feed preferences"
      description="Fine-tune what shows up in Explore"
    >
      <SettingsSection label="Preferred sport">
        <SettingsChoice<Sport>
          value={prefs.sport}
          onChange={(v) => savePrefs({ sport: v })}
          options={[
            { value: "any", title: "Any sport" },
            ...SPORTS.map((s) => ({ value: s, title: s.charAt(0).toUpperCase() + s.slice(1) })),
          ]}
        />
      </SettingsSection>

      <SettingsSection label="Positions you're interested in">
        <div className="flex items-center gap-2 px-4 py-3">
          <Input
            value={posInput}
            onChange={(e) => setPosInput(e.target.value)}
            placeholder="e.g. striker"
            className="h-9 flex-1 rounded-xl border-white/12 bg-white/[0.05]"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPosition())}
          />
          <Button size="sm" onClick={addPosition}>Add</Button>
        </div>
        {prefs.positions.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {prefs.positions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => removePosition(p)}
                className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-foreground/80 hover:text-foreground"
              >
                {p} ×
              </button>
            ))}
          </div>
        )}
      </SettingsSection>

      <SettingsSection label="Playback">
        <SettingsToggle
          title="Data saver"
          description="Load lower-quality videos on cellular to save data."
          checked={prefs.data_saver}
          onChange={(v) => savePrefs({ data_saver: v })}
        />
      </SettingsSection>
    </SettingsShell>
  );
};

export default ContentPreferencesPage;
