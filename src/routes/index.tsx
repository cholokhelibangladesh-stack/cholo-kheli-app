import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import heroAtlas0 from "@/assets/hero-atlas-0.jpg.asset.json";

export const Route = createFileRoute("/")({
  ssr: false,
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
        href: heroAtlas0.url,
        fetchpriority: "high",
      } as any,
    ],
  }),
  component: Index,
});
