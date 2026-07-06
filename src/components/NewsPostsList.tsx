import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Megaphone, Calendar, Trophy, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export type NewsPost = {
  id: string;
  title: string;
  body: string;
  tag: string | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
  created_at: string;
};

const tagIcon = (tag: string | null) => {
  const t = (tag || "").toLowerCase();
  if (t.includes("event")) return Calendar;
  if (t.includes("campaign")) return Trophy;
  if (t.includes("announce")) return Megaphone;
  return Newspaper;
};

async function signMedia(url: string | null): Promise<string | null> {
  if (!url) return null;
  // If already a full URL, return as-is; otherwise treat as path within "media" bucket
  if (/^https?:\/\//.test(url)) return url;
  const { data } = await supabase.storage.from("media").createSignedUrl(url, 60 * 60);
  return data?.signedUrl ?? null;
}

interface Props {
  /** If true, show a small "Delete" button on each row (admin home). */
  adminControls?: boolean;
  /** Refresh trigger (bumped after posting) */
  refreshKey?: number;
}

const NewsPostsList = ({ adminControls, refreshKey }: Props) => {
  const [posts, setPosts] = useState<(NewsPost & { resolved_media: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("news_posts" as any)
      .select("id, title, body, tag, media_url, media_type, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(30);
    const rows = ((data as unknown) as NewsPost[]) || [];
    const withMedia = await Promise.all(
      rows.map(async (p) => ({ ...p, resolved_media: await signMedia(p.media_url) })),
    );
    setPosts(withMedia);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // subscribe to news_posts changes so home stays fresh
    const ch = supabase
      .channel("news_posts_home")
      .on("postgres_changes", { event: "*", schema: "public", table: "news_posts" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const remove = async (id: string) => {
    if (!confirm("Delete this news post?")) return;
    const { error } = await supabase.from("news_posts" as any).delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "News post deleted" });
      load();
    }
  };

  if (loading && posts.length === 0) return null;
  if (posts.length === 0) return null;

  return (
    <div className="space-y-3">
      {posts.map((item, i) => {
        const Icon = tagIcon(item.tag);
        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--background) / 0.55) 0%, hsl(var(--teal-deep) / 0.10) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 hsl(var(--teal-deep) / 0.18), 0 8px 24px -18px rgba(20,50,90,0.6)",
            }}
          >
            {item.resolved_media && item.media_type === "image" && (
              <img
                src={item.resolved_media}
                alt={item.title}
                className="w-full max-h-72 object-cover"
                loading="lazy"
              />
            )}
            {item.resolved_media && item.media_type === "video" && (
              <video
                src={item.resolved_media}
                controls
                playsInline
                className="w-full max-h-72 object-cover bg-black"
              />
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/15"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(126,200,255,0.28) 0%, hsl(var(--teal-deep) / 0.20) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.20)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 text-foreground" strokeWidth={2} />
                </div>
                {item.tag && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-white/10 bg-white/5 text-foreground/80 rounded-full backdrop-blur-sm"
                  >
                    {item.tag}
                  </Badge>
                )}
                <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                {adminControls && (
                  <button
                    onClick={() => remove(item.id)}
                    className="ml-1 grid h-7 w-7 place-items-center rounded-full text-destructive hover:bg-destructive/10"
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <h2 className="text-[15px] font-semibold text-foreground leading-snug">{item.title}</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">
                {item.body}
              </p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};

export default NewsPostsList;
