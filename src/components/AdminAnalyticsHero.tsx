import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Users, ShieldCheck, DollarSign } from "lucide-react";

interface Stats {
  totalPlayers: number;
  totalScouts: number;
  activeScouts: number;
  pendingScouts: number;
  liveVideos: number;
  totalRevenue: number;
  flaggedMessages: number;
  pendingRequests: number;
  unreadContacts: number;
  openAlerts: number;
}

interface Props {
  stats: Stats;
  /** created_at values (ISO) for revenue-generating events (paid videos). */
  revenueTimeline?: string[];
}

const TEAL = "hsl(var(--teal-deep))";
const TEAL_MID = "hsl(var(--teal))";
const CANDY = "hsl(var(--candy))";

/**
 * Analytics hero row for the admin panel — mirrors the "Analytic Sports
 * Commander" design direction: deep teal gradient hero KPI, candy-blue frost
 * KPI, plain white KPI, then a bar chart + donut side by side. Works in both
 * light and dark mode via theme tokens.
 */
const AdminAnalyticsHero = ({ stats, revenueTimeline = [] }: Props) => {
  // Bucket revenue events by the last 6 calendar months.
  const bars = useMemo(() => {
    const now = new Date();
    const months: { label: string; key: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString(undefined, { month: "short" }),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        value: 0,
      });
    }
    for (const iso of revenueTimeline) {
      const d = new Date(iso);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const row = months.find((m) => m.key === key);
      if (row) row.value += 1;
    }
    // Ensure the chart has visible geometry even with zero data.
    const max = Math.max(...months.map((m) => m.value), 1);
    return months.map((m) => ({ ...m, pct: (m.value / max) * 100 }));
  }, [revenueTimeline]);

  const donutData = useMemo(
    () => [
      { name: "Players", value: Math.max(stats.totalPlayers, 0) },
      { name: "Scouts", value: Math.max(stats.totalScouts, 0) },
    ],
    [stats.totalPlayers, stats.totalScouts],
  );
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0) || 1;
  const playerPct = Math.round((donutData[0].value / donutTotal) * 100);

  return (
    <div className="space-y-4 mb-5">
      {/* KPI row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
      >
        {/* Gradient hero KPI */}
        <div
          className="relative overflow-hidden p-5 rounded-3xl text-white border border-white/15 dark:border-white/10"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--teal-deep)) 0%, hsl(var(--teal)) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.22), 0 18px 40px -22px hsl(var(--teal-deep) / 0.75)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -bottom-8 h-32 w-32 rounded-full opacity-50 blur-3xl"
            style={{ background: CANDY }}
          />
          <div className="relative flex items-center gap-2 mb-1">
            <Users className="h-4 w-4" style={{ color: CANDY }} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: CANDY }}>
              Active talent
            </p>
          </div>
          <h3 className="relative text-3xl font-bold tracking-tight">
            {stats.totalPlayers.toLocaleString()}
          </h3>
          <div className="relative mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 px-2 py-1 rounded-md">
            <TrendingUp className="h-3 w-3" style={{ color: CANDY }} />
            <span style={{ color: CANDY }}>Live</span>
            <span className="text-white/80">players registered</span>
          </div>
        </div>

        {/* Frost KPI */}
        <div
          className="relative overflow-hidden p-5 rounded-3xl border backdrop-blur-md bg-card/60 dark:bg-card/40"
          style={{
            backgroundImage:
              "linear-gradient(135deg, hsl(var(--teal-deep) / 0.10) 0%, hsl(var(--candy) / 0.14) 100%)",
            borderColor: "hsl(var(--teal) / 0.28)",
            boxShadow: "inset 0 1px 0 hsl(var(--candy) / 0.18)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-foreground/70" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Pending verifications
            </p>
          </div>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">
            {stats.pendingScouts + stats.pendingRequests}
          </h3>
          <p className="mt-3 text-xs text-muted-foreground">
            {stats.pendingScouts} scouts · {stats.pendingRequests} requests
          </p>
        </div>

        {/* Plain white KPI */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-foreground/70" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Revenue (all‑time)
            </p>
          </div>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">
            ৳{stats.totalRevenue.toLocaleString()}
          </h3>
          <div className="mt-3 w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                background: `linear-gradient(90deg, ${CANDY} 0%, ${TEAL} 100%)`,
                width: `${Math.min(100, Math.max(6, (stats.totalRevenue % 1000) / 10))}%`,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Charts row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4"
      >
        {/* Bar chart */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-foreground">Revenue activity</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Paid uploads · last 6 months</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
              6M
            </span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {bars.map((b, i) => (
                    <Cell
                      key={i}
                      fill={i === bars.length - 1 ? TEAL : CANDY}
                      fillOpacity={i === bars.length - 1 ? 1 : 0.35}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex flex-col">
          <h4 className="font-semibold text-foreground mb-1">Talent distribution</h4>
          <p className="text-[11px] text-muted-foreground mb-2">Players vs. scouts</p>
          <div className="flex-1 min-h-[140px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="none"
                >
                  <Cell fill={TEAL} />
                  <Cell fill={CANDY} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">{playerPct}%</span>
              <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mt-0.5">
                Players
              </span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: TEAL }} />
                Players
              </div>
              <span className="font-semibold text-foreground">{stats.totalPlayers}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: CANDY }} />
                Scouts ({stats.activeScouts} active)
              </div>
              <span className="font-semibold text-foreground">{stats.totalScouts}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalyticsHero;
