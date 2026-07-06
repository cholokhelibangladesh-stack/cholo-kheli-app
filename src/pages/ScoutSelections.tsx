import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, User, Calendar, Phone, CheckCircle2, Clock, XCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { safeMediaUrl } from "@/lib/sanitize";

interface ScoutRequest {
  id: string;
  player_id: string;
  status: string;
  notes: string | null;
  admin_response: string | null;
  created_at: string;
  player_name?: string;
  player_avatar?: string;
  player_details?: any;
}

const statusMeta = (status: string) => {
  if (status === "approved")
    return {
      label: "Approved",
      Icon: CheckCircle2,
      className: "bg-primary/20 text-primary border-primary/30",
    };
  if (status === "rejected")
    return {
      label: "Declined",
      Icon: XCircle,
      className: "bg-destructive/20 text-destructive border-destructive/30",
    };
  return {
    label: "Pending",
    Icon: Clock,
    className: "bg-white/10 text-foreground/80 border-white/15",
  };
};

const ScoutSelections = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ScoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth?role=scout" as any });
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const { data: reqs } = await supabase
        .from("scout_requests")
        .select("*")
        .eq("scout_id", user.id)
        .order("created_at", { ascending: false });

      const rawReqs = (reqs || []) as ScoutRequest[];
      const playerIds = [...new Set(rawReqs.map((r) => r.player_id))];

      const profileMap = new Map<string, { name: string; avatar: string }>();
      if (playerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", playerIds);
        (profiles || []).forEach((p) =>
          profileMap.set(p.user_id, { name: p.full_name || "Unknown", avatar: p.avatar_url || "" }),
        );
      }

      const approvedReqs = rawReqs.filter((r) => r.status === "approved");
      const detailsMap = new Map<string, any>();
      if (approvedReqs.length > 0) {
        const { data: notifs } = await supabase
          .from("notifications")
          .select("metadata")
          .eq("user_id", user.id)
          .eq("type", "selection")
          .order("created_at", { ascending: false });
        (notifs || []).forEach((n: any) => {
          if (n.metadata?.player_id) detailsMap.set(n.metadata.player_id, n.metadata);
        });
      }

      setRequests(
        rawReqs.map((r) => ({
          ...r,
          player_name: profileMap.get(r.player_id)?.name || "Unknown",
          player_avatar: profileMap.get(r.player_id)?.avatar || "",
          player_details: detailsMap.get(r.player_id) || null,
        })),
      );
      setLoading(false);
    };
    fetchRequests();
  }, [user]);

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen pt-16 pb-24">
      <div className="container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <div className="mb-5">
            <h1 className="font-display text-3xl text-foreground">SELECTIONS</h1>
            <p className="text-sm text-muted-foreground">
              Your player requests and the admin's response
            </p>
          </div>

          {requests.length === 0 ? (
            <div
              className="rounded-3xl border border-white/10 backdrop-blur-xl p-8 text-center"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--background) / 0.55) 0%, hsl(var(--teal-deep) / 0.10) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px -18px rgba(20,50,90,0.6)",
              }}
            >
              <p className="text-sm text-muted-foreground">
                No selections yet. Head to Explore and request details on players you like.
              </p>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/scout/explore" as any })}
                className="mt-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Go to Explore
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => {
                const meta = statusMeta(r.status);
                const StatusIcon = meta.Icon;
                const open = expandedRequest === r.id;
                return (
                  <motion.div
                    key={r.id}
                    layout
                    className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--background) / 0.55) 0%, hsl(var(--teal-deep) / 0.08) 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px -18px rgba(20,50,90,0.6)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedRequest(open ? null : r.id)}
                      className="w-full p-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-white/10 shrink-0">
                        {r.player_avatar ? (
                          <img
                            src={safeMediaUrl(r.player_avatar)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                            {r.player_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{r.player_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {new Date(r.created_at).toLocaleDateString()}
                          {r.notes ? ` • ${r.notes}` : ""}
                        </p>
                      </div>
                      <Badge
                        className={`rounded-full text-[11px] flex items-center gap-1 ${meta.className}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/10 overflow-hidden"
                        >
                          <div className="p-4 space-y-3 bg-white/[0.02]">
                            {r.status === "approved" && r.player_details ? (
                              <>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">
                                  Player details (forwarded by admin)
                                </p>
                                <div className="flex items-center gap-3">
                                  {r.player_details.avatar_url && (
                                    <img
                                      src={safeMediaUrl(r.player_details.avatar_url)}
                                      alt=""
                                      loading="lazy"
                                      decoding="async"
                                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                                    />
                                  )}
                                  <div>
                                    <p className="font-semibold text-foreground text-sm">
                                      {r.player_details.player_name || r.player_name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground capitalize">
                                      {r.player_details.sport}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  {r.player_details.gender && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <User className="h-3 w-3 text-primary" /> {r.player_details.gender}
                                    </div>
                                  )}
                                  {r.player_details.dob && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Calendar className="h-3 w-3 text-primary" />{" "}
                                      {new Date(r.player_details.dob).toLocaleDateString()}
                                    </div>
                                  )}
                                  {r.player_details.guardian && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="h-3 w-3 text-primary" /> Guardian:{" "}
                                      {r.player_details.guardian}
                                    </div>
                                  )}
                                  {r.player_details.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="h-3 w-3 text-primary" /> {r.player_details.phone}
                                    </div>
                                  )}
                                </div>
                                {r.player_details.bio && (
                                  <p className="text-sm text-muted-foreground italic">
                                    "{r.player_details.bio}"
                                  </p>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    navigate({ to: `/resume/${r.player_id}` as any })
                                  }
                                  className="text-primary border-primary/30 rounded-full text-xs"
                                >
                                  View full profile →
                                </Button>
                              </>
                            ) : r.status === "pending" ? (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                Awaiting admin review. Details will appear here once approved.
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                This request was not approved by the admin.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ScoutSelections;
