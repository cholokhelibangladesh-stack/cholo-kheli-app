import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ChevronRight, ChevronLeft, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SETTINGS_CATALOG, SETTINGS_GROUP_ORDER } from "@/components/settings/settingsCatalog";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsRow";

const SettingsHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return SETTINGS_CATALOG;
    return SETTINGS_CATALOG.filter(
      (i) =>
        i.label.toLowerCase().includes(term) ||
        (i.keywords ?? "").toLowerCase().includes(term) ||
        i.group.toLowerCase().includes(term),
    );
  }, [q]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof SETTINGS_CATALOG>();
    for (const g of SETTINGS_GROUP_ORDER) map.set(g, []);
    for (const item of filtered) {
      const arr = map.get(item.group) ?? [];
      arr.push(item);
      map.set(item.group, arr);
    }
    return Array.from(map.entries()).filter(([, arr]) => arr.length > 0);
  }, [filtered]);

  return (
    <div className="min-h-full bg-background pb-24">
      <header
        className="sticky top-0 z-20 flex items-center gap-2 px-3 py-3 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0.7) 100%)",
          borderBottom: "1px solid hsl(var(--border) / 0.4)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/player/profile" })}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:bg-white/5"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Settings and activity</h1>
      </header>

      <div className="px-4 pt-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:border-white/20"
          />
        </div>

        {/* Your account (Accounts Center) */}
        {!q && (
          <div className="pt-5">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
                Your account
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-foreground/70">
                CHOLO KHELI
              </span>
            </div>
            <Link
              to="/player/settings/accounts-center"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 hover:bg-white/[0.05]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#7EC8FF] to-[hsl(var(--teal-deep))] text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold">Accounts Center</div>
                <div className="mt-0.5 line-clamp-2 text-xs text-foreground/55">
                  Password, security, personal details, connected experiences
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground/40" />
            </Link>
          </div>
        )}

        {/* Grouped rows */}
        {grouped.map(([groupLabel, items]) => (
          <SettingsGroup key={groupLabel} label={groupLabel}>
            {items.map((item) => (
              <SettingsRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                to={item.to}
                tint={item.tint}
              />
            ))}
          </SettingsGroup>
        ))}

        {grouped.length === 0 && (
          <div className="mt-10 text-center text-sm text-foreground/50">
            No settings match "{q}".
          </div>
        )}

        <div className="pb-6 pt-8 text-center text-[10px] text-foreground/35">
          Signed in as {user?.email}
        </div>
      </div>
    </div>
  );
};

export default SettingsHub;
