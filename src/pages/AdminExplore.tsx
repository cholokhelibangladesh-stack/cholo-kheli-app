import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, Play, Flag, Trash2, Ban, ShieldOff, X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeMediaUrl } from "@/lib/sanitize";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

type AdminVideo = {
  id: string;
  user_id: string;
  video_url: string | null;
  title: string | null;
  description: string | null;
  status: string;
  flagged: boolean;
  archived: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  full_name?: string;
  sport?: string;
  avatar_url?: string;
  is_banned?: boolean;
};

const normalizePlayerVideoUrl = (url: string | null): string | null => {
  if (!url) return null;
  return url.includes("/storage/v1/object/public/player-videos/") ? url.replace(/%2F/gi, "/") : url;
};

const AdminExplore = () => {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminVideo | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "flagged" | "removed">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: vids, error } = await supabase
      .from("videos")
      .select(
        "id, user_id, video_url, title, description, status, flagged, archived, view_count, like_count, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: "Failed to load videos", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set((vids ?? []).map((v: any) => v.user_id)));
    const profileMap = new Map<string, any>();
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, sport, avatar_url, is_banned")
        .in("user_id", userIds);
      (profs ?? []).forEach((p: any) => profileMap.set(p.user_id, p));
    }

    const rows: AdminVideo[] = await Promise.all(
      (vids ?? []).map(async (v: any) => {
        const p = profileMap.get(v.user_id) ?? {};
        const url = normalizePlayerVideoUrl(v.video_url ?? null);
        return {
          id: v.id,
          user_id: v.user_id,
          video_url: url,
          title: v.title,
          description: v.description,
          status: v.status,
          flagged: v.flagged,
          archived: v.archived,
          view_count: v.view_count ?? 0,
          like_count: v.like_count ?? 0,
          created_at: v.created_at,
          full_name: p.full_name ?? "Unknown",
          sport: p.sport ?? "",
          avatar_url: p.avatar_url ?? "",
          is_banned: !!p.is_banned,
        };
      }),
    );
    setVideos(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyUpdate = async (id: string, patch: Partial<AdminVideo>) => {
    const { error } = await supabase.from("videos").update(patch as any).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return false;
    }
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    if (selected?.id === id) setSelected((s) => (s ? { ...s, ...patch } : s));
    return true;
  };

  const suspend = async (v: AdminVideo) => {
    setBusy(true);
    const ok = await applyUpdate(v.id, { flagged: true, status: "under_review" });
    if (ok) toast({ title: "Reel suspended", description: "Hidden from public feed." });
    setBusy(false);
  };

  const reinstate = async (v: AdminVideo) => {
    setBusy(true);
    const ok = await applyUpdate(v.id, { flagged: false, status: "live" });
    if (ok) toast({ title: "Reel reinstated" });
    setBusy(false);
  };

  const remove = async (v: AdminVideo) => {
    if (!confirm("Remove this reel permanently? This deletes the record.")) return;
    setBusy(true);
    const { error } = await supabase.from("videos").delete().eq("id", v.id);
    setBusy(false);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setVideos((prev) => prev.filter((x) => x.id !== v.id));
    setSelected(null);
    toast({ title: "Reel deleted" });
  };

  const banCreator = async (v: AdminVideo) => {
    const reason = prompt("Reason for banning this creator (visible to admins):", "Repeated policy violation");
    if (reason == null) return;
    const message = prompt("Message shown to the banned user:", "Your account has been suspended.");
    if (message == null) return;
    const hoursStr = prompt("Duration in hours (leave blank for permanent):", "");
    const hours = hoursStr && hoursStr.trim() ? parseInt(hoursStr, 10) : null;
    setBusy(true);
    const { error } = await (supabase as any).rpc("admin_set_ban", {
      _target_user: v.user_id,
      _scope: "profile",
      _banned: true,
      _reason: reason,
      _message: message,
      _duration_hours: hours,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Ban failed", description: error.message, variant: "destructive" });
      return;
    }
    setVideos((prev) => prev.map((x) => (x.user_id === v.user_id ? { ...x, is_banned: true } : x)));
    if (selected?.user_id === v.user_id) setSelected((s) => (s ? { ...s, is_banned: true } : s));
    toast({ title: "Creator banned" });
  };

  const unbanCreator = async (v: AdminVideo) => {
    setBusy(true);
    const { error } = await (supabase as any).rpc("admin_set_ban", {
      _target_user: v.user_id,
      _scope: "profile",
      _banned: false,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Unban failed", description: error.message, variant: "destructive" });
      return;
    }
    setVideos((prev) => prev.map((x) => (x.user_id === v.user_id ? { ...x, is_banned: false } : x)));
    if (selected?.user_id === v.user_id) setSelected((s) => (s ? { ...s, is_banned: false } : s));
    toast({ title: "Creator unbanned" });
  };

  const filtered = videos.filter((v) => {
    if (statusFilter === "live" && (v.status !== "live" || v.flagged)) return false;
    if (statusFilter === "flagged" && !v.flagged) return false;
    if (statusFilter === "removed" && v.status !== "removed" && v.status !== "under_review") return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (v.title ?? "").toLowerCase().includes(q) ||
      (v.full_name ?? "").toLowerCase().includes(q) ||
      (v.description ?? "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: videos.length,
    live: videos.filter((v) => v.status === "live" && !v.flagged).length,
    flagged: videos.filter((v) => v.flagged).length,
  };

  return (
    <div className="min-h-screen pt-16 pb-24">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Admin · Explore</p>
            <h1 className="font-display text-3xl text-foreground mt-1">MODERATE REELS</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.live} live · {stats.flagged} flagged · {stats.total} total
            </p>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title, creator, description…"
              className="pl-10 bg-card border-border rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {(["all", "live", "flagged", "removed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  statusFilter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground/70 hover:bg-accent"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No reels match this filter.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {filtered.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden text-left group"
                >
                  {v.video_url ? (
                    <video
                      src={`${safeMediaUrl(v.video_url)}#t=1.5`}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLVideoElement;
                        el.pause();
                        el.currentTime = 1.5;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex flex-wrap gap-1">
                    {v.flagged && (
                      <Badge className="bg-red-500/90 text-white border-0 text-[9px] px-1.5 py-0">
                        <Flag className="h-2.5 w-2.5 mr-0.5" /> Flagged
                      </Badge>
                    )}
                    {v.status !== "live" && (
                      <Badge className="bg-amber-500/90 text-white border-0 text-[9px] px-1.5 py-0">
                        {v.status}
                      </Badge>
                    )}
                    {v.is_banned && (
                      <Badge className="bg-black/80 text-white border-0 text-[9px] px-1.5 py-0">
                        <Ban className="h-2.5 w-2.5 mr-0.5" /> Banned
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                    <p className="text-[11px] font-semibold truncate drop-shadow">{v.full_name}</p>
                    <p className="text-[10px] text-white/70 truncate">{v.title || "Untitled"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => !busy && setSelected(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-card border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden w-full sm:max-w-md max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{selected.full_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{selected.title || "Untitled"}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-black">
                {selected.video_url ? (
                  <video
                    src={safeMediaUrl(selected.video_url)}
                    className="w-full max-h-[55vh] object-contain"
                    controls
                    playsInline
                  />
                ) : (
                  <div className="aspect-[9/16] flex items-center justify-center">
                    <Play className="h-10 w-10 text-white/40" />
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3 overflow-y-auto">
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline">{selected.status}</Badge>
                  {selected.flagged && (
                    <Badge className="bg-red-500/90 text-white border-0">
                      <Flag className="h-3 w-3 mr-1" /> Flagged
                    </Badge>
                  )}
                  {selected.is_banned && (
                    <Badge className="bg-black text-white border-0">
                      <Ban className="h-3 w-3 mr-1" /> Creator banned
                    </Badge>
                  )}
                  <span className="ml-auto text-muted-foreground">
                    {selected.view_count} views · {selected.like_count} likes
                  </span>
                </div>

                {selected.description && (
                  <p className="text-xs text-foreground/80 leading-relaxed">{selected.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selected.flagged || selected.status !== "live" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => reinstate(selected)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Reinstate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => suspend(selected)}
                    >
                      <Flag className="h-4 w-4 mr-1" /> Suspend
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busy}
                    onClick={() => remove(selected)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>

                  {selected.is_banned ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => unbanCreator(selected)}
                      className="col-span-2"
                    >
                      <ShieldOff className="h-4 w-4 mr-1" /> Unban creator
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={busy}
                      onClick={() => banCreator(selected)}
                      className="col-span-2 bg-black hover:bg-black/80"
                    >
                      <Ban className="h-4 w-4 mr-1" /> Ban creator
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminExplore;
