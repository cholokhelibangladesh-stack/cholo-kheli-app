import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  SETTINGS_GROUP_ORDER,
  filterCatalogForRole,
  type CatalogItem,
} from "@/components/settings/settingsCatalog";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsRow";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SettingsHub = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);

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

  // Track which group is currently in view for the sticky tab active state.
  useEffect(() => {
    if (grouped.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).dataset.groupId;
          if (id) setActiveGroup(id);
        }
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    grouped.forEach(([g]) => {
      const el = document.getElementById(`settings-group-${slug(g)}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [grouped]);

  // Keep the active tab visible in the horizontal scroller.
  useEffect(() => {
    if (!activeGroup || !tabsRef.current) return;
    const btn = tabsRef.current.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeGroup}"]`,
    );
    if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeGroup]);

  const jumpTo = (group: string) => {
    const el = document.getElementById(`settings-group-${slug(group)}`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 128;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveGroup(group);
  };

  const homeHref =
    role === "scout" ? "/scout/profile" : role === "admin" ? "/admin" : "/player/profile";

  return (
    <div className="min-h-full bg-background pb-24">
      <header
        className="sticky top-0 z-30 backdrop-blur-2xl"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)",
          background:
            "linear-gradient(180deg, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.72) 100%)",
          boxShadow: "inset 0 -1px 0 hsl(var(--teal-deep) / 0.18)",
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-3">
          <button
            type="button"
            onClick={() => navigate({ to: homeHref as any })}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/85 hover:bg-white/[0.06]"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search settings"
              className="w-full rounded-2xl border border-white/12 bg-white/[0.05] py-2.5 pl-9 pr-3 text-sm text-foreground outline-none backdrop-blur-xl placeholder:text-foreground/40 focus:border-white/25"
            />
          </div>
        </div>

        {grouped.length > 1 && !q ? (
          <div
            ref={tabsRef}
            className="scrollbar-none mx-auto flex w-full max-w-3xl gap-1.5 overflow-x-auto px-3 pb-2"
          >
            {grouped.map(([g]) => {
              const active = activeGroup === g;
              return (
                <button
                  key={g}
                  type="button"
                  data-tab-id={g}
                  onClick={() => jumpTo(g)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-[hsl(var(--teal-deep))]/50 bg-[hsl(var(--teal-deep))]/20 text-foreground shadow-inner"
                      : "border-white/10 bg-white/[0.04] text-foreground/70 hover:bg-white/[0.08]"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        ) : null}
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 pt-2 sm:px-6">
        {grouped.map(([groupLabel, items]) => (
          <div
            key={groupLabel}
            id={`settings-group-${slug(groupLabel)}`}
            data-group-id={groupLabel}
            className="scroll-mt-32"
          >
            <SettingsGroup label={groupLabel}>
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
          </div>
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
