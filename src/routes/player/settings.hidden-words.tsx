import { createFileRoute } from "@tanstack/react-router";
import HiddenWordsPage from "@/pages/settings/HiddenWordsPage";
export const Route = createFileRoute("/player/settings/hidden-words")({ component: HiddenWordsPage });
