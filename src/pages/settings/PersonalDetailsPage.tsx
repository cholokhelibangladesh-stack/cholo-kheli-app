import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SettingsShell from "@/components/settings/SettingsShell";
import { SettingsCard } from "@/components/settings/SettingsControls";

const inputClass =
  "w-full rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-[15px] text-foreground outline-none backdrop-blur-md placeholder:text-foreground/40 focus:border-white/25 disabled:opacity-60";

const splitName = (full: string | null | undefined) => {
  const s = (full ?? "").trim();
  if (!s) return { first: "", last: "" };
  const parts = s.split(/\s+/);
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

const PersonalDetailsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [initial, setInitial] = useState({ first: "", last: "", dob: "", phone: "" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, date_of_birth, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      const { first: f, last: l } = splitName(data?.full_name);
      const next = {
        first: f,
        last: l,
        dob: data?.date_of_birth ?? "",
        phone: data?.phone ?? "",
      };
      setFirst(next.first);
      setLast(next.last);
      setDob(next.dob);
      setPhone(next.phone);
      setInitial(next);
      setLoading(false);
    })();
  }, [user]);

  const dirty =
    first !== initial.first ||
    last !== initial.last ||
    dob !== initial.dob ||
    phone !== initial.phone;

  const reset = () => {
    setFirst(initial.first);
    setLast(initial.last);
    setDob(initial.dob);
    setPhone(initial.phone);
  };

  const save = async () => {
    if (!user) return;
    const trimmedFirst = first.trim();
    const trimmedLast = last.trim();
    if (!trimmedFirst) {
      toast.error("First name is required");
      return;
    }
    setSaving(true);
    const full_name = [trimmedFirst, trimmedLast].filter(Boolean).join(" ");
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        date_of_birth: dob || null,
        phone: phone.trim() || null,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save your details", { description: error.message });
      return;
    }
    setInitial({ first: trimmedFirst, last: trimmedLast, dob, phone: phone.trim() });
    toast.success("Personal details updated");
  };

  return (
    <SettingsShell
      title="Personal details"
      description="Your name, contact, and date of birth"
    >
      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <SettingsCard>
            <div className="space-y-3 p-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55">
                  Email
                </span>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className={inputClass}
                />
                <span className="mt-1 block text-[11px] text-foreground/45">
                  Contact support to change the email on your account.
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55">
                    First name
                  </span>
                  <input
                    type="text"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    placeholder="First name"
                    className={inputClass}
                    autoComplete="given-name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55">
                    Last name
                  </span>
                  <input
                    type="text"
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    placeholder="Last name"
                    className={inputClass}
                    autoComplete="family-name"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55">
                    Date of birth
                  </span>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={inputClass}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/55">
                    Phone number
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className={inputClass}
                    autoComplete="tel"
                  />
                </label>
              </div>
            </div>
          </SettingsCard>

          <div className="sticky bottom-4 z-10 mt-4 flex gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={!dirty || saving}
              className="flex-1 rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-[15px] font-medium text-foreground/80 backdrop-blur-md transition disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="flex-1 rounded-xl bg-[hsl(var(--teal-deep))] py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-[hsl(var(--teal-deep))]/25 transition disabled:opacity-40"
            >
              {saving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" /> Save changes
                </span>
              )}
            </button>
          </div>
        </>
      )}
    </SettingsShell>
  );
};

export default PersonalDetailsPage;
