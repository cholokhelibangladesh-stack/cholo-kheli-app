import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/SettingsShell";
import { Button } from "@/components/ui/button";
import { Loader2, History, RotateCcw } from "lucide-react";

type Video = {
  id: string;
  video_url: string;
  description: string | null;
  created_at: string;
};

const ArchivePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("videos")
      .select("id, video_url, description, created_at")
      .eq("user_id", user.id)
      .eq("archived", true)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setVideos((data ?? []) as Video[]);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unarchive = async (id: string) => {
    const { error } = await supabase
      .from("videos")
      .update({ archived: false })
      .eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setVideos((v) => v.filter((x) => x.id !== id));
    toast({ title: "Moved back to your profile" });
  };

  return (
    <SettingsShell title="Archive" description="Uploads hidden from your profile">
      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <History className="mx-auto h-8 w-8 text-foreground/40" />
          <div className="mt-3 text-[15px] font-semibold">No archived uploads</div>
          <p className="mt-1 text-xs text-foreground/55">
            Archive videos to hide them from your profile without deleting.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {videos.map((v) => (
            <div
              key={v.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative aspect-[9/16] bg-black/40">
                <video
                  src={v.video_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-2">
                <div className="line-clamp-2 text-xs text-foreground/70">
                  {v.description ?? "Untitled"}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => unarchive(v.id)}
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  Unarchive
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsShell>
  );
};

export default ArchivePage;
