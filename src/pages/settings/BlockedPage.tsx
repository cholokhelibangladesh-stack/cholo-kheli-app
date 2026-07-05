import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, Ban } from "lucide-react";

type Blocked = { blocked_id: string; full_name: string; username: string | null; avatar_url: string | null };

const BlockedPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Blocked[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Blocked[]>([]);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("blocked_users")
      .select("blocked_id, profiles:blocked_id (full_name, username, avatar_url)")
      .eq("blocker_id", user.id);
    const items: Blocked[] = (data ?? []).map((r: any) => ({
      blocked_id: r.blocked_id,
      full_name: r.profiles?.full_name ?? "Unknown",
      username: r.profiles?.username ?? null,
      avatar_url: r.profiles?.avatar_url ?? null,
    }));
    setList(items);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user]);

  useEffect(() => {
    if (!q.trim() || !user) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, username, avatar_url")
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .neq("user_id", user.id)
        .limit(10);
      setResults(
        (data ?? []).map((p: any) => ({
          blocked_id: p.user_id,
          full_name: p.full_name ?? "Unknown",
          username: p.username,
          avatar_url: p.avatar_url,
        })),
      );
    }, 250);
    return () => clearTimeout(t);
  }, [q, user]);

  const block = async (b: Blocked) => {
    if (!user) return;
    const { error } = await supabase
      .from("blocked_users")
      .insert({ blocker_id: user.id, blocked_id: b.blocked_id });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: `Blocked ${b.full_name}` });
    setQ("");
    setResults([]);
    refresh();
  };

  const unblock = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    refresh();
  };

  return (
    <SettingsShell title="Blocked" description="They can't see your profile or messages">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search accounts to block"
          className="rounded-2xl border-white/10 bg-white/[0.04] pl-9"
        />
      </div>

      {results.length > 0 && (
        <div className="mt-3 divide-y divide-white/[0.05] rounded-2xl border border-white/10 bg-white/[0.03]">
          {results.map((r) => (
            <div key={r.blocked_id} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar url={r.avatar_url} name={r.full_name} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.full_name}</div>
                <div className="truncate text-xs text-foreground/55">
                  @{r.username ?? "unknown"}
                </div>
              </div>
              <Button size="sm" variant="destructive" onClick={() => block(r)}>
                <Ban className="mr-1 h-3.5 w-3.5" /> Block
              </Button>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-6 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
        {list.length} blocked
      </h2>

      {loading ? (
        <div className="grid place-items-center py-10 text-foreground/60">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-foreground/55">
          You haven't blocked anyone.
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/10 bg-white/[0.03]">
          {list.map((r) => (
            <div key={r.blocked_id} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar url={r.avatar_url} name={r.full_name} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.full_name}</div>
                <div className="truncate text-xs text-foreground/55">
                  @{r.username ?? "unknown"}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => unblock(r.blocked_id)}>
                <X className="mr-1 h-3.5 w-3.5" /> Unblock
              </Button>
            </div>
          ))}
        </div>
      )}
    </SettingsShell>
  );
};

const Avatar = ({ url, name }: { url: string | null; name: string }) => (
  <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-foreground/80">
    {url ? (
      <img src={url} alt={name} className="h-full w-full object-cover" />
    ) : (
      <span>{name.slice(0, 1).toUpperCase()}</span>
    )}
  </div>
);

export default BlockedPage;
