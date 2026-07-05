import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";

const limits = [null, 15, 30, 60, 120];
const breaks = [null, 15, 30, 60];

const TimePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<{ daily_limit_minutes: number | null; break_reminder_minutes: number | null } | null>(null);
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const [pref, events] = await Promise.all([
        supabase.from("privacy_settings").select("daily_limit_minutes,break_reminder_minutes").eq("user_id", user.id).maybeSingle(),
        supabase.from("video_events").select("watch_ms").eq("viewer_id", user.id).gte("created_at", start.toISOString()),
      ]);
      setRow(pref.data ?? { daily_limit_minutes: null, break_reminder_minutes: null });
      const totalMs = (events.data ?? []).reduce((s, e) => s + (e.watch_ms ?? 0), 0);
      setTodayMinutes(Math.round(totalMs / 60000));
    })();
  }, [user]);

  const save = async (patch: Partial<NonNullable<typeof row>>) => {
    if (!user || !row) return;
    const next = { ...row, ...patch };
    setRow(next);
    const { error } = await supabase.from("privacy_settings").upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  if (!row) {
    return <SettingsShell title="Time management"><div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div></SettingsShell>;
  }

  const Group = ({ label, current, options, onPick, unitZero }: { label: string; current: number | null; options: (number | null)[]; onPick: (v: number | null) => void; unitZero: string }) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 text-[15px] font-medium">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((v) => (
          <Button key={String(v)} variant={current === v ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => onPick(v)}>
            {v === null ? unitZero : `${v} min`}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <SettingsShell title="Time management" description="Watch your habits and set healthy limits">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#7EC8FF]/10 to-[hsl(var(--teal-deep))]/10 p-5 text-center">
        <Clock className="mx-auto h-6 w-6 text-[hsl(var(--teal-deep))]" />
        <div className="mt-2 text-3xl font-semibold tabular-nums">{todayMinutes}<span className="ml-1 text-base font-normal text-foreground/60">min</span></div>
        <div className="text-xs text-foreground/55">Time on Cholo Kheli today</div>
      </div>
      <div className="mt-4 space-y-3">
        <Group label="Daily time limit" current={row.daily_limit_minutes} options={limits} onPick={(v) => save({ daily_limit_minutes: v })} unitZero="No limit" />
        <Group label="Take a break reminder" current={row.break_reminder_minutes} options={breaks} onPick={(v) => save({ break_reminder_minutes: v })} unitZero="Off" />
      </div>
    </SettingsShell>
  );
};

export default TimePage;
