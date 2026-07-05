import { Link } from "@tanstack/react-router";
import SettingsShell from "@/components/settings/SettingsShell";
import { ChevronRight } from "lucide-react";

const AboutPage = () => (
  <SettingsShell title="About" description="Cholo Kheli">
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <div className="text-lg font-semibold tracking-tight">Cholo Kheli</div>
      <div className="mt-1 text-xs text-foreground/55">
        The scouting platform for players & clubs in Bangladesh
      </div>
      <div className="mt-3 text-[11px] text-foreground/40">Version 1.0.0</div>
    </div>
    <div className="mt-5 divide-y divide-white/[0.05] rounded-2xl border border-white/10 bg-white/[0.03]">
      <RowLink to="/mission" label="Our mission" />
      <RowLink to="/safe-scouting" label="Safe scouting" />
      <RowLink to="/privacy-policy" label="Privacy Policy" />
      <RowLink to="/faq" label="FAQ" />
    </div>
  </SettingsShell>
);

const RowLink = ({ to, label }: { to: string; label: string }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03]">
    <span className="flex-1 text-[15px] font-medium">{label}</span>
    <ChevronRight className="h-4 w-4 text-foreground/40" />
  </Link>
);

export default AboutPage;
