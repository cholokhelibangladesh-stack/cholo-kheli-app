import { useState, useEffect, useRef, useCallback, useMemo } from"react";
import { Play, Loader2, Search, Heart, Share2, X, MoreHorizontal, User as UserIcon, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from"@/components/ui/badge";
import { Input } from"@/components/ui/input";
import { Button } from"@/components/ui/button";
import { useAuth } from"@/hooks/useAuth";
import { supabase } from"@/integrations/supabase/client";
import { useNavigate } from"@tanstack/react-router";
import { motion, AnimatePresence } from"framer-motion";
import ScoutSelectPlayer from"@/components/ScoutSelectPlayer";
import { safeMediaUrl } from"@/lib/sanitize";
import { toast } from"@/hooks/use-toast";

// ──────────────────────────────────────────────────────────────
// Filter taxonomy
// ──────────────────────────────────────────────────────────────
const SPORTS = ["football", "cricket", "basketball", "hockey", "athletics", "swimming"] as const;
type SportKey = typeof SPORTS[number];

const POSITIONS_BY_SPORT: Record<SportKey, string[]> = {
  football: ["goalkeeper", "defender", "fullback", "centre-back", "midfielder", "winger", "striker", "forward"],
  cricket: ["batsman", "bowler", "all-rounder", "wicket-keeper", "fielder", "spinner", "pacer"],
  basketball: ["point guard", "shooting guard", "small forward", "power forward", "center"],
  hockey: ["goalkeeper", "defender", "midfielder", "forward"],
  athletics: ["sprinter", "middle-distance", "long-distance", "jumper", "thrower"],
  swimming: ["freestyle", "backstroke", "breaststroke", "butterfly", "medley"],
};

const PLAYSTYLES = [
  "aggressive", "technical", "creative", "defensive", "fast", "physical",
  "clinical", "playmaker", "clutch", "consistent", "versatile", "leader",
];

type Filters = { sport: SportKey | "any"; positions: string[]; playstyles: string[] };
const EMPTY_FILTERS: Filters = { sport: "any", positions: [], playstyles: [] };

const FilterPanel = ({
  filters,
  onChange,
  onClear,
  variant = "light",
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
  variant?: "light" | "dark";
}) => {
  const positions = filters.sport === "any" ? [] : POSITIONS_BY_SPORT[filters.sport];
  const chip = (active: boolean) =>
    `text-xs rounded-full px-3 py-1.5 border transition ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : variant === "dark"
        ? "bg-white/10 text-white/80 border-white/20 hover:bg-white/15"
        : "bg-secondary text-foreground border-border hover:bg-secondary/70"
    }`;
  const label = variant === "dark" ? "text-white/70" : "text-muted-foreground";

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${variant === "dark" ? "text-white" : "text-foreground"}`}>Filters</h3>
        <button onClick={onClear} className={`text-xs ${label} hover:underline`}>Clear all</button>
      </div>

      <div>
        <p className={`text-[11px] uppercase tracking-wide mb-2 ${label}`}>Sport</p>
        <div className="flex flex-wrap gap-1.5">
          <button className={chip(filters.sport === "any")} onClick={() => onChange({ ...filters, sport: "any", positions: [] })}>Any</button>
          {SPORTS.map((s) => (
            <button
              key={s}
              className={chip(filters.sport === s)}
              onClick={() => onChange({ ...filters, sport: s, positions: [] })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {positions.length > 0 && (
        <div>
          <p className={`text-[11px] uppercase tracking-wide mb-2 ${label}`}>Positions</p>
          <div className="flex flex-wrap gap-1.5">
            {positions.map((p) => (
              <button
                key={p}
                className={chip(filters.positions.includes(p))}
                onClick={() => onChange({ ...filters, positions: toggle(filters.positions, p) })}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className={`text-[11px] uppercase tracking-wide mb-2 ${label}`}>Playstyle</p>
        <div className="flex flex-wrap gap-1.5">
          {PLAYSTYLES.map((t) => (
            <button
              key={t}
              className={chip(filters.playstyles.includes(t))}
              onClick={() => onChange({ ...filters, playstyles: toggle(filters.playstyles, t) })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface PlayerVideo {
 id: string;
 user_id: string;
 video_url: string | null;
 description: string | null;
 position_tags: string[];
 trait_tags: string[];
 full_name: string;
 sport: string;
 avatar_url: string;
 like_count: number;
 share_count: number;
 view_count: number;
 liked_by_me: boolean;
}

const PAGE_SIZE = 10;

// ──────────────────────────────────────────────────────────────
// Ranked feed loader
// ──────────────────────────────────────────────────────────────
async function signIfPrivate(url: string | null): Promise<string | null> {
 if (!url) return url;
 if (url.includes("/storage/v1/object/public/player-videos/")) return url.replace(/%2F/gi, "/");
 const marker = "/player-videos/";
 if (!url.includes(marker)) return url;
 const path = url.substring(url.indexOf(marker) + marker.length).split("?")[0];
 const { data } = await supabase.storage.from("player-videos").createSignedUrl(path, 60 * 60);
 return data?.signedUrl ?? url;
}

async function fetchFeedPage(offset: number): Promise<PlayerVideo[]> {
 const { data, error } = await (supabase as any).rpc("get_ranked_feed", {
 _limit: PAGE_SIZE,
 _offset: offset,
 _sport: null,
 });
 if (error) {
 if (error.message?.includes("rate_limited")) {
 toast({ title:"Slow down", description:"Too many requests, try again in a minute." });
 }
 throw error;
 }
 return Promise.all((data || []).map(async (r: any) => ({
 id: r.id,
 user_id: r.user_id,
 video_url: await signIfPrivate(r.video_url),
 description: r.description,
 position_tags: r.position_tags || [],
 trait_tags: r.trait_tags || [],
 full_name: r.full_name ||"Unknown",
 sport: r.sport ||"football",
 avatar_url: r.avatar_url ||"",
 like_count: r.like_count ?? 0,
 share_count: r.share_count ?? 0,
 view_count: r.view_count ?? 0,
 liked_by_me: !!r.liked_by_me,
 })));
}

// ──────────────────────────────────────────────────────────────
// Watch-time recorder — flushes a video_event on unmount/active change
// ──────────────────────────────────────────────────────────────
function useWatchTracker(videoId: string, isActive: boolean, userId: string | undefined) {
 const startRef = useRef<number | null>(null);
 const flushedRef = useRef(false);

 useEffect(() => {
 if (!userId) return;
 if (isActive) {
 startRef.current = Date.now();
 flushedRef.current = false;
 }
 return () => {
 if (!isActive || flushedRef.current || startRef.current == null) return;
 const watchMs = Math.min(Date.now() - startRef.current, 3_600_000);
 if (watchMs < 500) return;
 flushedRef.current = true;
 // fire-and-forget insert; RLS restricts to auth.uid()
 supabase.from("video_events" as any).insert({
 video_id: videoId,
 viewer_id: userId,
 watch_ms: watchMs,
 completed: watchMs > 15_000,
 }).then(() => {});
 };
 }, [isActive, videoId, userId]);
}

// ──────────────────────────────────────────────────────────────
// Reel item — full-screen slide with overlay
// ──────────────────────────────────────────────────────────────
const ReelItem = ({
 video,
 isActive,
 isScout,
 userId,
 onLikeToggle,
 onShare,
}: {
 video: PlayerVideo;
 isActive: boolean;
 isScout: boolean;
 userId?: string;
 onLikeToggle: (v: PlayerVideo) => void;
 onShare: (v: PlayerVideo) => void;
}) => {
 const videoRef = useRef<HTMLVideoElement>(null);
 const navigate = useNavigate();

 useWatchTracker(video.id, isActive, userId);

 useEffect(() => {
 if (!videoRef.current) return;
 if (isActive) {
 videoRef.current.play().catch(() => {});
 } else {
 videoRef.current.pause();
 videoRef.current.currentTime = 0;
 }
 }, [isActive]);

 return (
 <div className="relative w-full h-full bg-black flex-shrink-0">
 {video.video_url && isActive ? (
 <video
 ref={videoRef}
 src={safeMediaUrl(video.video_url)}
 className="w-full h-full object-cover"
 loop
 muted
 playsInline
 preload="metadata"
 />
) : (
 <div className="w-full h-full flex items-center justify-center bg-black">
 <Play className="h-16 w-16 text-white/40" />
 </div>
)}

 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

 <div className="absolute bottom-20 left-4 right-16 pointer-events-none">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden border border-white/30">
 {video.avatar_url ? (
 <img src={safeMediaUrl(video.avatar_url)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
) : (
 <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
 {video.full_name.charAt(0)}
 </div>
)}
 </div>
 <div>
 <p className="text-white font-semibold text-sm leading-tight drop-shadow">{video.full_name}</p>
 <p className="text-white/70 text-xs">{video.sport}</p>
 </div>
 </div>
 {video.description && (
 <p className="text-white/80 text-xs leading-relaxed line-clamp-2">{video.description}</p>
)}
 <div className="flex flex-wrap gap-1 mt-2">
 {video.position_tags.slice(0, 3).map((t) => (
 <span key={t} className="text-[10px] bg-white/20 text-white rounded-full px-2 py-0.5 backdrop-blur-sm">{t}</span>
))}
 </div>
 </div>

 <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4 pointer-events-auto">
 <button onClick={() => onLikeToggle(video)} className="flex flex-col items-center gap-1" aria-label="Like">
 <div className={`w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center transition ${
 video.liked_by_me ?"bg-red-500/80 border-red-400" :"bg-white/20 border-white/30"
 }`}>
 <Heart className={`w-5 h-5 ${video.liked_by_me ?"text-white fill-white" :"text-white"}`} />
 </div>
 <span className="text-white/80 text-[10px]">{video.like_count}</span>
 </button>

 <button onClick={() => onShare(video)} className="flex flex-col items-center gap-1" aria-label="Share">
 <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
 <Share2 className="w-5 h-5 text-white" />
 </div>
 <span className="text-white/80 text-[10px]">{video.share_count}</span>
 </button>

 <button
 onClick={() => navigate({ to: `/resume/${video.user_id}` as any })}
 className="flex flex-col items-center gap-1"
 aria-label="View profile"
 >
 <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 </div>
 <span className="text-white/80 text-[10px]">Profile</span>
 </button>

 {isScout && (
 <div className="flex flex-col items-center gap-1">
 <ScoutSelectPlayer playerId={video.user_id} playerName={video.full_name} />
 </div>
)}
 </div>
 </div>
);
};

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
const PlayerVideosTab = () => {
 const { user, role } = useAuth();
 const navigate = useNavigate();
 const [videos, setVideos] = useState<PlayerVideo[]>([]);
 const [loading, setLoading] = useState(true);
 const [loadingMore, setLoadingMore] = useState(false);
 const [hasMore, setHasMore] = useState(true);
 const [search, setSearch] = useState("");
 const [selectedVideo, setSelectedVideo] = useState<PlayerVideo | null>(null);
 const [activeIndex, setActiveIndex] = useState(0);
 const containerRef = useRef<HTMLDivElement>(null);
 const slideRefs = useRef<Map<string, HTMLDivElement>>(new Map());
 const [mobile, setMobile] = useState(false);
 const offsetRef = useRef(0);
 const loadingRef = useRef(false);

 useEffect(() => {
 const check = () => setMobile(window.innerWidth < 768);
 check();
 window.addEventListener("resize", check);
 return () => window.removeEventListener("resize", check);
 }, []);

 // Load next page from ranked RPC
 const loadMore = useCallback(async () => {
 if (loadingRef.current || !hasMore || !user) return;
 loadingRef.current = true;
 setLoadingMore(true);
 try {
 const page = await fetchFeedPage(offsetRef.current);
 if (page.length < PAGE_SIZE) setHasMore(false);
 offsetRef.current += page.length;
 setVideos((prev) => {
 const seen = new Set(prev.map((v) => v.id));
 return [...prev,...page.filter((v) => !seen.has(v.id))];
 });
 } catch (e: any) {
 console.error("feed load error", e);
 } finally {
 loadingRef.current = false;
 setLoadingMore(false);
 setLoading(false);
 }
 }, [hasMore, user]);

 // Initial load
 useEffect(() => {
 if (!user) return;
 offsetRef.current = 0;
 setVideos([]);
 setHasMore(true);
 setLoading(true);
 loadMore();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [user, role]);

 // IntersectionObserver: pick active slide + prefetch when near the end
 useEffect(() => {
 if (!mobile || !containerRef.current) return;
 const root = containerRef.current;
 const obs = new IntersectionObserver(
 (entries) => {
 entries.forEach((e) => {
 if (e.isIntersecting && e.intersectionRatio > 0.6) {
 const idx = Number((e.target as HTMLElement).dataset.idx || 0);
 setActiveIndex(idx);
 if (idx >= videos.length - 3) loadMore();
 }
 });
 },
 { root, threshold: [0.6] }
);
 slideRefs.current.forEach((el) => obs.observe(el));
 return () => obs.disconnect();
 }, [mobile, videos.length, loadMore]);

 // Like toggle — optimistic
 const toggleLike = useCallback(async (v: PlayerVideo) => {
 if (!user) { navigate({ to:"/auth" as any }); return; }
 const nextLiked = !v.liked_by_me;
 setVideos((prev) => prev.map((x) => x.id === v.id
 ? {...x, liked_by_me: nextLiked, like_count: Math.max(0, x.like_count + (nextLiked ? 1 : -1)) }
 : x));
 if (nextLiked) {
 const { error } = await supabase.from("video_likes" as any).insert({ video_id: v.id, user_id: user.id });
 if (error && !error.message?.includes("duplicate")) {
 setVideos((prev) => prev.map((x) => x.id === v.id ? {...x, liked_by_me: false, like_count: Math.max(0, x.like_count - 1) } : x));
 }
 } else {
 const { error } = await supabase.from("video_likes" as any).delete().eq("video_id", v.id).eq("user_id", user.id);
 if (error) {
 setVideos((prev) => prev.map((x) => x.id === v.id ? {...x, liked_by_me: true, like_count: x.like_count + 1 } : x));
 }
 }
 }, [user, navigate]);

 const shareVideo = useCallback(async (v: PlayerVideo) => {
 if (!user) { navigate({ to:"/auth" as any }); return; }
 const url = `${window.location.origin}/resume/${v.user_id}`;
 try {
 if (navigator.share) {
 await navigator.share({ title: v.full_name, url });
 } else {
 await navigator.clipboard.writeText(url);
 toast({ title:"Link copied", description:"Profile link copied to clipboard." });
 }
 await supabase.from("video_shares" as any).insert({ video_id: v.id, user_id: user.id });
 setVideos((prev) => prev.map((x) => x.id === v.id ? {...x, share_count: x.share_count + 1 } : x));
 } catch { /* user cancelled */ }
 }, [user, navigate]);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const activeFilterCount =
    (filters.sport !== "any" ? 1 : 0) + filters.positions.length + filters.playstyles.length;

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return videos.filter((v) => {
      if (q &&
        !v.full_name.toLowerCase().includes(q) &&
        !v.position_tags.some((t) => t.toLowerCase().includes(q))
      ) return false;
      if (filters.sport !== "any" && v.sport?.toLowerCase() !== filters.sport) return false;
      if (filters.positions.length > 0 &&
        !filters.positions.some((p) => v.position_tags.map((t) => t.toLowerCase()).includes(p))
      ) return false;
      if (filters.playstyles.length > 0 &&
        !filters.playstyles.some((t) => v.trait_tags.map((x) => x.toLowerCase()).includes(t))
      ) return false;
      return true;
    });
  }, [videos, search, filters]);


 if (loading) {
 if (mobile) {
 return (
 <div className="flex justify-center py-12">
 <Loader2 className="h-6 w-6 animate-spin text-primary" />
 </div>
 );
 }
 return (
 <div className="space-y-4" aria-busy="true" aria-label="Loading videos">
 <div className="h-10 w-full sk-shimmer rounded-full" />
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="aspect-square sk-shimmer rounded-md" />
 ))}
 </div>
 </div>
 );
 }

 // ── MOBILE: Reels feed ──────────────────────────────────────
 if (mobile) {
 if (filteredVideos.length === 0)
 return (
 <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-3">
 <p className="text-muted-foreground text-sm">No player videos available yet.</p>
 </div>
);

 return (
 <div className="fixed inset-0 top-0 bg-black z-40">
 <div className="absolute top-0 left-0 right-0 z-50 px-4" style={{ paddingTop:"env(safe-area-inset-top, 16px)" }}>
 <div className="mt-3 relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
 <Input
 placeholder="Search players, positions..."
 className="pl-10 bg-black/40 border-white/20 text-white placeholder:text-white/50 rounded-full backdrop-blur-md"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 </div>

 <div
 ref={containerRef}
 className="w-full h-full overflow-y-scroll snap-y snap-mandatory"
 style={{ scrollbarWidth:"none" }}
 >
 {filteredVideos.map((v, i) => (
 <div
 key={v.id}
 data-idx={i}
 ref={(el) => {
 if (el) slideRefs.current.set(v.id, el);
 else slideRefs.current.delete(v.id);
 }}
 className="w-full snap-start snap-always"
 style={{ height:"100dvh" }}
 >
 <ReelItem
 video={v}
 isActive={i === activeIndex}
 isScout={role ==="scout"}
 userId={user?.id}
 onLikeToggle={toggleLike}
 onShare={shareVideo}
 />
 </div>
))}
 {loadingMore && (
 <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/60" /></div>
)}
 </div>
 </div>
);
 }

 // ── DESKTOP: Grid view ───────────────────────────────────────
 return (
 <div className="space-y-4">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Search players, positions..."
 className="pl-10 bg-card border-border rounded-full"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>

 {filteredVideos.length === 0 ? (
 <p className="text-center text-muted-foreground py-12">No player videos available yet.</p>
) : (
 <>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
 {filteredVideos.map((v, i) => (
 <motion.div
 key={v.id}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: Math.min(i * 0.02, 0.3) }}
 className="relative aspect-square bg-secondary overflow-hidden cursor-pointer group"
 onClick={() => setSelectedVideo(v)}
 >
 <div className="w-full h-full flex items-center justify-center bg-secondary">
 <Play className="h-8 w-8 text-muted-foreground" />
 </div>
 <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-end p-3 gap-2">
 <p className="text-foreground font-semibold text-sm w-full">{v.full_name}</p>
 </div>
 <Badge className="absolute top-2 left-2 bg-background/70 text-foreground border-0 text-[10px] backdrop-blur-sm">
 {v.sport}
 </Badge>
 <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5 text-[10px] text-white">
 <Heart className="w-3 h-3" /> {v.like_count}
 </div>
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pointer-events-none">
 <p className="text-white text-xs font-medium truncate">{v.full_name}</p>
 </div>
 </motion.div>
))}
 </div>

 {hasMore && (
 <div className="flex justify-center py-4">
 <button
 onClick={() => loadMore()}
 disabled={loadingMore}
 className="text-sm text-primary hover:underline disabled:opacity-50"
 >
 {loadingMore ?"Loading…" :"Load more"}
 </button>
 </div>
)}
 </>
)}

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setSelectedVideo(null)}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Reel container — vertical 9:16, IG-like */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="relative h-[92vh] max-h-[900px] aspect-[9/16] max-w-[95vw] bg-black rounded-2xl overflow-hidden shadow-2xl flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video */}
              <div className="relative flex-1 h-full bg-black">
                {selectedVideo.video_url ? (
                  <video
                    src={safeMediaUrl(selectedVideo.video_url)}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-16 w-16 text-white/40" />
                  </div>
                )}

                {/* Gradient overlay for caption legibility */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                {/* Top bar — profile + more */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 z-10">
                  <button
                    onClick={() => navigate({ to: `/resume/${selectedVideo.user_id}` as any })}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/60 bg-white/10">
                      {selectedVideo.avatar_url ? (
                        <img src={safeMediaUrl(selectedVideo.avatar_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                          {selectedVideo.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm leading-tight drop-shadow group-hover:underline">
                        {selectedVideo.full_name}
                      </p>
                      <p className="text-white/70 text-[11px]">{selectedVideo.sport}</p>
                    </div>
                  </button>

                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition" aria-label="More">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate({ to: `/resume/${selectedVideo.user_id}` as any })}>
                          View profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareVideo(selectedVideo)}>
                          Copy link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedVideo(null)}>
                          Close
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Bottom caption */}
                <div className="absolute bottom-0 left-0 right-16 p-4 z-10">
                  {selectedVideo.description && (
                    <p className="text-white/95 text-sm leading-relaxed mb-2 drop-shadow line-clamp-3">
                      {selectedVideo.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVideo.position_tags.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] bg-white/20 text-white rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/20">
                        #{t}
                      </span>
                    ))}
                    {selectedVideo.trait_tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] bg-white/10 text-white/90 rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right action rail */}
                <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 z-10">
                  <button onClick={() => toggleLike(selectedVideo)} className="flex flex-col items-center gap-1" aria-label="Like">
                    <div className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition ${
                      selectedVideo.liked_by_me ? "bg-red-500/90 border-red-400" : "bg-white/15 border-white/25 hover:bg-white/25"
                    }`}>
                      <Heart className={`w-6 h-6 ${selectedVideo.liked_by_me ? "text-white fill-white" : "text-white"}`} />
                    </div>
                    <span className="text-white text-[11px] font-medium drop-shadow">{selectedVideo.like_count}</span>
                  </button>

                  <button onClick={() => shareVideo(selectedVideo)} className="flex flex-col items-center gap-1" aria-label="Share">
                    <div className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center transition">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-[11px] font-medium drop-shadow">{selectedVideo.share_count}</span>
                  </button>

                  <button
                    onClick={() => navigate({ to: `/resume/${selectedVideo.user_id}` as any })}
                    className="flex flex-col items-center gap-1"
                    aria-label="View profile"
                  >
                    <div className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center transition">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-[11px] font-medium drop-shadow">Profile</span>
                  </button>

                  {role === "scout" && (
                    <div className="flex flex-col items-center">
                      <ScoutSelectPlayer playerId={selectedVideo.user_id} playerName={selectedVideo.full_name} />
                    </div>
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

export default PlayerVideosTab;
