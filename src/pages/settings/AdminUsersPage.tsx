import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsCard } from "@/components/settings/SettingsControls";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ShieldCheck, User } from "lucide-react";

type Row = {
  user_id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  sport: string | null;
  is_banned: boolean;
  role?: string;
};

const AdminUsersPage = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, full_name, username, avatar_url, sport, is_banned")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const roleMap = new Map<string, string>();
      (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));
      setRows(
        ((profiles ?? []) as Row[]).map((p) => ({ ...p, role: roleMap.get(p.user_id) ?? "player" })),
      );
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(
    (r) =>
      !q.trim() ||
      (r.full_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (r.username ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <SettingsShell title="User management" description={`${rows.length} accounts on the platform`}>
      <div className="relative pb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or username"
          className="rounded-2xl border-white/12 bg-white/[0.05] pl-9"
        />
      </div>
      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <SettingsCard>
          {filtered.map((r) => (
            <div key={r.user_id} className="flex items-center gap-3 px-4 py-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-foreground/80">
                {r.avatar_url ? (
                  <img src={r.avatar_url} alt={r.full_name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.full_name || "Unnamed"}</div>
                <div className="truncate text-xs text-foreground/60">
                  @{r.username ?? "—"} · {r.sport ?? "no sport"}
                </div>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  r.role === "admin"
                    ? "border-amber-400/40 text-amber-300"
                    : r.role === "scout"
                      ? "border-[hsl(var(--teal-deep))]/40 text-[hsl(var(--teal-deep))]"
                      : "border-white/15 text-foreground/70"
                }`}
              >
                {r.role === "admin" ? (
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </span>
                ) : (
                  r.role
                )}
              </span>
              {r.is_banned ? (
                <span className="rounded-full border border-rose-400/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  Banned
                </span>
              ) : null}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-foreground/60">
              No accounts match "{q}".
            </div>
          )}
        </SettingsCard>
      )}
    </SettingsShell>
  );
};

export default AdminUsersPage;
