import { createFileRoute } from "@tanstack/react-router";
import DevicesPage from "@/pages/settings/DevicesPage";
export const Route = createFileRoute("/player/settings/devices")({ component: DevicesPage });
