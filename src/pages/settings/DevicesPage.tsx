import { useEffect, useState } from "react";
import SettingsShell from "@/components/settings/SettingsShell";
import { Camera, Mic, Bell, MapPin } from "lucide-react";

type Status = "granted" | "denied" | "prompt" | "unknown";

const items: { key: PermissionName | "notifications"; label: string; icon: typeof Camera }[] = [
  { key: "camera" as PermissionName, label: "Camera", icon: Camera },
  { key: "microphone" as PermissionName, label: "Microphone", icon: Mic },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "geolocation" as PermissionName, label: "Location", icon: MapPin },
];

const badge = (s: Status) => {
  const map: Record<Status, string> = {
    granted: "bg-emerald-500/15 text-emerald-300",
    denied: "bg-rose-500/15 text-rose-300",
    prompt: "bg-amber-500/15 text-amber-300",
    unknown: "bg-white/10 text-foreground/60",
  };
  const label: Record<Status, string> = { granted: "Allowed", denied: "Blocked", prompt: "Ask", unknown: "Unknown" };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] ${map[s]}`}>{label[s]}</span>;
};

const DevicesPage = () => {
  const [status, setStatus] = useState<Record<string, Status>>({});

  useEffect(() => {
    (async () => {
      const next: Record<string, Status> = {};
      for (const it of items) {
        try {
          if (it.key === "notifications") {
            next[it.key] = typeof Notification !== "undefined"
              ? (Notification.permission === "default" ? "prompt" : (Notification.permission as Status))
              : "unknown";
          } else {
            const r = await navigator.permissions.query({ name: it.key as PermissionName });
            next[it.key as string] = r.state as Status;
          }
        } catch {
          next[it.key as string] = "unknown";
        }
      }
      setStatus(next);
    })();
  }, []);

  return (
    <SettingsShell title="Device permissions" description="Managed by your browser">
      <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5"><it.icon className="h-4 w-4" /></div>
              <div className="text-[15px] font-medium">{it.label}</div>
            </div>
            {badge(status[it.key as string] ?? "unknown")}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-foreground/55">
        To change these, open your browser or system settings for this site.
      </p>
    </SettingsShell>
  );
};

export default DevicesPage;
