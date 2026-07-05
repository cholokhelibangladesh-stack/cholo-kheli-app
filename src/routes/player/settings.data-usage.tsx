import { createFileRoute } from "@tanstack/react-router";
import DataUsagePage from "@/pages/settings/DataUsagePage";
export const Route = createFileRoute("/player/settings/data-usage")({ component: DataUsagePage });
