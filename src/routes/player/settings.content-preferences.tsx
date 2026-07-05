import { createFileRoute } from "@tanstack/react-router";
import ContentPreferencesPage from "@/pages/settings/ContentPreferencesPage";
export const Route = createFileRoute("/player/settings/content-preferences")({ component: ContentPreferencesPage });
