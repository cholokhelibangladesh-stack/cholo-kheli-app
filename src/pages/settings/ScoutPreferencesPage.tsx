import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsSection, SettingsChoice } from "@/components/settings/SettingsControls";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SPORTS = ["football", "cricket", "basketball", "hockey", "athletics", "swimming"] as const;
type Sport = typeof SPORTS[number] | "any";

type Prefs = { preferred_sport: Sport; preferred_positions: string[] };

const ScoutPreferencesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [posInput, setPosInput] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("scout_profiles")
        .select("preferred_sport, preferred_positions")
        .eq("user_id", user.id)
        .maybeSingle();
      setPrefs({
        preferred_sport: ((data as any)?.preferred_sport as Sport) ?? "any",
        preferred_positions: ((data as any)?.preferred_positions as string[]) ?? [],
      });
    })();
  }, [user]);

  const save = async (patch: Partial<Prefs>) => {
    if (!user || !prefs) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    const { error } = await supabase
      .from("scout_profiles")
      .update({
        preferred_sport: next.preferred_sport === "any" ? null : next.preferred_sport,
        preferred_positions: next.preferred_positions,
      } as any)
      .eq("user_id", user.id);
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  const addPos = () => {
    const t = posInput.trim().toLowerCase();
    if (!t || !prefs || prefs.preferred_positions.includes(t)) return;
    save({ preferred_positions: [...prefs.preferred_positions, t] });
    setPosInput("");
  };
  const removePos = (p: string) =>
    prefs && save({ preferred_positions: prefs.preferred_positions.filter((x) => x !== p) });

  if (!prefs) {
    return (
      <SettingsShell title="Scouting preferences">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="Scouting preferences"
      description="Boost the players that fit what you're looking for"
    >
      <SettingsSection label="Preferred sport">
        <SettingsChoice<Sport>
          value={prefs.preferred_sport}
          onChange={(v) => save({ preferred_sport: v })}
          options={[
            { value: "any", title: "Any sport" },
            ...SPORTS.map((s) => ({ value: s, title: s.charAt(0).toUpperCase() + s.slice(1) })),
          ]}
        />
      </SettingsSection>

      <SettingsSection label="Positions you want to boost">
        <div className="flex items-center gap-2 px-4 py-3">
          <Input
            value={posInput}
            onChange={(e) => setPosInput(e.target.value)}
            placeholder="e.g. goalkeeper"
            className="h-9 flex-1 rounded-xl border-white/12 bg-white/[0.05]"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPos())}
          />
          <Button size="sm" onClick={addPos}>Add</Button>
        </div>
        {prefs.preferred_positions.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {prefs.preferred_positions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => removePos(p)}
                className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-foreground/80 hover:text-foreground"
              >
                {p} ×
              </button>
            ))}
          </div>
        )}
      </SettingsSection>
    </SettingsShell>
  );
};

export default ScoutPreferencesPage;
