import { createFileRoute } from "@tanstack/react-router";
import StoryPage from "@/pages/settings/StoryPage";
export const Route = createFileRoute("/player/settings/story")({ component: StoryPage });
