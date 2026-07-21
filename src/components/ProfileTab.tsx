import { useState, useEffect, useRef } from "react";
import { User, Camera, Loader2, Save, Calendar, Phone, Shield, Video, Trash2, AlertTriangle, Heart, Eye, Share2, Clock, Trophy, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { safeMediaUrl } from "@/lib/sanitize";
import AvatarCropDialog from "@/components/AvatarCropDialog";

interface VideoRecord {
  id: string;
  status: string;
  description: string | null;
  position_tags: string[];
  trait_tags: string[];
  video_url: string | null;
  created_at: string;
}

interface ProfileStats {
  likes: number;
  views: number;
  shares: number;
  watchMinutes: number;
  videos: number;
}

interface ProfileData {
  full_name: string;
  username: string;
  bio: string;
  phone: string;
  avatar_url: string;
  sport: string;
  gender: string;
  date_of_birth: string;
  guardian_contact: string;
}

interface ProfileTabProps {
  showVideos?: VideoRecord[];
  onDeleteVideo?: (vid: VideoRecord) => void;
  deletingVideoId?: string | null;
  stats?: ProfileStats;
}

const formatCompact = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

const SPORT_LABEL: Record<string, string> = {
  football: "Football",
  cricket: "Cricket",
  basketball: "Basketball",
};

const ProfileTab = ({ showVideos, onDeleteVideo, deletingVideoId, stats }: ProfileTabProps) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoRecord | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveVideo(null); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeVideo]);

  const [profile, setProfile] = useState<ProfileData>({
    full_name: "", username: "", bio: "", phone: "", avatar_url: "",
    sport: "", gender: "", date_of_birth: "", guardian_contact: "",
  });

  // Measure whether the collapsed bio overflows and needs "see more"
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
  }, [profile.bio, bioExpanded]);

  const computeAge = (dob: string): number | null => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  };
  const age = computeAge(profile.date_of_birth);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile({
          full_name: data.full_name || "", username: (data as any).username || "",
          bio: data.bio || "", phone: data.phone || "", avatar_url: data.avatar_url || "",
          sport: data.sport || "", gender: data.gender || "",
          date_of_birth: data.date_of_birth || "", guardian_contact: data.guardian_contact || "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  const handleSportClick = async (s: "football" | "cricket" | "basketball") => {
    if (!user || profile.sport === s) return;
    setProfile((p) => ({ ...p, sport: s }));
    try {
      const { error } = await supabase.from("profiles").update({ sport: s } as any).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Sport updated", description: `Your profile sport is now ${SPORT_LABEL[s]}.` });
    } catch (err: any) {
      toast({ title: "Failed to save sport", description: err.message, variant: "destructive" });
    }
  };

  const handleAvatarUpload = async (blob: Blob) => {
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const bustedUrl = `${publicUrl}?v=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: bustedUrl } as any).eq("user_id", user.id);
      setProfile((p) => ({ ...p, avatar_url: bustedUrl }));
      toast({ title: "Avatar updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleAvatarFileSelected = (file: File) => {
    setPendingAvatarFile(file);
    setCropOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updateData: Record<string, any> = {
        full_name: profile.full_name || "",
        bio: profile.bio || null,
        phone: profile.phone || null,
        avatar_url: profile.avatar_url || null,
        sport: profile.sport || null,
        gender: profile.gender || null,
        date_of_birth: profile.date_of_birth || null,
        guardian_contact: profile.guardian_contact || null,
      };
      if (profile.username?.trim()) {
        updateData.username = profile.username.trim();
      }

      const { error } = await supabase.from("profiles").update(updateData as any).eq("user_id", user.id);
      if (error) {
        const msg = error.message.includes("unique") || error.message.includes("duplicate")
          ? "Username already taken. Please choose a different one."
          : error.message;
        toast({ title: "Save failed", description: msg, variant: "destructive" });
      } else {
        toast({ title: "Profile saved!" });
        setEditing(false);
      }
    } catch (err: any) {
      toast({ title: "Unexpected error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const joinDate = user?.created_at ? new Date(user.created_at) : new Date();
  const joinLabel = joinDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
  const joinYear = joinDate.getFullYear();

  // Compact stat columns for the ticket strip (top 4)
  const ticketStats = stats ? [
    { label: "Views", value: formatCompact(stats.views) },
    { label: "Likes", value: formatCompact(stats.likes) },
    { label: "Shares", value: formatCompact(stats.shares) },
    { label: "Watch", value: formatCompact(stats.watchMinutes) + "m" },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-4">
      {/* Hero Card — photo on top, glass bar with name/username/stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.35)]"
      >
        {/* Image area with overlaid glass bar */}
        <div className="relative aspect-[4/6.3] sm:aspect-[16/13] w-full overflow-hidden bg-gradient-to-b from-primary/25 via-primary/10 to-primary/30">
          {profile.avatar_url ? (
            <img
              src={safeMediaUrl(profile.avatar_url)}
              alt={profile.full_name || "Profile"}
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-24 w-24 text-primary/50" />
            </div>
          )}
          {/* soft top scrim so header text stays legible */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />

          {/* Top-left: role/sport label */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="text-[11px] font-bold tracking-widest text-foreground/90 uppercase drop-shadow-sm">
              {(role || "player")} {profile.sport ? <span className="text-foreground/60">· {SPORT_LABEL[profile.sport] || profile.sport}</span> : null}
            </div>
          </div>

          {/* Avatar upload button (top-right so it sits above the glass bar) */}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 shadow-lg z-20"
            aria-label="Change photo"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleAvatarFileSelected(f);
              e.target.value = "";
            }}
          />

          {/* Glass bar — overlays bottom of the image so the backdrop-blur blurs the photo */}
          <div className="absolute inset-x-0 bottom-0 bg-white/10 dark:bg-black/20 backdrop-blur-2xl border-t border-white/25 text-foreground">
            <div className="px-5 pt-2 pb-1.5 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="font-display text-xl sm:text-2xl leading-tight truncate text-foreground drop-shadow-sm">
                  {profile.full_name || "Your Name"}
                </div>
                <div className="text-[11px] text-foreground/70 truncate">@{profile.username || "username"}</div>
              </div>
              <Button
                size="sm"
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className="rounded-full shrink-0 shadow-sm h-7 px-3 text-xs"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : editing ? <Save className="h-3 w-3 mr-1" /> : null}
                {editing ? "Save" : "Edit"}
              </Button>
            </div>

            {/* Bio inside the glass card — preserves user line breaks, clamps to 2 lines with "see more" */}
            {profile.bio && (
              <div className="px-5 pb-2">
                <p
                  ref={bioRef}
                  className="text-[12.5px] leading-[1.45] text-foreground/85 drop-shadow-sm whitespace-pre-line break-words overflow-hidden transition-[max-height] duration-300 ease-out"
                  style={{
                    maxHeight: bioExpanded ? "40rem" : "2.9em",
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

            {/* Stats strip — 4 compact columns */}
            {stats && (
              <div className="px-5 pb-2 grid grid-cols-4 gap-2 border-t border-white/15 pt-1.5">
                {ticketStats.map((s) => (
                  <div key={s.label} className="text-center min-w-0">
                    <div className="text-[9px] uppercase tracking-widest text-foreground/70">{s.label}</div>
                    <div className="font-display text-sm sm:text-base mt-0 truncate text-foreground drop-shadow-sm">{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>


      {/* Meta chips */}
      {!editing && (profile.date_of_birth || profile.phone || profile.gender) && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            {profile.gender && <Badge variant="outline" className="text-xs rounded-full capitalize">{profile.gender}</Badge>}
            {profile.date_of_birth && (
              <Badge variant="outline" className="text-xs rounded-full">
                <Calendar className="h-3 w-3 mr-1" /> {new Date(profile.date_of_birth).toLocaleDateString()}{age !== null ? ` · ${age}y` : ""}
              </Badge>
            )}
            {profile.phone && (
              <Badge variant="outline" className="text-xs rounded-full">
                <Phone className="h-3 w-3 mr-1" /> {profile.phone}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</Label>
              <Input className="mt-1" value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Username</Label>
              <Input className="mt-1" placeholder="unique_username" value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Phone</Label>
              <Input className="mt-1" placeholder="01XXXXXXXXX" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Gender</Label>
              <Input className="mt-1" placeholder="Male / Female / Other" value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth {age !== null && <span className="ml-1 text-foreground/80 normal-case">(Age {age})</span>}</Label>
              <Input type="date" className="mt-1" value={profile.date_of_birth} onChange={(e) => setProfile((p) => ({ ...p, date_of_birth: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Sport</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(["football", "cricket", "basketball"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSportClick(s)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                      profile.sport === s
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {SPORT_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Bio</Label>
            <Textarea className="mt-1 resize-none" rows={3} placeholder="Tell us about yourself..." value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Guardian Contact (if under 18)</Label>
            <Input className="mt-1" placeholder="01XXXXXXXXX" value={profile.guardian_contact} onChange={(e) => setProfile((p) => ({ ...p, guardian_contact: e.target.value }))} />
          </div>
        </motion.div>
      )}

      {/* My Videos — broader, gallery-style */}
      {showVideos && showVideos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-4 sm:p-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {showVideos.map((vid) => (
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

                {/* Bottom overlay */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <p className="text-[11px] text-white line-clamp-2 leading-snug">
                    {vid.description || "No description"}
                  </p>
                </div>

                {/* Status pill (hidden for live) */}
                {vid.status !== "live" && (
                  <Badge
                    className={`absolute top-2 left-2 text-[10px] rounded-full ${
                      vid.status === "pending_payment"
                        ? "bg-amber-500/90 text-white border-transparent"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {vid.status.replace("_", " ")}
                  </Badge>
                )}

                {/* Delete */}
                {onDeleteVideo && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur border border-border text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                        aria-label="Delete video"
                      >
                        {deletingVideoId === vid.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" /> Delete Video?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this video. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteVideo(vid)} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
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
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center z-10"
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

      <AvatarCropDialog
        file={pendingAvatarFile}
        open={cropOpen}
        onOpenChange={(o) => {
          setCropOpen(o);
          if (!o) setPendingAvatarFile(null);
        }}
        onConfirm={handleAvatarUpload}
        preview={{
          fullName: profile.full_name,
          username: profile.username,
          role: role || "player",
          sportLabel: profile.sport ? (SPORT_LABEL[profile.sport] || profile.sport) : undefined,
          stats: ticketStats,
        }}
      />
    </motion.div>
  );
};

export default ProfileTab;
