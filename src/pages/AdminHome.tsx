import { motion } from "framer-motion";
import { Loader2, Plus, ArrowRight, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import NewsPostsList from "@/components/NewsPostsList";
import PostNewsDialog from "@/components/PostNewsDialog";

/**
 * Admin home page — mirrors the player feed so admins see what their
 * community sees, plus a floating "Post news" composer that publishes
 * directly to the shared feed.
 */
const AdminHome = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || role !== "admin")) navigate({ to: "/auth" as any });
  }, [user, role, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="px-4 pt-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Admin · Home</p>
          <h1 className="font-display text-2xl text-foreground mt-1">Latest from Cholo Kheli</h1>
        </motion.div>

        <NewsPostsList adminControls refreshKey={refreshKey} />

        <button
          onClick={() => navigate({ to: "/admin/panel" as any })}
          className="mt-4 w-full text-left rounded-3xl text-white p-4 flex items-center justify-between border border-white/15 relative overflow-hidden active:scale-[0.99] transition-transform"
          style={{
            background: "linear-gradient(135deg, #7EC8FF 0%, hsl(var(--teal-deep)) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.35), 0 12px 30px -14px hsl(var(--teal-deep) / 0.7)",
          }}
        >
          <div className="relative flex items-center gap-3">
            <Shield className="h-5 w-5" strokeWidth={2} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/80">Admin tools</p>
              <p className="text-sm font-semibold mt-0.5">Open the admin panel</p>
            </div>
          </div>
          <ArrowRight className="relative h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {/* Floating "Post news" composer */}
      <PostNewsDialog
        onPosted={() => setRefreshKey((k) => k + 1)}
        trigger={
          <button
            aria-label="Post news"
            className="fixed bottom-24 right-4 z-30 grid h-14 w-14 place-items-center rounded-full text-white shadow-xl active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #7EC8FF 0%, hsl(var(--teal-deep)) 100%)",
              boxShadow: "0 12px 32px -8px hsl(var(--teal-deep) / 0.7)",
            }}
          >
            <Plus className="h-6 w-6" strokeWidth={2.4} />
          </button>
        }
      />
    </div>
  );
};

export default AdminHome;
