import { Link } from "@tanstack/react-router";
import SettingsShell from "@/components/settings/SettingsShell";
import { Shield, Lock, EyeOff, Users, ChevronRight } from "lucide-react";

const links = [
  { to: "/player/settings/privacy", icon: Lock, label: "Account privacy", desc: "Public or private account" },
  { to: "/player/settings/hidden-words", icon: EyeOff, label: "Hidden words", desc: "Filter comments and messages" },
  { to: "/player/settings/blocked", icon: Users, label: "Blocked accounts", desc: "People you've blocked" },
];

const PrivacyCenterPage = () => (
  <SettingsShell title="Privacy Center" description="Everything about your privacy in one place">
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#7EC8FF]/10 to-[hsl(var(--teal-deep))]/10 p-5">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-[hsl(var(--teal-deep))]" />
        <div>
          <div className="text-[15px] font-semibold">Your privacy, your rules</div>
          <p className="text-xs text-foreground/60">Choose who sees your videos, comments, and activity.</p>
        </div>
      </div>
    </div>
    <div className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
      {links.map((l) => (
        <Link key={l.to} to={l.to} className="flex items-center gap-3 p-4 hover:bg-white/5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5"><l.icon className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium">{l.label}</div>
            <div className="truncate text-xs text-foreground/55">{l.desc}</div>
          </div>
          <ChevronRight className="h-4 w-4 text-foreground/40" />
        </Link>
      ))}
    </div>
  </SettingsShell>
);

export default PrivacyCenterPage;
