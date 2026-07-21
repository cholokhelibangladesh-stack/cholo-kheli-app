import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Loader2, Video, X, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { safeMediaUrl } from "@/lib/sanitize";

interface Profile {
  full_name: string | null;
  username: string | null;
  bio: string | null;
  sport: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
}

interface VideoRecord {
  id: string;
  video_url: string | null;
  description: string | null;
  status: string;
  user_id: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
}

const SPORT_LABEL: Record<string, string> = {
  football: "Football",
  cricket: "Cricket",
  basketball: "Basketball",
};

const PlayerResume = () => {
  const { userId } = useParams({ strict: false }) as { userId: string };
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoRecord | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = bioRef.current;
    if (!el) { setBioOverflows(false); return; }
    const check = () => {
      if (bioExpanded) return;
      setBioOverflows(el.scrollHeight - el.clientHeight > 1);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [profile?.bio, bioExpanded]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [profileRes, videosRes, achieveRes] = await Promise.all([
        supabase.from("profiles").select("full_name, username, bio, sport, avatar_url, date_of_birth").eq("user_id", userId).maybeSingle(),
        supabase.from("videos").select("id, video_url, description, status, user_id").eq("user_id", userId).eq("status", "live" as any).order("created_at", { ascending: false }),
        supabase.from("achievements").select("*").eq("user_id", userId).order("year", { ascending: false }),
      ]);
      setProfile(profileRes.data as Profile | null);
      setVideos((videosRes.data || []) as VideoRecord[]);
      setAchievements((achieveRes.data || []) as Achievement[]);
      setLoading(false);
    })();
  }, [userId]);

  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveVideo(null); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [activeVideo]);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!profile) return <div className="flex items-center justify-center py-24 text-muted-foreground">Player not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto px-4 pt-2 pb-6 space-y-4">
      {/* Hero card — mirrors ProfileTab aesthetic */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.35)]"
      >
        <div className="relative aspect-[4/6.2] sm:aspect-[16/14] w-full overflow-hidden bg-gradient-to-b from-primary/25 via-primary/10 to-primary/30">
          {profile.avatar_url ? (
            <img
              src={safeMediaUrl(profile.avatar_url)}
              alt={profile.full_name || "Profile"}
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 15%" }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-24 w-24 text-primary/50" />
            </div>
          )}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />

          {/* Top-left: player · sport */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="text-[11px] font-bold tracking-widest text-foreground/90 uppercase drop-shadow-sm">
              player {profile.sport ? <span className="text-foreground/60">· {SPORT_LABEL[profile.sport] || profile.sport}</span> : null}
            </div>
          </div>

          {/* Glass bar */}
          <div
            className="absolute inset-x-0 bottom-0 bg-white/10 dark:bg-black/20 backdrop-blur-2xl border-t border-white/25 text-foreground"
            style={{ transition: "backdrop-filter 400ms ease" }}
          >
            <div className="px-5 pt-2 pb-1.5">
              <div className="font-display text-xl sm:text-2xl leading-tight truncate text-foreground drop-shadow-sm">
                {profile.full_name || "Player"}
              </div>
              {profile.username && (
                <div className="text-[11px] text-foreground/70 truncate">@{profile.username}</div>
              )}
            </div>

            {profile.bio && (
              <div className="px-5 pb-3">
                <p
                  ref={bioRef}
                  className="text-[12.5px] leading-[1.45] text-foreground/85 drop-shadow-sm whitespace-pre-line break-words overflow-hidden"
                  style={{
                    maxHeight: bioExpanded ? "40rem" : "4.4em",
                    transition: "max-height 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease",
                    opacity: bioExpanded ? 1 : 0.95,
                  }}
                >
                  {profile.bio}
                </p>
                {(bioOverflows || bioExpanded) && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded((v) => !v)}
                    className="mt-0.5 text-[11px] font-semibold text-primary hover:underline drop-shadow-sm"
                    aria-expanded={bioExpanded}
                  >
                    {bioExpanded ? "see less" : "see more"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Videos gallery */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-4 sm:p-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {videos.map((vid) => (
              <motion.div
                key={vid.id}
                whileHover={{ y: -2 }}
                onClick={() => vid.video_url && setActiveVideo(vid)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && vid.video_url) {
                    e.preventDefault();
                    setActiveVideo(vid);
                  }
                }}
                aria-label="Play reel"
                className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-border bg-secondary cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {vid.video_url ? (
                  <video
                    src={safeMediaUrl(vid.video_url) + "#t=1.5"}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <p className="text-[11px] text-white line-clamp-2 leading-snug">
                    {vid.description || ""}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm uppercase tracking-widest text-foreground">Achievements</h2>
          </div>
          <div className="space-y-2">
            {achievements.map((a) => (
              <div key={a.id} className="bg-secondary rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground text-sm truncate">{a.title}</span>
                  {a.year && <span className="text-xs text-muted-foreground shrink-0">{a.year}</span>}
                </div>
                {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen reel viewer */}
      {activeVideo && activeVideo.video_url && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => setActiveVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Reel player"
          style={{ height: "100dvh" }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setActiveVideo(null); }}
            className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center z-10"
            aria-label="Close"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
          >
            <X className="h-5 w-5" />
          </button>
          <video
            key={activeVideo.id}
            src={safeMediaUrl(activeVideo.video_url)}
            className="max-w-full max-h-full w-auto h-full object-contain"
            autoPlay
            controls
            playsInline
            onClick={(e) => e.stopPropagation()}
          />
          {activeVideo.description && (
            <div
              className="absolute inset-x-0 bottom-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
            >
              <p className="text-sm text-white line-clamp-3 max-w-2xl mx-auto">
                {activeVideo.description}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PlayerResume;
