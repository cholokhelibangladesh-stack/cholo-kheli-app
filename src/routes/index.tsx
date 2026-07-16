import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import CholoKheliMark from "@/components/CholoKheliMark";
import heroBeat0 from "@/assets/hero-beat-008.jpg.asset.json";

const Index = lazy(() => import("@/pages/Index"));

function HomeBootFallback() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[hsl(0_0%_3%)] text-white">
      <img
        src={heroBeat0.url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.58),rgba(0,0,0,.18)_46%,rgba(0,0,0,.88))]" />
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-8">
        <CholoKheliMark className="h-14 w-20 drop-shadow-[0_2px_8px_rgba(0,0,0,.45)]" />
        <div className="pb-20">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.42em] text-[hsl(188_80%_78%)]">
            Welcome to
          </p>
          <h1 className="font-sf text-5xl font-black leading-[0.95] tracking-[0] sm:text-7xl">
            Cholo Kheli.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/88">
            Bangladesh's grassroots talent, verified scouts, and safe discovery in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

function IndexRoute() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <HomeBootFallback />;

  return (
    <Suspense fallback={<HomeBootFallback />}>
      <Index />
    </Suspense>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cholo Kheli — Bangladesh's home for grassroots sports talent" },
      {
        name: "description",
        content:
          "A safe, transparent platform connecting Bangladesh's grassroots football, cricket and basketball players with verified scouts.",
      },
      { property: "og:title", content: "Cholo Kheli — Let's Play" },
      {
        property: "og:description",
        content:
          "Where Bangladesh's grassroots talent meets verified scouts. Safe. Transparent. Built for the love of the game.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      // LCP candidate: first hero sprite atlas frame.
      {
        rel: "preload",
        as: "image",
        href: heroBeat0.url,
        fetchPriority: "high",
      } as any,

    ],
  }),
  component: IndexRoute,
});
