import { createFileRoute } from "@tanstack/react-router";
import VerifiedPage from "@/pages/settings/VerifiedPage";
export const Route = createFileRoute("/player/settings/verified")({ component: VerifiedPage });
