import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X, Plus } from "lucide-react";

export type UserRelation = {
  target_id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
};

type Props = {
  title: string;
  description?: string;
  emptyText: string;
  table: "close_friends" | "muted_users" | "restricted_users" | "favorites";
  ownerColumn: string; // "user_id"
  targetColumn: string; // "friend_id" | "muted_id" | "restricted_id" | "favorite_id"
  addLabel?: string;
  removeLabel?: string;
};

/**
 * Reusable settings page: search-to-add + list-with-remove for any
 * user→user relation table (close_friends, muted_users, restricted_users,
 * favorites). Keeps every account-list screen visually consistent.
 */
const UserRelationPage = ({
  title,
  description,
  emptyText,
  table,
  ownerColumn,
  targetColumn,
  addLabel = "Add",
  removeLabel = "Remove",
}: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<UserRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<UserRelation[]>([]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from(table)
      .select(`${targetColumn}, profiles:${targetColumn} (full_name, username, avatar_url)`)
      .eq(ownerColumn, user.id);
    if (error) {
      toast({ title: "Could not load", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setList(
      (data ?? []).map((r: any) => ({
        target_id: r[targetColumn],
        full_name: r.profiles?.full_name ?? "Unknown",
        username: r.profiles?.username ?? null,
        avatar_url: r.profiles?.avatar_url ?? null,
      })),
    );
    setLoading(false);
  }, [user, table, targetColumn, ownerColumn, toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
      const existing = new Set(list.map((r) => r.target_id));
      setResults(
        (data ?? [])
          .filter((p: any) => !existing.has(p.user_id))
          .map((p: any) => ({
            target_id: p.user_id,
            full_name: p.full_name ?? "Unknown",
            username: p.username,
            avatar_url: p.avatar_url,
          })),
      );
    }, 250);
    return () => clearTimeout(t);
  }, [q, user, list]);

  const add = async (r: UserRelation) => {
    if (!user) return;
    const payload = { [ownerColumn]: user.id, [targetColumn]: r.target_id } as never;
    const { error } = await supabase.from(table).insert(payload);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: `${addLabel}: ${r.full_name}` });
    setQ("");
    setResults([]);
    refresh();
  };

  const remove = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(ownerColumn, user.id)
      .eq(targetColumn, id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    refresh();
  };

  return (
    <SettingsShell title={title} description={description}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search accounts"
          className="rounded-2xl border-white/10 bg-white/[0.04] pl-9"
        />
      </div>

      {results.length > 0 && (
        <div className="mt-3 divide-y divide-white/[0.05] rounded-2xl border border-white/10 bg-white/[0.03]">
          {results.map((r) => (
            <Row
              key={r.target_id}
              r={r}
              action={
                <Button size="sm" onClick={() => add(r)}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {addLabel}
                </Button>
              }
            />
          ))}
        </div>
      )}

      <h2 className="mt-6 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
        {list.length} {list.length === 1 ? "account" : "accounts"}
      </h2>

      {loading ? (
        <div className="grid place-items-center py-10 text-foreground/60">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-foreground/55">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/10 bg-white/[0.03]">
          {list.map((r) => (
            <Row
              key={r.target_id}
              r={r}
              action={
                <Button size="sm" variant="ghost" onClick={() => remove(r.target_id)}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  {removeLabel}
                </Button>
              }
            />
          ))}
        </div>
      )}
    </SettingsShell>
  );
};

const Row = ({ r, action }: { r: UserRelation; action: React.ReactNode }) => (
  <div className="flex items-center gap-3 px-3 py-2.5">
    <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-foreground/80">
      {r.avatar_url ? (
        <img src={r.avatar_url} alt={r.full_name} className="h-full w-full object-cover" />
      ) : (
        <span>{r.full_name.slice(0, 1).toUpperCase()}</span>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium">{r.full_name}</div>
      <div className="truncate text-xs text-foreground/55">@{r.username ?? "unknown"}</div>
    </div>
    {action}
  </div>
);

export default UserRelationPage;
