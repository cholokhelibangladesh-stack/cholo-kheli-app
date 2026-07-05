import { createFileRoute } from "@tanstack/react-router";
import AccessibilityPage from "@/pages/settings/AccessibilityPage";
export const Route = createFileRoute("/player/settings/accessibility")({ component: AccessibilityPage });
