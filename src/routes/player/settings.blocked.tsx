import { createFileRoute } from "@tanstack/react-router";
import BlockedPage from "@/pages/settings/BlockedPage";
export const Route = createFileRoute("/player/settings/blocked")({ component: BlockedPage });
