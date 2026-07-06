import { useEffect, useState } from "react";
import { DollarSign, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/** Editable per-video upload price (BDT), stored in app_settings. */
const UploadPriceControl = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [price, setPrice] = useState<string>("");
  const [initial, setInitial] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings" as any)
        .select("value")
        .eq("key", "video_upload_price_bdt")
        .maybeSingle();
      const v = ((data as any)?.value ?? "100").toString();
      setPrice(v);
      setInitial(v);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    const n = Number(price);
    if (!Number.isFinite(n) || n < 0) {
      toast({ title: "Invalid price", description: "Enter a non-negative number.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("app_settings" as any)
      .upsert({ key: "video_upload_price_bdt", value: String(n), updated_by: user?.id } as any, {
        onConflict: "key",
      });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setInitial(price);
      toast({ title: "Upload price updated", description: `New price: ৳${n} per video` });
    }
  };

  return (
    <div className="apple-glass glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <DollarSign className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-display text-xl text-foreground">UPLOAD PRICE</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Amount (in BDT) each player is charged to publish a video.
          </p>
        </div>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Price (৳)</Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={loading ? "" : price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading || saving}
            className="mt-1 bg-secondary border-border rounded-xl"
          />
        </div>
        <Button
          onClick={save}
          disabled={loading || saving || price === initial}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          Save
        </Button>
      </div>
    </div>
  );
};

export default UploadPriceControl;
