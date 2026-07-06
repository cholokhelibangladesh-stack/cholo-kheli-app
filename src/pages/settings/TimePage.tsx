import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsCard } from "@/components/settings/SettingsControls";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";

const limits = [null, 15, 30, 60, 120];
const breaks = [null, 15, 30, 60];

type Range = "today" | "week";

const TimePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<{ daily_limit_minutes: number | null; break_reminder_minutes: number | null } | null>(null);
  const [range, setRange] = useState<Range>("today");
  const [events, setEvents] = useState<Array<{ watch_ms: number | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const since = new Date();
      if (range === "today") since.setHours(0, 0, 0, 0);
      else since.setDate(since.getDate() - 6), since.setHours(0, 0, 0, 0);
      const [pref, ev] = await Promise.all([
        supabase.from("privacy_settings")
          .select("daily_limit_minutes,break_reminder_minutes")
          .eq("user_id", user.id).maybeSingle(),
        supabase.from("video_events")
          .select("watch_ms,created_at")
          .eq("viewer_id", user.id)
          .gte("created_at", since.toISOString()),
      ]);
      setRow(pref.data ?? { daily_limit_minutes: null, break_reminder_minutes: null });
      setEvents(ev.data ?? []);
      setLoading(false);
    })();
  }, [user, range]);

  const chart = useMemo(() => {
    if (range === "today") {
      const buckets = Array.from({ length: 24 }, (_, h) => ({
        label: h.toString().padStart(2, "0"),
        minutes: 0,
      }));
      for (const e of events) {
        const h = new Date(e.created_at).getHours();
        buckets[h].minutes += (e.watch_ms ?? 0) / 60000;
      }
      return buckets.map((b) => ({ ...b, minutes: Math.round(b.minutes * 10) / 10 }));
    }
    const days: { label: string; minutes: number; key: string }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, label: d.toLocaleDateString(undefined, { weekday: "short" }), minutes: 0 });
    }
    for (const e of events) {
      const key = new Date(e.created_at).toISOString().slice(0, 10);
      const b = days.find((d) => d.key === key);
      if (b) b.minutes += (e.watch_ms ?? 0) / 60000;
    }
    return days.map((d) => ({ label: d.label, minutes: Math.round(d.minutes) }));
  }, [events, range]);

  const totalMinutes = useMemo(
    () => Math.round(events.reduce((s, e) => s + (e.watch_ms ?? 0), 0) / 60000),
    [events],
  );

  const save = async (patch: Partial<NonNullable<typeof row>>) => {
    if (!user || !row) return;
    const next = { ...row, ...patch };
    setRow(next);
    const { error } = await supabase.from("privacy_settings")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  if (!row) {
    return (
      <SettingsShell title="Screen time">
        <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div>
      </SettingsShell>
    );
  }

  const Group = ({ label, current, options, onPick, unitZero }: {
    label: string; current: number | null; options: (number | null)[]; onPick: (v: number | null) => void; unitZero: string;
  }) => (
    <SettingsCard>
      <div className="px-4 py-4">
        <div className="mb-3 text-[15px] font-medium">{label}</div>
        <div className="flex flex-wrap gap-2">
          {options.map((v) => (
            <Button key={String(v)} variant={current === v ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => onPick(v)}>
              {v === null ? unitZero : `${v} min`}
            </Button>
          ))}
        </div>
      </div>
    </SettingsCard>
  );

  return (
    <SettingsShell title="Screen time" description="Watch your habits and set healthy limits">
      <div
        className="rounded-2xl border border-white/12 p-5 text-center backdrop-blur-xl"
        style={{
          background: "linear-gradient(180deg, hsl(var(--background)/0.55), hsl(var(--background)/0.35))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 10px 28px -22px rgba(20,50,90,0.55)",
        }}
      >
        <Clock className="mx-auto h-6 w-6 text-[hsl(var(--teal-deep))]" />
        <div className="mt-2 text-3xl font-semibold tabular-nums">
          {totalMinutes}<span className="ml-1 text-base font-normal text-foreground/60">min</span>
        </div>
        <div className="text-xs text-foreground/55">
          {range === "today" ? "Time on Cholo Kheli today" : "Time on Cholo Kheli this week"}
        </div>

        <div className="mx-auto mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.05] p-0.5 text-xs">
          {(["today", "week"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 transition ${range === r ? "bg-white/[0.12] text-foreground" : "text-foreground/60"}`}
            >
              {r === "today" ? "Today" : "This week"}
            </button>
          ))}
        </div>

        <div className="mt-4 h-44 w-full">
          {loading ? (
            <div className="grid h-full place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.45)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={range === "today" ? 2 : 0}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.45)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} min`, "Watch time"]}
                  labelFormatter={(l) => (range === "today" ? `${l}:00` : l)}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {chart.map((_, i) => (
                    <Cell key={i} fill="hsl(var(--teal-deep))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Group label="Daily time limit" current={row.daily_limit_minutes} options={limits} onPick={(v) => save({ daily_limit_minutes: v })} unitZero="No limit" />
        <Group label="Take a break reminder" current={row.break_reminder_minutes} options={breaks} onPick={(v) => save({ break_reminder_minutes: v })} unitZero="Off" />
      </div>
    </SettingsShell>
  );
};

export default TimePage;
