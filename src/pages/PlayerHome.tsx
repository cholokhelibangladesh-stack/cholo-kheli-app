import { motion } from "framer-motion";
import { Loader2, Newspaper, Calendar, Megaphone, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";

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
          <div className="-mx-4 mb-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 px-4">
              {stories.map((s) => {
                const Icon = kindIcon(s.kind);
                return (
                  <div
                    key={s.id}
                    className="min-w-[220px] max-w-[220px] rounded-2xl border border-border/60 bg-card p-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--teal-deep)/0.12)] flex items-center justify-center">
                        <Icon className="h-4 w-4 text-[hsl(var(--teal-deep))]" strokeWidth={1.75} />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {s.tag}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {s.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2">{s.date}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-3">
          {FEED.map((item, i) => {
            const Icon = kindIcon(item.kind);
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border/60 bg-card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-foreground/80" strokeWidth={1.75} />
                  </div>
                  {item.tag && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border text-muted-foreground rounded-full"
                    >
                      {item.tag}
                    </Badge>
                  )}
                  <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {item.date}
                  </span>
                </div>
                <h2 className="text-[15px] font-semibold text-foreground leading-snug">
                  {item.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {item.body}
                </p>
              </motion.article>
            );
          })}

          {/* CTA card */}
          <button
            onClick={() => navigate({ to: "/player/upload" as any })}
            className="w-full text-left rounded-2xl bg-[hsl(var(--teal-deep))] text-white p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/70">
                Your next step
              </p>
              <p className="text-sm font-semibold mt-1">Upload a new highlight</p>
            </div>
            <ArrowRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerHome;
