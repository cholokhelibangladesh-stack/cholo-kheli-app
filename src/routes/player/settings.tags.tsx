import { createFileRoute } from "@tanstack/react-router";
import TagsPage from "@/pages/settings/TagsPage";
export const Route = createFileRoute("/player/settings/tags")({ component: TagsPage });
