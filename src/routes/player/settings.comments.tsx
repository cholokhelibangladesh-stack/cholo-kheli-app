import { createFileRoute } from "@tanstack/react-router";
import CommentsPage from "@/pages/settings/CommentsPage";
export const Route = createFileRoute("/player/settings/comments")({ component: CommentsPage });
