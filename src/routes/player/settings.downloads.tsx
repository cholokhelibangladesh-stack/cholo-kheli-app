import { createFileRoute } from "@tanstack/react-router";
import DownloadsPage from "@/pages/settings/DownloadsPage";
export const Route = createFileRoute("/player/settings/downloads")({ component: DownloadsPage });
