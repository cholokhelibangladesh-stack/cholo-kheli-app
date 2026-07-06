import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsCard } from "@/components/settings/SettingsControls";

const VerifiedPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"none" | "requested" | "verified">("none");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: req }, { data: prof }] = await Promise.all([
        supabase
          .from("scout_requests")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("username")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      void prof;
      if (req?.status === "approved") setStatus("verified");
      else if (req?.status) setStatus("requested");
      else setStatus("none");
      setLoading(false);
    })();
  }, [user]);

  return (
    <SettingsShell title="Cholo Kheli Verified" description="Show scouts you're the real deal">
      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : status === "verified" ? (
        <SettingsCard>
          <div className="p-6 text-center">
            <BadgeCheck className="mx-auto h-10 w-10 text-[hsl(var(--teal-deep))]" />
            <div className="mt-3 text-[16px] font-semibold">You're verified</div>
            <p className="mx-auto mt-1 max-w-[300px] text-sm text-foreground/60">
              A blue check appears on your profile so scouts know your identity has been reviewed.
            </p>
          </div>
        </SettingsCard>
      ) : status === "requested" ? (
        <SettingsCard>
          <div className="p-6 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-yellow-400" />
            <div className="mt-3 text-[16px] font-semibold">Review in progress</div>
            <p className="mx-auto mt-1 max-w-[300px] text-sm text-foreground/60">
              Our team is reviewing your documents. We'll notify you once a decision is made.
            </p>
          </div>
        </SettingsCard>
      ) : (
        <SettingsCard>
          <div className="p-6 text-center">
            <BadgeCheck className="mx-auto h-10 w-10 text-foreground/35" />
            <div className="mt-3 text-[16px] font-semibold">Get verified</div>
            <p className="mx-auto mt-1 max-w-[300px] text-sm text-foreground/60">
              Verification opens to public players in the next release. You'll be able to submit
              your ID and club letter here.
            </p>
            <span className="mt-4 inline-flex rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-foreground/70">
              Coming soon · Next release
            </span>
          </div>
        </SettingsCard>
      )}
    </SettingsShell>
  );
};

export default VerifiedPage;
