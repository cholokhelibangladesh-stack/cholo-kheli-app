import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  SETTINGS_GROUP_ORDER,
  filterCatalogForRole,
  type CatalogItem,
} from "@/components/settings/settingsCatalog";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsRow";

const SettingsHub = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const catalog = useMemo(() => filterCatalogForRole(role as any), [role]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return catalog;
    return catalog.filter(
      (i) =>
        i.label.toLowerCase().includes(term) ||
        (i.keywords ?? "").toLowerCase().includes(term) ||
        i.group.toLowerCase().includes(term),
    );
  }, [q, catalog]);

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogItem[]>();
    for (const g of SETTINGS_GROUP_ORDER) map.set(g, []);
    for (const item of filtered) {
      const arr = map.get(item.group) ?? [];
      arr.push(item);
      map.set(item.group, arr);
    }
    return Array.from(map.entries()).filter(([, arr]) => arr.length > 0);
  }, [filtered]);

  const homeHref =
    role === "scout" ? "/scout/profile" : role === "admin" ? "/admin" : "/player/profile";

  return (
    <div className="min-h-full bg-background pb-24">
      <header
        className="sticky top-0 z-20 flex items-center gap-2 px-3 py-3 backdrop-blur-2xl"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--background) / 0.9) 0%, hsl(var(--background) / 0.6) 100%)",
          boxShadow: "inset 0 -1px 0 hsl(var(--teal-deep) / 0.18)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: homeHref as any })}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground/85 hover:bg-white/[0.06]"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      </header>

      <div className="mx-auto max-w-[430px] px-4 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search settings"
            className="w-full rounded-2xl border border-white/12 bg-white/[0.05] py-2.5 pl-9 pr-3 text-sm text-foreground outline-none backdrop-blur-xl placeholder:text-foreground/40 focus:border-white/25"
          />
        </div>

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

        <div className="pb-6 pt-10 text-center text-[10px] text-foreground/35">
          Signed in as {user?.email}
        </div>
      </div>
    </div>
  );
};

export default SettingsHub;
