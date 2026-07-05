import { createFileRoute } from "@tanstack/react-router";
import CountsPage from "@/pages/settings/CountsPage";
export const Route = createFileRoute("/player/settings/counts")({ component: CountsPage });
