import { motion } from "framer-motion";
import { Loader2, Newspaper, Calendar, Megaphone, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import NewsPostsList from "@/components/NewsPostsList";
import DragScroller from "@/components/DragScroller";

type FeedItem = {
  id: string;
  kind: "news" | "event" | "campaign" | "announcement";
  title: string;
  body: string;
  date: string;
  tag?: string;
};

// Static seed content — will be wired to a backend `home_feed` table later.
// Kept intentionally small and evergreen so nothing looks stale.
const FEED: FeedItem[] = [
  {
    id: "welcome",
    kind: "announcement",
    title: "Welcome to Cholo Kheli",
    body: "Upload your highlight, get discovered by verified scouts across Bangladesh.",
    date: "Today",
    tag: "New",
  },
  {
    id: "camp-dhaka",
    kind: "event",
    title: "Dhaka Open Trials — Football U-19",
    body: "Trials open at Bangabandhu National Stadium. Registration closes Friday.",
    date: "This week",
    tag: "Event",
  },
  {
    id: "campaign-cricket",
    kind: "campaign",
    title: "Cricket Rising Stars",
    body: "Top 10 uploads this month get featured to premier league scouts.",
    date: "Ongoing",
    tag: "Campaign",
  },
  {
    id: "news-nrk",
    kind: "news",
    title: "Nahroor Rahman Khan on the future of BD sports",
    body: "Our co-founder talks digital scouting and grassroots talent pipelines.",
    date: "Recent",
    tag: "News",
  },
];

const kindIcon = (k: FeedItem["kind"]) => {
  switch (k) {
    case "news": return Newspaper;
    case "event": return Calendar;
    case "campaign": return Trophy;
    case "announcement": return Megaphone;
  }
};

const PlayerHome = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" as any });
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stories = FEED.filter((f) => f.kind === "event" || f.kind === "campaign");

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-4">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Home
          </p>
          <h1 className="font-display text-2xl text-foreground mt-1">
            Latest from Cholo Kheli
          </h1>
        </motion.div>

        {/* Highlights rail */}
        {stories.length > 0 && (
          <DragScroller className="-mx-4 mb-6">
            <div className="flex gap-3 px-4">
              {stories.map((s) => {
                const Icon = kindIcon(s.kind);
                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -2 }}
                    className="min-w-[230px] max-w-[230px] relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl p-4 flex flex-col justify-between"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(126,200,255,0.16) 0%, hsl(var(--teal-deep) / 0.14) 55%, rgba(126,200,255,0.06) 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 hsl(var(--teal-deep) / 0.25), 0 10px 30px -18px hsl(var(--teal-deep) / 0.6)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-14 -right-10 h-32 w-32 rounded-full opacity-60 blur-2xl"
                      style={{ background: "radial-gradient(circle, #7EC8FF 0%, transparent 70%)" }}
                    />
                    <div className="relative flex items-center gap-2 mb-4">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center border border-white/15"
                        style={{
                          background:
                            "linear-gradient(135deg, #7EC8FF 0%, hsl(var(--teal-deep)) 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
                        }}
                      >
                        <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/70 font-semibold">
                        {s.tag}
                      </span>
                    </div>
                    <div className="relative">
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-2">{s.date}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feed */}
        {/* Admin-posted news (live from DB) */}
        <NewsPostsList />

        {/* Feed */}
        <div className="space-y-3 mt-3">
          {FEED.map((item, i) => {
            const Icon = kindIcon(item.kind);
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -1 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--background) / 0.55) 0%, hsl(var(--teal-deep) / 0.10) 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 hsl(var(--teal-deep) / 0.18), 0 8px 24px -18px rgba(20,50,90,0.6)",
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -left-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
                  style={{ background: "radial-gradient(circle, #7EC8FF 0%, transparent 70%)" }}
                />
                <div className="relative flex items-center gap-2 mb-2">
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
                    {item.date}
                  </span>
                </div>
                <h2 className="relative text-[15px] font-semibold text-foreground leading-snug">
                  {item.title}
                </h2>
                <p className="relative text-sm text-muted-foreground mt-1 leading-relaxed">
                  {item.body}
                </p>
              </motion.article>
            );
          })}

          {/* CTA card */}
          <button
            onClick={() => navigate({ to: "/player/upload" as any })}
            className="w-full text-left rounded-3xl text-white p-4 flex items-center justify-between border border-white/15 relative overflow-hidden active:scale-[0.99] transition-transform"
            style={{
              background:
                "linear-gradient(135deg, #7EC8FF 0%, hsl(var(--teal-deep)) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.35), 0 12px 30px -14px hsl(var(--teal-deep) / 0.7)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 blur-2xl bg-white"
            />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/80">
                Your next step
              </p>
              <p className="text-sm font-semibold mt-1">Upload a new highlight</p>
            </div>
            <ArrowRight className="relative h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerHome;
