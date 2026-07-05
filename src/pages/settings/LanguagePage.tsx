import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Loader2, Check } from "lucide-react";

const LANGS = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা (Bengali)" },
];

const LanguagePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [current, setCurrent] = useState<string>("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("privacy_settings")
        .select("language")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.language) setCurrent(data.language);
      setLoading(false);
    })();
  }, [user]);

  const pick = async (code: string) => {
    if (!user) return;
    setCurrent(code);
    const { error } = await supabase
      .from("privacy_settings")
      .upsert({ user_id: user.id, language: code }, { onConflict: "user_id" });
    if (error)
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
    else {
      try {
        localStorage.setItem("ck.lang", code);
      } catch {}
      toast({ title: "Language updated" });
    }
  };

  if (loading) {
    return (
      <SettingsShell title="Language and translations">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Language and translations">
      <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/10 bg-white/[0.03]">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => pick(l.code)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03]"
          >
            <span className="flex-1 text-[15px] font-medium">{l.label}</span>
            {current === l.code && (
              <Check className="h-5 w-5 text-[hsl(var(--teal-deep))]" strokeWidth={2.5} />
            )}
          </button>
        ))}
      </div>
    </SettingsShell>
  );
};

export default LanguagePage;
