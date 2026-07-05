import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SettingsShell from "@/components/settings/SettingsShell";
import { Loader2, Receipt } from "lucide-react";

type Payment = { id: string; amount: number; status: string; transaction_id: string | null; created_at: string };

const OrdersPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Payment[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setRows((data as Payment[]) ?? []);
    })();
  }, [user]);

  if (!rows) return <SettingsShell title="Orders and payments"><div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin" /></div></SettingsShell>;

  return (
    <SettingsShell title="Orders and payments" description="Your purchase history">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <Receipt className="mx-auto h-6 w-6 text-foreground/40" />
          <div className="mt-2 text-[15px] font-semibold">No orders yet</div>
          <p className="mt-1 text-xs text-foreground/55">Payments and subscriptions will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
          {rows.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="text-[15px] font-medium tabular-nums">${Number(p.amount).toFixed(2)}</div>
                <div className="truncate text-xs text-foreground/55">{new Date(p.created_at).toLocaleDateString()} · {p.transaction_id ?? "—"}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${p.status === "succeeded" ? "bg-emerald-500/15 text-emerald-300" : p.status === "pending" ? "bg-amber-500/15 text-amber-300" : "bg-white/10 text-foreground/60"}`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </SettingsShell>
  );
};

export default OrdersPage;
