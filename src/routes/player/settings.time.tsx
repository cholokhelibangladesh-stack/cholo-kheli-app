import { createFileRoute } from "@tanstack/react-router";
import TimePage from "@/pages/settings/TimePage";
export const Route = createFileRoute("/player/settings/time")({ component: TimePage });
