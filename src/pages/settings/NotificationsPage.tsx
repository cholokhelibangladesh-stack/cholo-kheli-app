import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Row = {
  pause_all_until: string | null;
  likes: boolean;
  comments: boolean;
  new_followers: boolean;
  messages: boolean;
  scout_requests: boolean;
  video_activity: boolean;
  from_cholo_kheli: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
};

const durations: { label: string; minutes: number }[] = [
  { label: "15 min", minutes: 15 },
  { label: "1 hour", minutes: 60 },
  { label: "8 hours", minutes: 480 },
  { label: "24 hours", minutes: 1440 },
];

const NotificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow(
        (data as Row) ?? {
          pause_all_until: null,
          likes: true,
          comments: true,
          new_followers: true,
          messages: true,
          scout_requests: true,
          video_activity: true,
          from_cholo_kheli: true,
          email_notifications: true,
          push_notifications: true,
        },
      );
      setLoading(false);
    })();
  }, [user]);

  const save = async (patch: Partial<Row>) => {
    if (!user || !row) return;
    const next = { ...row, ...patch };
    setRow(next);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error)
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  const pauseFor = (minutes: number | null) => {
    const until = minutes ? new Date(Date.now() + minutes * 60_000).toISOString() : null;
    save({ pause_all_until: until });
  };

  if (loading || !row) {
    return (
      <SettingsShell title="Notifications">
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  const paused =
    row.pause_all_until && new Date(row.pause_all_until).getTime() > Date.now();

  return (
    <SettingsShell title="Notifications" description="Choose what you want to hear about">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[15px] font-semibold">Pause all</div>
        <p className="mt-1 text-xs text-foreground/55">
          {paused
            ? `Paused until ${new Date(row.pause_all_until!).toLocaleString()}`
            : "Temporarily stop notifications"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {durations.map((d) => (
            <Button
              key={d.minutes}
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => pauseFor(d.minutes)}
            >
              {d.label}
            </Button>
          ))}
          {paused && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              onClick={() => pauseFor(null)}
            >
              Resume
            </Button>
          )}
        </div>
      </div>

      <Section title="Push notifications">
        <T title="Likes" checked={row.likes} onChange={(v) => save({ likes: v })} />
        <T title="Comments" checked={row.comments} onChange={(v) => save({ comments: v })} />
        <T title="New followers" checked={row.new_followers} onChange={(v) => save({ new_followers: v })} />
        <T title="Direct messages" checked={row.messages} onChange={(v) => save({ messages: v })} />
        <T
          title="Scout requests"
          checked={row.scout_requests}
          onChange={(v) => save({ scout_requests: v })}
        />
        <T
          title="Activity about your videos"
          checked={row.video_activity}
          onChange={(v) => save({ video_activity: v })}
        />
        <T
          title="From Cholo Kheli"
          desc="Product updates, tips and announcements"
          checked={row.from_cholo_kheli}
          onChange={(v) => save({ from_cholo_kheli: v })}
        />
      </Section>

      <Section title="Delivery">
        <T
          title="Push notifications"
          checked={row.push_notifications}
          onChange={(v) => save({ push_notifications: v })}
        />
        <T
          title="Email notifications"
          checked={row.email_notifications}
          onChange={(v) => save({ email_notifications: v })}
        />
      </Section>
    </SettingsShell>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-5">
    <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
      {title}
    </h2>
    <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/10 bg-white/[0.03]">
      {children}
    </div>
  </div>
);

const T = ({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start gap-3 px-4 py-3">
    <div className="min-w-0 flex-1">
      <div className="text-[15px] font-medium">{title}</div>
      {desc ? <div className="mt-0.5 text-xs text-foreground/55">{desc}</div> : null}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default NotificationsPage;
