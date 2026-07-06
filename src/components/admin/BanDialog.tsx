import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, Loader2 } from "lucide-react";

type Scope = "profile" | "scout";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetUserId: string;
  targetName: string;
  scope: Scope;
  onDone?: () => void;
}

const DURATIONS = [
  { value: "1", label: "1 hour" },
  { value: "24", label: "24 hours" },
  { value: "168", label: "7 days" },
  { value: "720", label: "30 days" },
  { value: "permanent", label: "Permanent" },
];

const BanDialog = ({ open, onOpenChange, targetUserId, targetName, scope, onDone }: Props) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("24");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!message.trim()) {
      toast({ title: "Message required", description: "Explain to the user why they're being banned.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const hours = duration === "permanent" ? null : parseInt(duration, 10);
    const { error } = await (supabase as any).rpc("admin_set_ban", {
      _target_user: targetUserId,
      _scope: scope,
      _banned: true,
      _reason: reason.trim() || null,
      _message: message.trim(),
      _duration_hours: hours,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Ban failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `${targetName} banned`, description: hours ? `Expires in ${hours}h` : "Permanent ban" });
    onOpenChange(false);
    setReason(""); setMessage(""); setDuration("24");
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="h-4 w-4" /> Ban {targetName}
          </DialogTitle>
          <DialogDescription>
            The user will be signed out and see your message when they try to sign back in.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground/70">Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DURATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70">Internal reason (optional)</label>
            <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Repeated harassment reports" maxLength={200} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70">Message to the user *</label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Your account has been suspended for violating our community guidelines..."
              maxLength={1000}
              rows={4}
              className="mt-1"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{message.length}/1000 — shown to the banned user.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button variant="destructive" onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ban user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BanDialog;
