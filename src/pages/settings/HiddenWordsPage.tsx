import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X, Type } from "lucide-react";

type Word = { id: string; word: string };

const HiddenWordsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    const [prefs, list] = await Promise.all([
      supabase
        .from("privacy_settings")
        .select("hidden_words_enabled")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("hidden_words")
        .select("id, word")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setEnabled(prefs.data?.hidden_words_enabled ?? false);
    setWords((list.data ?? []) as Word[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (v: boolean) => {
    if (!user) return;
    setEnabled(v);
    const { error } = await supabase
      .from("privacy_settings")
      .upsert({ user_id: user.id, hidden_words_enabled: v }, { onConflict: "user_id" });
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  const add = async () => {
    if (!user) return;
    const raw = input.trim().toLowerCase();
    if (!raw) return;
    if (raw.length > 60) {
      toast({ title: "Word is too long", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("hidden_words")
      .insert({ user_id: user.id, word: raw });
    if (error) {
      const msg = error.code === "23505" ? "Already in your list" : error.message;
      toast({ title: "Failed", description: msg, variant: "destructive" });
      return;
    }
    setInput("");
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("hidden_words").delete().eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setWords((w) => w.filter((x) => x.id !== id));
  };

  if (loading) {
    return (
      <SettingsShell title="Hidden Words">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="Hidden Words"
      description="Hide comments & messages that contain certain words"
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-start gap-3 px-4 py-3">
          <Type className="mt-0.5 h-5 w-5 shrink-0 text-foreground/80" />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium">Hide with custom words</div>
            <div className="mt-0.5 text-xs text-foreground/55">
              Comments and messages containing any word below will be hidden from you.
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={toggle} />
        </div>
      </div>

      <div className="mt-5">
        <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
          Your custom words ({words.length})
        </h2>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="Add a word or phrase"
            className="rounded-2xl border-white/10 bg-white/[0.04]"
            maxLength={60}
          />
          <Button onClick={add} disabled={!input.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {words.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-foreground/55">
            No hidden words yet.
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {words.map((w) => (
              <span
                key={w.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm"
              >
                {w.word}
                <button
                  type="button"
                  onClick={() => remove(w.id)}
                  className="grid h-4 w-4 place-items-center rounded-full text-foreground/60 hover:bg-white/10 hover:text-foreground"
                  aria-label={`Remove ${w.word}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </SettingsShell>
  );
};

export default HiddenWordsPage;
