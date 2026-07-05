import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@tanstack/react-router";
import SettingsShell from "@/components/settings/SettingsShell";
import { Button } from "@/components/ui/button";
import { Archive, Download, ChevronRight, Loader2 } from "lucide-react";

const DownloadsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);

  const requestData = async () => {
    if (!user) return;
    setRequesting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: user.user_metadata?.full_name ?? user.email ?? "Player",
      email: user.email ?? "unknown@cholokheli.app",
      subject: "Data download request",
      message: `Please prepare a download of my account data. User id: ${user.id}`,
    });
    setRequesting(false);
    if (error) toast({ title: "Could not request", description: error.message, variant: "destructive" });
    else toast({ title: "Request submitted", description: "We'll email you when your download is ready." });
  };

  return (
    <SettingsShell title="Archiving and downloading" description="Keep a copy of what you share">
      <Link to="/player/settings/archive" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><Archive className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium">Archive</div>
          <div className="text-xs text-foreground/55">Hide videos from your profile without deleting them.</div>
        </div>
        <ChevronRight className="h-4 w-4 text-foreground/40" />
      </Link>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><Download className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium">Download your data</div>
            <div className="text-xs text-foreground/55">Get a copy of your profile, videos and activity.</div>
          </div>
        </div>
        <Button onClick={requestData} disabled={requesting || !user} className="mt-3 w-full">
          {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request download"}
        </Button>
      </div>
    </SettingsShell>
  );
};

export default DownloadsPage;
