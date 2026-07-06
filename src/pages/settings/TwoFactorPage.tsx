import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsCard } from "@/components/settings/SettingsControls";

type Factor = { id: string; friendly_name?: string | null; factor_type: string; status: string };

const inputClass =
  "w-full rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.5em] text-foreground outline-none backdrop-blur-md focus:border-white/25";

const TwoFactorPage = () => {
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [pending, setPending] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const refresh = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast.error("Couldn't load two-step verification", { description: error.message });
      setLoading(false);
      return;
    }
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const startEnroll = async () => {
    setEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toLocaleDateString()}`,
    });
    setEnrolling(false);
    if (error) {
      toast.error("Couldn't start enrollment", { description: error.message });
      return;
    }
    setPending({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async () => {
    if (!pending) return;
    if (code.length < 6) {
      toast.error("Enter the 6-digit code from your app");
      return;
    }
    setVerifying(true);
    const { data: chal, error: challErr } = await supabase.auth.mfa.challenge({ factorId: pending.id });
    if (challErr || !chal) {
      setVerifying(false);
      toast.error("Couldn't create challenge", { description: challErr?.message });
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: pending.id,
      challengeId: chal.id,
      code,
    });
    setVerifying(false);
    if (error) {
      toast.error("Invalid code — try again");
      return;
    }
    toast.success("Two-step verification enabled");
    setPending(null);
    setCode("");
    refresh();
  };

  const cancelEnroll = async () => {
    if (!pending) return;
    await supabase.auth.mfa.unenroll({ factorId: pending.id });
    setPending(null);
    setCode("");
  };

  const removeFactor = async (id: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) {
      toast.error("Couldn't remove factor", { description: error.message });
      return;
    }
    toast.success("Two-step verification removed");
    refresh();
  };

  return (
    <SettingsShell title="Two-step verification" description="Extra sign-in security via an authenticator app">
      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : pending ? (
        <>
          <SettingsCard>
            <div className="p-5 text-center">
              <div className="text-[15px] font-semibold">Scan this QR in your authenticator app</div>
              <p className="mt-1 text-xs text-foreground/60">
                Google Authenticator, 1Password, Authy — any TOTP app works.
              </p>
              <div
                className="mx-auto mt-4 inline-block rounded-2xl border border-white/10 bg-white p-3"
                dangerouslySetInnerHTML={{ __html: pending.qr }}
              />
              <div className="mt-3 text-[11px] text-foreground/55">
                Or enter this key manually:{" "}
                <span className="font-mono text-foreground/85">{pending.secret}</span>
              </div>
            </div>
          </SettingsCard>

          <div className="mt-4">
            <SettingsCard>
              <div className="space-y-3 p-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55">
                    6-digit code
                  </span>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className={inputClass}
                    placeholder="000000"
                    autoFocus
                  />
                </label>
              </div>
            </SettingsCard>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={cancelEnroll}
              className="flex-1 rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-[15px] font-medium text-foreground/80"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={verify}
              disabled={code.length < 6 || verifying}
              className="flex-1 rounded-xl bg-[hsl(var(--teal-deep))] py-2.5 text-[15px] font-semibold text-white disabled:opacity-40"
            >
              {verifying ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying
                </span>
              ) : (
                "Verify and enable"
              )}
            </button>
          </div>
        </>
      ) : factors.length === 0 ? (
        <SettingsCard>
          <div className="p-6 text-center">
            <ShieldOff className="mx-auto h-10 w-10 text-foreground/40" />
            <div className="mt-3 text-[16px] font-semibold">Not enabled</div>
            <p className="mx-auto mt-1 max-w-[300px] text-sm text-foreground/60">
              Add an authenticator app so we can ask for a code when you sign in from a new device.
            </p>
            <button
              type="button"
              onClick={startEnroll}
              disabled={enrolling}
              className="mt-4 rounded-xl bg-[hsl(var(--teal-deep))] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {enrolling ? "Preparing…" : "Set up authenticator"}
            </button>
          </div>
        </SettingsCard>
      ) : (
        <>
          <SettingsCard>
            <div className="flex items-center gap-3 p-4">
              <ShieldCheck className="h-5 w-5 text-[hsl(var(--teal-deep))]" />
              <div className="text-sm">
                <div className="font-medium">Two-step verification is on</div>
                <div className="text-xs text-foreground/60">
                  You'll need a code from your authenticator when signing in.
                </div>
              </div>
            </div>
          </SettingsCard>

          <div className="mt-4">
            <SettingsCard>
              {factors.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-medium">
                      {f.friendly_name || "Authenticator"}
                    </div>
                    <div className="text-xs text-foreground/55 uppercase tracking-wide">
                      {f.factor_type} · {f.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFactor(f.id)}
                    className="grid h-9 w-9 place-items-center rounded-full text-[hsl(var(--destructive))] hover:bg-white/[0.06]"
                    aria-label="Remove factor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </SettingsCard>
          </div>
        </>
      )}
    </SettingsShell>
  );
};

export default TwoFactorPage;
