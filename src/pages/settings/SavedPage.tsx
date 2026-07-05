import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Button } from "@/components/ui/button";
import { Loader2, Bookmark } from "lucide-react";

type Video = {
  id: string;
  video_url: string;
  description: string | null;
  created_at: string;
};

const SavedPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("saved_videos")
      .select("video_id, created_at, videos:video_id (id, video_url, description, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setVideos(
      (data ?? [])
        .map((r: any) => r.videos)
        .filter(Boolean) as Video[],
    );
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unsave = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("saved_videos")
      .delete()
      .eq("user_id", user.id)
      .eq("video_id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setVideos((v) => v.filter((x) => x.id !== id));
  };

  return (
    <SettingsShell title="Saved" description="Videos you've bookmarked">
      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-foreground/40" />
          <div className="mt-3 text-[15px] font-semibold">No saved videos yet</div>
          <p className="mt-1 text-xs text-foreground/55">
            Tap the bookmark on any video and it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {videos.map((v) => (
            <div key={v.id} className="relative aspect-[9/16] overflow-hidden rounded-md bg-black/40">
              <video
                src={v.video_url}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => unsave(v.id)}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur"
                aria-label="Remove from saved"
              >
                <Bookmark className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
      {videos.length > 0 && (
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={refresh}>
            Refresh
          </Button>
        </div>
      )}
    </SettingsShell>
  );
};

export default SavedPage;
