import { createFileRoute } from "@tanstack/react-router";
import ArchivePage from "@/pages/settings/ArchivePage";
export const Route = createFileRoute("/player/settings/archive")({ component: ArchivePage });
