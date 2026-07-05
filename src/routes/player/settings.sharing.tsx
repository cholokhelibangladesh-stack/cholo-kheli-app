import { createFileRoute } from "@tanstack/react-router";
import SharingPage from "@/pages/settings/SharingPage";
export const Route = createFileRoute("/player/settings/sharing")({ component: SharingPage });
