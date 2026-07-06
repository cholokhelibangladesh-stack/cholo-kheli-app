import { createFileRoute } from "@tanstack/react-router";
import Auth from "@/pages/Auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or sign up — Cholo Kheli" },
      {
        name: "description",
        content:
          "Sign in or create a Cholo Kheli account as a player or scout to access your dashboard.",
      },
      { property: "og:title", content: "Sign in — Cholo Kheli" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Auth,
});
