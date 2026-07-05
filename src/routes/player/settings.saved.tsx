import { createFileRoute } from "@tanstack/react-router";
import SavedPage from "@/pages/settings/SavedPage";
export const Route = createFileRoute("/player/settings/saved")({ component: SavedPage });
